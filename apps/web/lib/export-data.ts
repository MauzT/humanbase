import "server-only";

import { DEFAULT_DEVELOPMENT_USER_ID } from "@/lib/default-user";
import { prisma } from "@/lib/prisma";

export type HumanbaseJsonExport = {
  metadata: {
    format: "humanbase-json-export";
    version: 1;
    exportedAt: string;
  };
  user: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  notes: {
    id: string;
    userId: string;
    title: string;
    content: string;
    date: string;
    createdAt: string;
    updatedAt: string;
  }[];
  contacts: {
    id: string;
    userId: string;
    displayName: string;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
    source: string;
    externalProvider: string | null;
    externalId: string | null;
    lastSyncedAt: string | null;
    isFavorite: boolean;
    createdAt: string;
    updatedAt: string;
  }[];
  tags: {
    id: string;
    userId: string;
    name: string;
    color: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
  noteContacts: {
    noteId: string;
    contactId: string;
  }[];
  noteTags: {
    noteId: string;
    tagId: string;
  }[];
};

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
      format: "humanbase-json-export",
      version: 1,
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
