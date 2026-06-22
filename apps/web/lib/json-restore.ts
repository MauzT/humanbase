import "server-only";

import { randomUUID } from "node:crypto";

import {
  HUMANBASE_JSON_EXPORT_FORMAT,
  HUMANBASE_JSON_EXPORT_VERSION,
  type HumanbaseJsonExport,
} from "@/lib/json-export-format";
import { prisma } from "@/lib/prisma";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const hexColorPattern = /^#[0-9a-f]{6}$/i;
const maximumCollectionSize = 100_000;

declare const validatedExportBrand: unique symbol;

export type ValidatedHumanbaseJsonExport = HumanbaseJsonExport & {
  readonly [validatedExportBrand]: true;
};

export type JsonRestoreResult = {
  exportedAt: string;
  notes: number;
  noteTemplates: number;
  contacts: number;
  tags: number;
  noteContacts: number;
  noteTags: number;
};

export class JsonRestoreValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JsonRestoreValidationError";
  }
}

function fail(message: string): never {
  throw new JsonRestoreValidationError(message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(
  value: unknown,
  label: string,
): Record<string, unknown> {
  if (!isRecord(value)) {
    fail(`${label} fehlt oder ist ungültig.`);
  }

  return value;
}

function requireArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    fail(`${label} fehlt oder ist ungültig.`);
  }

  if (value.length > maximumCollectionSize) {
    fail(`${label} enthält zu viele Einträge.`);
  }

  return value;
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string") {
    fail(`${label} fehlt oder ist ungültig.`);
  }

  return value;
}

function requireNullableString(
  value: unknown,
  label: string,
): string | null {
  if (value === null) {
    return null;
  }

  return requireString(value, label);
}

function requireBoolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") {
    fail(`${label} fehlt oder ist ungültig.`);
  }

  return value;
}

function requireUuid(value: unknown, label: string): string {
  const uuid = requireString(value, label);

  if (!uuidPattern.test(uuid)) {
    fail(`${label} ist keine gültige UUID.`);
  }

  return uuid;
}

function requireIsoDateTime(value: unknown, label: string): string {
  const dateTime = requireString(value, label);
  const parsed = new Date(dateTime);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString() !== dateTime
  ) {
    fail(`${label} ist kein gültiger ISO-Zeitpunkt.`);
  }

  return dateTime;
}

function requireDate(value: unknown, label: string): string {
  const date = requireString(value, label);

  if (!datePattern.test(date)) {
    fail(`${label} muss das Format YYYY-MM-DD verwenden.`);
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    fail(`${label} ist kein gültiges Datum.`);
  }

  return date;
}

function requireUnique(values: string[], label: string) {
  if (new Set(values).size !== values.length) {
    fail(`${label} enthält doppelte Werte.`);
  }
}

function parseMetadata(value: unknown): HumanbaseJsonExport["metadata"] {
  const metadata = requireRecord(value, "metadata");

  if (metadata.format !== HUMANBASE_JSON_EXPORT_FORMAT) {
    fail("Die Datei ist kein Humanbase-JSON-Export.");
  }

  if (metadata.version !== HUMANBASE_JSON_EXPORT_VERSION) {
    fail(
      `Die Exportversion wird nicht unterstützt. Erwartet wird Version ${HUMANBASE_JSON_EXPORT_VERSION}.`,
    );
  }

  return {
    format: HUMANBASE_JSON_EXPORT_FORMAT,
    version: HUMANBASE_JSON_EXPORT_VERSION,
    exportedAt: requireIsoDateTime(
      metadata.exportedAt,
      "metadata.exportedAt",
    ),
  };
}

function parseUser(value: unknown): HumanbaseJsonExport["user"] {
  const user = requireRecord(value, "user");

  return {
    id: requireUuid(user.id, "user.id"),
    createdAt: requireIsoDateTime(user.createdAt, "user.createdAt"),
    updatedAt: requireIsoDateTime(user.updatedAt, "user.updatedAt"),
  };
}

function parseNotes(
  value: unknown,
  exportedUserId: string,
): HumanbaseJsonExport["notes"] {
  return requireArray(value, "notes").map((entry, index) => {
    const note = requireRecord(entry, `notes[${index}]`);
    const userId = requireUuid(note.userId, `notes[${index}].userId`);

    if (userId !== exportedUserId) {
      fail(`notes[${index}] gehört nicht zum exportierten Nutzer.`);
    }

    return {
      id: requireUuid(note.id, `notes[${index}].id`),
      userId,
      title: requireString(note.title, `notes[${index}].title`),
      content: requireString(note.content, `notes[${index}].content`),
      date: requireDate(note.date, `notes[${index}].date`),
      createdAt: requireIsoDateTime(
        note.createdAt,
        `notes[${index}].createdAt`,
      ),
      updatedAt: requireIsoDateTime(
        note.updatedAt,
        `notes[${index}].updatedAt`,
      ),
    };
  });
}

