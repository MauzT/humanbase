export type Note = {
  id: string;
  title: string;
  content: string;
  date: string;
  contactIds: string[];
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type NoteTemplate = {
  id: string;
  name: string;
  questions: string[];
  createdAt: string;
  updatedAt: string;
};

export type Contact = {
  id: string;
  displayName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  source: "manual" | "google";
  externalProvider?: string;
  externalId?: string;
  lastSyncedAt?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Tag = {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
};
