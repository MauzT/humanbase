import "server-only";

import { DEFAULT_DEVELOPMENT_USER_ID } from "@/lib/default-user";
import { prisma } from "@/lib/prisma";
import type { Contact, Note, Tag } from "@/types/humanbase";

export type NoteContactRelationship = {
  noteId: string;
  contactId: string;
};

export type NoteTagRelationship = {
  noteId: string;
  tagId: string;
};

export type TimelineData = {
  notes: Note[];
  contacts: Contact[];
  tags: Tag[];
};

type NoteWithRelationships = {
  id: string;
  title: string;
  content: string;
  date: Date;
  contacts: { contactId: string }[];
  tags: { tagId: string }[];
  createdAt: Date;
  updatedAt: Date;
};

function toContactSource(source: string): Contact["source"] {
  if (source === "manual" || source === "google") {
    return source;
  }

  throw new Error(`Unsupported contact source: ${source}`);
}

export function toUiNote(note: NoteWithRelationships): Note {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    date: note.date.toISOString().slice(0, 10),
    contactIds: note.contacts.map(({ contactId }) => contactId),
    tagIds: note.tags.map(({ tagId }) => tagId),
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

export function getDefaultDevelopmentUser() {
  return prisma.user.findUnique({
    where: { id: DEFAULT_DEVELOPMENT_USER_ID },
  });
}

export async function getNotesForUser(userId: string): Promise<Note[]> {
  const notes = await prisma.note.findMany({
    where: { userId },
    include: {
      contacts: {
        where: { contact: { userId } },
        select: { contactId: true },
      },
      tags: {
        where: { tag: { userId } },
        select: { tagId: true },
      },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return notes.map(toUiNote);
}

export function getNotesForDefaultDevelopmentUser(): Promise<Note[]> {
  return getNotesForUser(DEFAULT_DEVELOPMENT_USER_ID);
}

export async function getContactsForUser(userId: string): Promise<Contact[]> {
  const contacts = await prisma.contact.findMany({
    where: { userId },
    orderBy: { displayName: "asc" },
  });

  return contacts.map((contact) => ({
    id: contact.id,
    displayName: contact.displayName,
    email: contact.email ?? undefined,
    phone: contact.phone ?? undefined,
    avatarUrl: contact.avatarUrl ?? undefined,
    source: toContactSource(contact.source),
    externalProvider: contact.externalProvider ?? undefined,
    externalId: contact.externalId ?? undefined,
    lastSyncedAt: contact.lastSyncedAt?.toISOString(),
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  }));
}

export function getContactsForDefaultDevelopmentUser(): Promise<Contact[]> {
  return getContactsForUser(DEFAULT_DEVELOPMENT_USER_ID);
}

export async function getTagsForUser(userId: string): Promise<Tag[]> {
  const tags = await prisma.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color ?? undefined,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  }));
}

export function getTagsForDefaultDevelopmentUser(): Promise<Tag[]> {
  return getTagsForUser(DEFAULT_DEVELOPMENT_USER_ID);
}

export function getNoteContactsForUser(
  userId: string,
): Promise<NoteContactRelationship[]> {
  return prisma.noteContact.findMany({
    where: {
      note: { userId },
      contact: { userId },
    },
    select: { noteId: true, contactId: true },
    orderBy: [{ noteId: "asc" }, { contactId: "asc" }],
  });
}

export function getNoteContactsForDefaultDevelopmentUser(): Promise<
  NoteContactRelationship[]
> {
  return getNoteContactsForUser(DEFAULT_DEVELOPMENT_USER_ID);
}

export function getNoteTagsForUser(
  userId: string,
): Promise<NoteTagRelationship[]> {
  return prisma.noteTag.findMany({
    where: {
      note: { userId },
      tag: { userId },
    },
    select: { noteId: true, tagId: true },
    orderBy: [{ noteId: "asc" }, { tagId: "asc" }],
  });
}

export function getNoteTagsForDefaultDevelopmentUser(): Promise<
  NoteTagRelationship[]
> {
  return getNoteTagsForUser(DEFAULT_DEVELOPMENT_USER_ID);
}

export async function getTimelineDataForUser(
  userId: string,
): Promise<TimelineData> {
  const [notes, contacts, tags] = await Promise.all([
    getNotesForUser(userId),
    getContactsForUser(userId),
    getTagsForUser(userId),
  ]);

  return { notes, contacts, tags };
}

export function getTimelineDataForDefaultDevelopmentUser(): Promise<
  TimelineData
> {
  return getTimelineDataForUser(DEFAULT_DEVELOPMENT_USER_ID);
}