function parseNoteTemplates(
  value: unknown,
  exportedUserId: string,
): HumanbaseJsonExport["noteTemplates"] {
  // Version 1 exports from before Phase 8.7 do not contain templates.
  if (value === undefined) {
    return [];
  }

  return requireArray(value, "noteTemplates").map((entry, index) => {
    const template = requireRecord(entry, `noteTemplates[${index}]`);
    const userId = requireUuid(
      template.userId,
      `noteTemplates[${index}].userId`,
    );
    const name = requireString(
      template.name,
      `noteTemplates[${index}].name`,
    );
    const questions = requireArray(
      template.questions,
      `noteTemplates[${index}].questions`,
    ).map((question, questionIndex) => {
      const parsedQuestion = requireString(
        question,
        `noteTemplates[${index}].questions[${questionIndex}]`,
      );

      if (!parsedQuestion.trim() || parsedQuestion.length > 200) {
        fail(
          `noteTemplates[${index}].questions[${questionIndex}] ist ungültig.`,
        );
      }

      return parsedQuestion;
    });

    if (userId !== exportedUserId) {
      fail(`noteTemplates[${index}] gehört nicht zum exportierten Nutzer.`);
    }

    if (!name.trim() || name.length > 80) {
      fail(`noteTemplates[${index}].name ist ungültig.`);
    }

    if (questions.length === 0 || questions.length > 30) {
      fail(`noteTemplates[${index}].questions ist ungültig.`);
    }

    return {
      id: requireUuid(template.id, `noteTemplates[${index}].id`),
      userId,
      name,
      questions,
      createdAt: requireIsoDateTime(
        template.createdAt,
        `noteTemplates[${index}].createdAt`,
      ),
      updatedAt: requireIsoDateTime(
        template.updatedAt,
        `noteTemplates[${index}].updatedAt`,
      ),
    };
  });
}

function parseContacts(
  value: unknown,
  exportedUserId: string,
): HumanbaseJsonExport["contacts"] {
  return requireArray(value, "contacts").map((entry, index) => {
    const contact = requireRecord(entry, `contacts[${index}]`);
    const userId = requireUuid(contact.userId, `contacts[${index}].userId`);
    const source = requireString(
      contact.source,
      `contacts[${index}].source`,
    );

    if (userId !== exportedUserId) {
      fail(`contacts[${index}] gehört nicht zum exportierten Nutzer.`);
    }

    if (source !== "manual" && source !== "google") {
      fail(`contacts[${index}].source wird nicht unterstützt.`);
    }

    return {
      id: requireUuid(contact.id, `contacts[${index}].id`),
      userId,
      displayName: requireString(
        contact.displayName,
        `contacts[${index}].displayName`,
      ),
      email: requireNullableString(
        contact.email,
        `contacts[${index}].email`,
      ),
      phone: requireNullableString(
        contact.phone,
        `contacts[${index}].phone`,
      ),
      avatarUrl: requireNullableString(
        contact.avatarUrl,
        `contacts[${index}].avatarUrl`,
      ),
      source,
      externalProvider: requireNullableString(
        contact.externalProvider,
        `contacts[${index}].externalProvider`,
      ),
      externalId: requireNullableString(
        contact.externalId,
        `contacts[${index}].externalId`,
      ),
      lastSyncedAt:
        contact.lastSyncedAt === null
          ? null
          : requireIsoDateTime(
              contact.lastSyncedAt,
              `contacts[${index}].lastSyncedAt`,
            ),
      // Early version-1 exports predate Google favorites. Missing means false.
      isFavorite:
        contact.isFavorite === undefined
          ? false
          : requireBoolean(
              contact.isFavorite,
              `contacts[${index}].isFavorite`,
            ),
      createdAt: requireIsoDateTime(
        contact.createdAt,
        `contacts[${index}].createdAt`,
      ),
      updatedAt: requireIsoDateTime(
        contact.updatedAt,
        `contacts[${index}].updatedAt`,
      ),
    };
  });
}

