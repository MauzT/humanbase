import { DEFAULT_DEVELOPMENT_USER_ID } from "../lib/default-user";
import { buildDefaultDevelopmentUserJsonExport } from "../lib/export-data";
import { prisma } from "../lib/prisma";

type VerificationResult = {
  contacts: number;
  exportFormat: string;
  exportVersion: number;
  noteContacts: number;
  noteTags: number;
  notes: number;
  relationshipsReferenceKnownRecords: boolean;
  tags: number;
  userId: string;
};

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function hasOnlyUniqueValues(values: string[]) {
  return new Set(values).size === values.length;
}

async function main() {
  const exportData = await buildDefaultDevelopmentUserJsonExport();

  assert(
    exportData.metadata.format === "humanbase-json-export",
    "Export format should identify Humanbase JSON exports.",
  );
  assert(exportData.metadata.version === 1, "Export version should be 1.");
  assert(
    exportData.user.id === DEFAULT_DEVELOPMENT_USER_ID,
    "Export should include the default development user.",
  );

  const [noteCount, contactCount, tagCount, noteContactCount, noteTagCount] =
    await Promise.all([
      prisma.note.count({ where: { userId: DEFAULT_DEVELOPMENT_USER_ID } }),
      prisma.contact.count({ where: { userId: DEFAULT_DEVELOPMENT_USER_ID } }),
      prisma.tag.count({ where: { userId: DEFAULT_DEVELOPMENT_USER_ID } }),
      prisma.noteContact.count({
        where: {
          note: { userId: DEFAULT_DEVELOPMENT_USER_ID },
          contact: { userId: DEFAULT_DEVELOPMENT_USER_ID },
        },
      }),
      prisma.noteTag.count({
        where: {
          note: { userId: DEFAULT_DEVELOPMENT_USER_ID },
          tag: { userId: DEFAULT_DEVELOPMENT_USER_ID },
        },
      }),
    ]);

  assert(exportData.notes.length === noteCount, "Exported note count differs.");
  assert(
    exportData.contacts.length === contactCount,
    "Exported contact count differs.",
  );
  assert(exportData.tags.length === tagCount, "Exported tag count differs.");
  assert(
    exportData.noteContacts.length === noteContactCount,
    "Exported note-contact relationship count differs.",
  );
  assert(
    exportData.noteTags.length === noteTagCount,
    "Exported note-tag relationship count differs.",
  );

  assert(
    exportData.notes.every(({ userId }) => userId === DEFAULT_DEVELOPMENT_USER_ID),
    "Every exported note should belong to the default development user.",
  );
  assert(
    exportData.contacts.every(
      ({ userId }) => userId === DEFAULT_DEVELOPMENT_USER_ID,
    ),
    "Every exported contact should belong to the default development user.",
  );
  assert(
    exportData.tags.every(({ userId }) => userId === DEFAULT_DEVELOPMENT_USER_ID),
    "Every exported tag should belong to the default development user.",
  );

  assert(
    hasOnlyUniqueValues(exportData.notes.map(({ id }) => id)),
    "Exported note IDs should be unique.",
  );
  assert(
    hasOnlyUniqueValues(exportData.contacts.map(({ id }) => id)),
    "Exported contact IDs should be unique.",
  );
  assert(
    hasOnlyUniqueValues(exportData.tags.map(({ id }) => id)),
    "Exported tag IDs should be unique.",
  );

  const noteIds = new Set(exportData.notes.map(({ id }) => id));
  const contactIds = new Set(exportData.contacts.map(({ id }) => id));
  const tagIds = new Set(exportData.tags.map(({ id }) => id));
  const relationshipsReferenceKnownRecords =
    exportData.noteContacts.every(
      ({ noteId, contactId }) => noteIds.has(noteId) && contactIds.has(contactId),
    ) &&
    exportData.noteTags.every(
      ({ noteId, tagId }) => noteIds.has(noteId) && tagIds.has(tagId),
    );

  assert(
    relationshipsReferenceKnownRecords,
    "Exported relationships should reference exported records.",
  );

  const result: VerificationResult = {
    contacts: exportData.contacts.length,
    exportFormat: exportData.metadata.format,
    exportVersion: exportData.metadata.version,
    noteContacts: exportData.noteContacts.length,
    noteTags: exportData.noteTags.length,
    notes: exportData.notes.length,
    relationshipsReferenceKnownRecords,
    tags: exportData.tags.length,
    userId: exportData.user.id,
  };

  console.log("Phase 3C verification passed:");
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error("Phase 3C verification failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
