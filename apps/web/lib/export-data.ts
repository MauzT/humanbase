import "server-only";

import { DEFAULT_DEVELOPMENT_USER_ID } from "@/lib/default-user";
import {
  HUMANBASE_JSON_EXPORT_FORMAT,
  HUMANBASE_JSON_EXPORT_VERSION,
  type HumanbaseJsonExport,
} from "@/lib/json-export-format";
import { prisma } from "@/lib/prisma";

function toIsoString(value: Date) {
  return value.toISOString();
}

function toDateString(value: Date) {
  return value.toISOString().slice(0, 10);
}

export async function buildUserJsonExport(
  userId: string,
  missingUserMessage = "The user is missing.",
): Promise<HumanbaseJsonExport> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(missingUserMessage);
  }

  const [notes, contacts, tags, noteContacts, noteTags] = await Promise.all([
    prisma.note.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }, { id: "asc" }],
    }),
    prisma.contact.findMany({
      where: { userId },
      orderBy: [{ displayName: "asc" }, { id: "asc" }],
    }),
    prisma.tag.findMany({
      where: { userId },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    }),
    prisma.noteContact.findMany({
      where: {
        note: { userId },
        contact: { userId },
      },
      orderBy: [{ noteId: "asc" }, { contactId: "asc" }],
    }),
    prisma.noteTag.findMany({
      where: {
        note: { userId },
        tag: { userId },
      },
      orderBy: [{ noteId: "asc" }, { tagId: "asc" }],
    }),
  ]);

  return {
    metadata: {
      format: HUMANBASE_JSON_EXPORT_FORMAT,
      version: HUMANBASE_JSON_EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
    },
    user: {
      id: user.id,
      createdAt: toIsoString(user.createdAt),
      updatedAt: toIsoString(user.updatedAt),
    },
    notes: notes.map((note) => ({
      id: note.id,
      userId: note.userId,
      title: note.title,
      content: note.content,
      date: toDateString(note.date),
      createdAt: toIsoString(note.createdAt),
      updatedAt: toIsoString(note.updatedAt),
    })),
    contacts: contacts.map((contact) => ({
      id: contact.id,
      userId: contact.userId,
      displayName: contact.displayName,
      email: contact.email,
      phone: contact.phone,
      avatarUrl: contact.avatarUrl,
      source: contact.source,
      externalProvider: contact.externalProvider,
      externalId: contact.externalId,
      lastSyncedAt: contact.lastSyncedAt
        ? toIsoString(contact.lastSyncedAt)
        : null,
      isFavorite: contact.isFavorite,
      createdAt: toIsoString(contact.createdAt),
      updatedAt: toIsoString(contact.updatedAt),
    })),
    tags: tags.map((tag) => ({
      id: tag.id,
      userId: tag.userId,
      name: tag.name,
      color: tag.color,
      createdAt: toIsoString(tag.createdAt),
      updatedAt: toIsoString(tag.updatedAt),
    })),
    noteContacts: noteContacts.map(({ noteId, contactId }) => ({
      noteId,
      contactId,
    })),
    noteTags: noteTags.map(({ noteId, tagId }) => ({
      noteId,
      tagId,
    })),
  };
}

export async function buildDefaultDevelopmentUserJsonExport(): Promise<HumanbaseJsonExport> {
  return buildUserJsonExport(
    DEFAULT_DEVELOPMENT_USER_ID,
    "The default development user is missing. Run npx.cmd prisma db seed first.",
  );
}