function parseTags(
  value: unknown,
  exportedUserId: string,
): HumanbaseJsonExport["tags"] {
  return requireArray(value, "tags").map((entry, index) => {
    const tag = requireRecord(entry, `tags[${index}]`);
    const userId = requireUuid(tag.userId, `tags[${index}].userId`);
    const color = requireNullableString(tag.color, `tags[${index}].color`);

    if (userId !== exportedUserId) {
      fail(`tags[${index}] gehört nicht zum exportierten Nutzer.`);
    }

    if (color !== null && !hexColorPattern.test(color)) {
      fail(`tags[${index}].color ist keine gültige Hex-Farbe.`);
    }

    return {
      id: requireUuid(tag.id, `tags[${index}].id`),
      userId,
      name: requireString(tag.name, `tags[${index}].name`),
      color,
      createdAt: requireIsoDateTime(
        tag.createdAt,
        `tags[${index}].createdAt`,
      ),
      updatedAt: requireIsoDateTime(
        tag.updatedAt,
        `tags[${index}].updatedAt`,
      ),
    };
  });
}

function parseNoteContacts(
  value: unknown,
): HumanbaseJsonExport["noteContacts"] {
  return requireArray(value, "noteContacts").map((entry, index) => {
    const relationship = requireRecord(entry, `noteContacts[${index}]`);

    return {
      noteId: requireUuid(
        relationship.noteId,
        `noteContacts[${index}].noteId`,
      ),
      contactId: requireUuid(
        relationship.contactId,
        `noteContacts[${index}].contactId`,
      ),
    };
  });
}

function parseNoteTags(value: unknown): HumanbaseJsonExport["noteTags"] {
  return requireArray(value, "noteTags").map((entry, index) => {
    const relationship = requireRecord(entry, `noteTags[${index}]`);

    return {
      noteId: requireUuid(
        relationship.noteId,
        `noteTags[${index}].noteId`,
      ),
      tagId: requireUuid(
        relationship.tagId,
        `noteTags[${index}].tagId`,
      ),
    };
  });
}

function validateUniquenessAndRelationships(data: HumanbaseJsonExport) {
  const noteIds = data.notes.map(({ id }) => id);
  const noteTemplateIds = data.noteTemplates.map(({ id }) => id);
  const contactIds = data.contacts.map(({ id }) => id);
  const tagIds = data.tags.map(({ id }) => id);

  requireUnique(noteIds, "notes.id");
  requireUnique(noteTemplateIds, "noteTemplates.id");
  requireUnique(
    data.noteTemplates.map(({ name }) => name.toLocaleLowerCase("de-DE")),
    "noteTemplates.name",
  );
  requireUnique(contactIds, "contacts.id");
  requireUnique(tagIds, "tags.id");
  requireUnique(
    data.tags.map(({ name }) => name.toLocaleLowerCase("de-DE")),
    "tags.name",
  );

  const externalContactKeys = data.contacts.flatMap(
    ({ externalProvider, externalId }) =>
      externalProvider !== null && externalId !== null
        ? [`${externalProvider}\u0000${externalId}`]
        : [],
  );
  requireUnique(
    externalContactKeys,
    "contacts.externalProvider/externalId",
  );

  requireUnique(
    data.noteContacts.map(({ noteId, contactId }) => `${noteId}\u0000${contactId}`),
    "noteContacts",
  );
  requireUnique(
    data.noteTags.map(({ noteId, tagId }) => `${noteId}\u0000${tagId}`),
    "noteTags",
  );

  const knownNoteIds = new Set(noteIds);
  const knownContactIds = new Set(contactIds);
  const knownTagIds = new Set(tagIds);

  data.noteContacts.forEach(({ noteId, contactId }, index) => {
    if (!knownNoteIds.has(noteId) || !knownContactIds.has(contactId)) {
      fail(`noteContacts[${index}] verweist auf einen unbekannten Datensatz.`);
    }
  });

  data.noteTags.forEach(({ noteId, tagId }, index) => {
    if (!knownNoteIds.has(noteId) || !knownTagIds.has(tagId)) {
      fail(`noteTags[${index}] verweist auf einen unbekannten Datensatz.`);
    }
  });
}

export function validateHumanbaseJsonExport(
  value: unknown,
): ValidatedHumanbaseJsonExport {
  const root = requireRecord(value, "JSON-Datei");
  const metadata = parseMetadata(root.metadata);
  const user = parseUser(root.user);
  const data: HumanbaseJsonExport = {
    metadata,
    user,
    notes: parseNotes(root.notes, user.id),
    noteTemplates: parseNoteTemplates(root.noteTemplates, user.id),
    contacts: parseContacts(root.contacts, user.id),
    tags: parseTags(root.tags, user.id),
    noteContacts: parseNoteContacts(root.noteContacts),
    noteTags: parseNoteTags(root.noteTags),
  };

  validateUniquenessAndRelationships(data);

  return data as ValidatedHumanbaseJsonExport;
}

