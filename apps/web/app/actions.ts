"use server";

import { DEFAULT_DEVELOPMENT_USER_ID } from "@/lib/default-user";
import { toUiNote } from "@/lib/humanbase-data";
import { prisma } from "@/lib/prisma";
import type { Note } from "@/types/humanbase";

type CreateNoteInput = Pick<
  Note,
  "title" | "content" | "date" | "contactIds" | "tagIds"
>;

type UpdateNoteInput = CreateNoteInput & Pick<Note, "id">;

type ValidatedNoteInput = CreateNoteInput & {
  dateValue: Date;
};

export type CreateNoteResult =
  | { ok: true; note: Note }
  | { ok: false; error: string };

export type UpdateNoteResult = CreateNoteResult;

export type DeleteNoteResult =
  | { ok: true }
  | { ok: false; error: string };

const requiredNoteFieldsError =
  "Titel, Inhalt und ein gueltiges Datum sind erforderlich.";
const invalidRelationshipError =
  "Mindestens ein ausgewaehlter Kontakt oder Tag ist ungueltig.";
const missingDevelopmentUserError =
  "Der Entwicklungsnutzer fehlt. Fuehre npx.cmd prisma db seed aus.";
const saveNoteError =
  "Die Notiz konnte nicht gespeichert werden. Pruefe PostgreSQL und DATABASE_URL.";
const deleteNoteError =
  "Die Notiz konnte nicht geloescht werden. Pruefe PostgreSQL und DATABASE_URL.";

function getUniqueIds(ids: string[]) {
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) {
    return null;
  }

  return [...new Set(ids)];
}

function getNoteDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  const noteDate = new Date(`${date}T00:00:00.000Z`);

  if (Number.isNaN(noteDate.getTime())) {
    return null;
  }

  return noteDate.toISOString().slice(0, 10) === date ? noteDate : null;
}

function validateNoteInput(input: CreateNoteInput): ValidatedNoteInput | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const title = typeof input.title === "string" ? input.title.trim() : "";
  const content =
    typeof input.content === "string" ? input.content.trim() : "";
  const noteDate = typeof input.date === "string" ? getNoteDate(input.date) : null;
  const contactIds = getUniqueIds(input.contactIds);
  const tagIds = getUniqueIds(input.tagIds);

  if (!title || !content || !noteDate || !contactIds || !tagIds) {
    return null;
  }

  return {
    title,
    content,
    date: input.date,
    dateValue: noteDate,
    contactIds,
    tagIds,
  };
}

async function validateDefaultUserRelationships(
  contactIds: string[],
  tagIds: string[],
) {
  const [user, contacts, tags] = await Promise.all([
    prisma.user.findUnique({
      where: { id: DEFAULT_DEVELOPMENT_USER_ID },
      select: { id: true },
    }),
    prisma.contact.findMany({
      where: {
        id: { in: contactIds },
        userId: DEFAULT_DEVELOPMENT_USER_ID,
      },
      select: { id: true },
    }),
    prisma.tag.findMany({
      where: {
        id: { in: tagIds },
        userId: DEFAULT_DEVELOPMENT_USER_ID,
      },
      select: { id: true },
    }),
  ]);

  if (!user) {
    return {
      ok: false,
      error: missingDevelopmentUserError,
    } as const;
  }

  if (contacts.length !== contactIds.length || tags.length !== tagIds.length) {
    return {
      ok: false,
      error: invalidRelationshipError,
    } as const;
  }

  return { ok: true } as const;
}

export async function createNoteForDefaultDevelopmentUser(
  input: CreateNoteInput,
): Promise<CreateNoteResult> {
  const validatedInput = validateNoteInput(input);

  if (!validatedInput) {
    return {
      ok: false,
      error: requiredNoteFieldsError,
    };
  }

  try {
    const validation = await validateDefaultUserRelationships(
      validatedInput.contactIds,
      validatedInput.tagIds,
    );

    if (!validation.ok) {
      return validation;
    }

    const note = await prisma.note.create({
      data: {
        userId: DEFAULT_DEVELOPMENT_USER_ID,
        title: validatedInput.title,
        content: validatedInput.content,
        date: validatedInput.dateValue,
        contacts: {
          create: validatedInput.contactIds.map((contactId) => ({ contactId })),
        },
        tags: {
          create: validatedInput.tagIds.map((tagId) => ({ tagId })),
        },
      },
      include: {
        contacts: { select: { contactId: true } },
        tags: { select: { tagId: true } },
      },
    });

    return { ok: true, note: toUiNote(note) };
  } catch (error) {
    console.error("Could not create note.", error);

    return {
      ok: false,
      error: saveNoteError,
    };
  }
}

export async function updateNoteForDefaultDevelopmentUser(
  input: UpdateNoteInput,
): Promise<UpdateNoteResult> {
  if (!input || typeof input !== "object" || typeof input.id !== "string") {
    return {
      ok: false,
      error: "Die Notiz konnte nicht aktualisiert werden.",
    };
  }

  const validatedInput = validateNoteInput(input);

  if (!validatedInput) {
    return {
      ok: false,
      error: requiredNoteFieldsError,
    };
  }

  try {
    const [note, validation] = await Promise.all([
      prisma.note.findFirst({
        where: {
          id: input.id,
          userId: DEFAULT_DEVELOPMENT_USER_ID,
        },
        select: { id: true },
      }),
      validateDefaultUserRelationships(
        validatedInput.contactIds,
        validatedInput.tagIds,
      ),
    ]);

    if (!validation.ok) {
      return validation;
    }

    if (!note) {
      return {
        ok: false,
        error: "Die Notiz wurde nicht gefunden.",
      };
    }

    const updatedNote = await prisma.note.update({
      where: { id: note.id },
      data: {
        title: validatedInput.title,
        content: validatedInput.content,
        date: validatedInput.dateValue,
        contacts: {
          deleteMany: {},
          create: validatedInput.contactIds.map((contactId) => ({ contactId })),
        },
        tags: {
          deleteMany: {},
          create: validatedInput.tagIds.map((tagId) => ({ tagId })),
        },
      },
      include: {
        contacts: { select: { contactId: true } },
        tags: { select: { tagId: true } },
      },
    });

    return { ok: true, note: toUiNote(updatedNote) };
  } catch (error) {
    console.error("Could not update note.", error);

    return {
      ok: false,
      error: saveNoteError,
    };
  }
}

export async function deleteNoteForDefaultDevelopmentUser(
  noteId: string,
): Promise<DeleteNoteResult> {
  if (typeof noteId !== "string") {
    return {
      ok: false,
      error: "Die Notiz konnte nicht geloescht werden.",
    };
  }

  try {
    const result = await prisma.note.deleteMany({
      where: {
        id: noteId,
        userId: DEFAULT_DEVELOPMENT_USER_ID,
      },
    });

    if (result.count === 0) {
      return {
        ok: false,
        error: "Die Notiz wurde nicht gefunden.",
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("Could not delete note.", error);

    return {
      ok: false,
      error: deleteNoteError,
    };
  }
}
