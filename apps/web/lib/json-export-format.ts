export const HUMANBASE_JSON_EXPORT_FORMAT = "humanbase-json-export" as const;
export const HUMANBASE_JSON_EXPORT_VERSION = 1 as const;
export const MAXIMUM_JSON_RESTORE_FILE_SIZE = 10 * 1024 * 1024;

export type HumanbaseJsonExport = {
  metadata: {
    format: typeof HUMANBASE_JSON_EXPORT_FORMAT;
    version: typeof HUMANBASE_JSON_EXPORT_VERSION;
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
  noteTemplates: {
    id: string;
    userId: string;
    name: string;
    questions: string[];
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
