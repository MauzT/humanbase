import "server-only";

import { DEFAULT_DEVELOPMENT_USER_ID } from "@/lib/default-user";
import { prisma } from "@/lib/prisma";
import type { NoteTemplate } from "@/types/humanbase";

type NoteTemplateInput = {
  name: string;
  questions: string[];
};

type UpdateNoteTemplateInput = NoteTemplateInput & {
  id: string;
};

export type SaveNoteTemplateResult =
  | { ok: true; template: NoteTemplate }
  | { ok: false; error: string };

export type DeleteNoteTemplateResult =
  | { ok: true; templateId: string }
  | { ok: false; error: string };

const maximumTemplateNameLength = 80;
const maximumQuestionLength = 200;
const maximumQuestions = 30;

function toUiNoteTemplate(template: {
  id: string;
  name: string;
  questions: string[];
  createdAt: Date;
  updatedAt: Date;
}): NoteTemplate {
  return {
    id: template.id,
    name: template.name,
    questions: template.questions,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  };
}

function validateInput(input: NoteTemplateInput) {
  if (!input || typeof input !== "object" || !Array.isArray(input.questions)) {
    return null;
  }

  const name = typeof input.name === "string" ? input.name.trim() : "";
  const questions = input.questions
    .map((question) => (typeof question === "string" ? question.trim() : ""))
    .filter(Boolean);

  if (
    !name ||
    name.length > maximumTemplateNameLength ||
    questions.length === 0 ||
    questions.length > maximumQuestions ||
    questions.some((question) => question.length > maximumQuestionLength)
  ) {
    return null;
  }

  return { name, questions };
}

async function hasNameConflict(
  userId: string,
  name: string,
  excludedTemplateId?: string,
) {
  const templates = await prisma.noteTemplate.findMany({
    where: {
      userId,
      ...(excludedTemplateId ? { id: { not: excludedTemplateId } } : {}),
    },
    select: { name: true },
  });
  const normalizedName = name.toLocaleLowerCase("de-DE");

  return templates.some(
    (template) =>
      template.name.toLocaleLowerCase("de-DE") === normalizedName,
  );
}

export async function createNoteTemplateForUser(
  userId: string,
  input: NoteTemplateInput,
): Promise<SaveNoteTemplateResult> {
  const validatedInput = validateInput(input);

  if (!validatedInput) {
    return {
      ok: false,
      error:
        "Name und mindestens eine Frage sind erforderlich. Eine Vorlage kann bis zu 30 Fragen enthalten.",
    };
  }

  try {
    if (await hasNameConflict(userId, validatedInput.name)) {
      return {
        ok: false,
        error: "Eine Vorlage mit diesem Namen existiert bereits.",
      };
    }

    const template = await prisma.noteTemplate.create({
      data: {
        userId,
        name: validatedInput.name,
        questions: validatedInput.questions,
      },
    });

    return { ok: true, template: toUiNoteTemplate(template) };
  } catch (error) {
    console.error("Could not create note template.", error);
    return { ok: false, error: "Die Vorlage konnte nicht erstellt werden." };
  }
}

export async function updateNoteTemplateForUser(
  userId: string,
  input: UpdateNoteTemplateInput,
): Promise<SaveNoteTemplateResult> {
  const validatedInput = validateInput(input);

  if (!validatedInput || typeof input.id !== "string") {
    return {
      ok: false,
      error:
        "Name und mindestens eine Frage sind erforderlich. Eine Vorlage kann bis zu 30 Fragen enthalten.",
    };
  }

  try {
    const [template, nameConflict] = await Promise.all([
      prisma.noteTemplate.findFirst({
        where: { id: input.id, userId },
        select: { id: true },
      }),
      hasNameConflict(userId, validatedInput.name, input.id),
    ]);

    if (!template) {
      return { ok: false, error: "Die Vorlage wurde nicht gefunden." };
    }

    if (nameConflict) {
      return {
        ok: false,
        error: "Eine Vorlage mit diesem Namen existiert bereits.",
      };
    }

    const updatedTemplate = await prisma.noteTemplate.update({
      where: { id: template.id },
      data: validatedInput,
    });

    return { ok: true, template: toUiNoteTemplate(updatedTemplate) };
  } catch (error) {
    console.error("Could not update note template.", error);
    return { ok: false, error: "Die Vorlage konnte nicht gespeichert werden." };
  }
}

export async function deleteNoteTemplateForUser(
  userId: string,
  templateId: string,
): Promise<DeleteNoteTemplateResult> {
  if (typeof templateId !== "string") {
    return { ok: false, error: "Die Vorlage konnte nicht gelöscht werden." };
  }

  try {
    const result = await prisma.noteTemplate.deleteMany({
      where: { id: templateId, userId },
    });

    if (result.count === 0) {
      return { ok: false, error: "Die Vorlage wurde nicht gefunden." };
    }

    return { ok: true, templateId };
  } catch (error) {
    console.error("Could not delete note template.", error);
    return { ok: false, error: "Die Vorlage konnte nicht gelöscht werden." };
  }
}

export function createNoteTemplateForDefaultDevelopmentUser(
  input: NoteTemplateInput,
) {
  return createNoteTemplateForUser(DEFAULT_DEVELOPMENT_USER_ID, input);
}

export function updateNoteTemplateForDefaultDevelopmentUser(
  input: UpdateNoteTemplateInput,
) {
  return updateNoteTemplateForUser(DEFAULT_DEVELOPMENT_USER_ID, input);
}

export function deleteNoteTemplateForDefaultDevelopmentUser(
  templateId: string,
) {
  return deleteNoteTemplateForUser(
    DEFAULT_DEVELOPMENT_USER_ID,
    templateId,
  );
}