export async function restoreValidatedUserJsonExport(
  userId: string,
  data: ValidatedHumanbaseJsonExport,
): Promise<JsonRestoreResult> {
  const noteIdMap = new Map(data.notes.map(({ id }) => [id, randomUUID()]));
  const noteTemplateIdMap = new Map(
    data.noteTemplates.map(({ id }) => [id, randomUUID()]),
  );
  const contactIdMap = new Map(
    data.contacts.map(({ id }) => [id, randomUUID()]),
  );
  const tagIdMap = new Map(data.tags.map(({ id }) => [id, randomUUID()]));

  await prisma.$transaction(
    async (transaction) => {
      const users = await transaction.$queryRaw<{ id: string }[]>`
        SELECT "id"
        FROM "User"
        WHERE "id" = ${userId}::uuid
        FOR UPDATE
      `;

      if (users.length !== 1) {
        throw new Error("Der angemeldete Humanbase-Nutzer wurde nicht gefunden.");
      }

      await transaction.note.deleteMany({ where: { userId } });
      await transaction.noteTemplate.deleteMany({ where: { userId } });
      await transaction.contact.deleteMany({ where: { userId } });
      await transaction.tag.deleteMany({ where: { userId } });

      if (data.notes.length > 0) {
        await transaction.note.createMany({
          data: data.notes.map((note) => ({
            id: noteIdMap.get(note.id)!,
            userId,
            title: note.title,
            content: note.content,
            date: new Date(`${note.date}T00:00:00.000Z`),
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
          })),
        });
      }

      if (data.contacts.length > 0) {
        await transaction.contact.createMany({
          data: data.contacts.map((contact) => ({
            id: contactIdMap.get(contact.id)!,
            userId,
            displayName: contact.displayName,
            email: contact.email,
            phone: contact.phone,
            avatarUrl: contact.avatarUrl,
            source: contact.source,
            externalProvider: contact.externalProvider,
            externalId: contact.externalId,
            lastSyncedAt: contact.lastSyncedAt
              ? new Date(contact.lastSyncedAt)
              : null,
            isFavorite: contact.isFavorite,
            createdAt: new Date(contact.createdAt),
            updatedAt: new Date(contact.updatedAt),
          })),
        });
      }

      if (data.noteTemplates.length > 0) {
        await transaction.noteTemplate.createMany({
          data: data.noteTemplates.map((template) => ({
            id: noteTemplateIdMap.get(template.id)!,
            userId,
            name: template.name,
            questions: template.questions,
            createdAt: new Date(template.createdAt),
            updatedAt: new Date(template.updatedAt),
          })),
        });
      }

      if (data.tags.length > 0) {
        await transaction.tag.createMany({
          data: data.tags.map((tag) => ({
            id: tagIdMap.get(tag.id)!,
            userId,
            name: tag.name,
            color: tag.color,
            createdAt: new Date(tag.createdAt),
            updatedAt: new Date(tag.updatedAt),
          })),
        });
      }

      if (data.noteContacts.length > 0) {
        await transaction.noteContact.createMany({
          data: data.noteContacts.map(({ noteId, contactId }) => ({
            noteId: noteIdMap.get(noteId)!,
            contactId: contactIdMap.get(contactId)!,
          })),
        });
      }

      if (data.noteTags.length > 0) {
        await transaction.noteTag.createMany({
          data: data.noteTags.map(({ noteId, tagId }) => ({
            noteId: noteIdMap.get(noteId)!,
            tagId: tagIdMap.get(tagId)!,
          })),
        });
      }
    },
    {
      isolationLevel: "Serializable",
      maxWait: 10_000,
      timeout: 30_000,
    },
  );

  return {
    exportedAt: data.metadata.exportedAt,
    notes: data.notes.length,
    noteTemplates: data.noteTemplates.length,
    contacts: data.contacts.length,
    tags: data.tags.length,
    noteContacts: data.noteContacts.length,
    noteTags: data.noteTags.length,
  };
}

export async function restoreUserJsonExport(
  userId: string,
  value: unknown,
): Promise<JsonRestoreResult> {
  const data = validateHumanbaseJsonExport(value);
  return restoreValidatedUserJsonExport(userId, data);
}
