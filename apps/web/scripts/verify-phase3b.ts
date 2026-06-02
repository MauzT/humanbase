import {
  createNoteForDefaultDevelopmentUser,
  deleteNoteForDefaultDevelopmentUser,
  updateNoteForDefaultDevelopmentUser,
} from "../app/actions";
import {
  getNoteContactsForDefaultDevelopmentUser,
  getNotesForDefaultDevelopmentUser,
  getNoteTagsForDefaultDevelopmentUser,
  getTimelineDataForDefaultDevelopmentUser,
} from "../lib/humanbase-data";
import { prisma } from "../lib/prisma";

type VerificationResult = {
  contacts: number;
  createVisibleThroughReadLayer: boolean;
  deleteRemovedNote: boolean;
  deleteRemovedRelationships: boolean;
  invalidCreateRejected: boolean;
  missingDeleteRejected: boolean;
  notesAfterCleanup: number;
  notesAfterCreate: number;
  notesAfterDelete: number;
  notesBefore: number;
  noteContactRelationships: number;
  noteTagRelationships: number;
  tags: number;
  updateVisibleThroughReadLayer: boolean;
  updatedContactLinks: number;
  updatedTagLinks: number;
};

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  let createdNoteId: string | undefined;

  try {
    const timelineBefore = await getTimelineDataForDefaultDevelopmentUser();
    const noteContactsBefore =
      await getNoteContactsForDefaultDevelopmentUser();
    const noteTagsBefore = await getNoteTagsForDefaultDevelopmentUser();

    assert(timelineBefore.notes.length >= 4, "Expected seeded notes.");
    assert(timelineBefore.contacts.length >= 3, "Expected seeded contacts.");
    assert(timelineBefore.tags.length >= 4, "Expected seeded tags.");
    assert(
      noteContactsBefore.length >= 5,
      "Expected seeded note-contact relationships.",
    );
    assert(
      noteTagsBefore.length >= 9,
      "Expected seeded note-tag relationships.",
    );

    const invalidCreate = await createNoteForDefaultDevelopmentUser({
      title: "Invalid Phase 3B verification",
      content: "This must not be written.",
      date: "2026-02-31",
      contactIds: [],
      tagIds: [],
    });
    const notesAfterInvalidCreate = await getNotesForDefaultDevelopmentUser();

    assert(!invalidCreate.ok, "Invalid create input should be rejected.");
    assert(
      notesAfterInvalidCreate.length === timelineBefore.notes.length,
      "Invalid create input should not change note count.",
    );

    const created = await createNoteForDefaultDevelopmentUser({
      title: "Phase 3B verification note",
      content: "Temporary note created by verify:phase3b.",
      date: "2026-06-03",
      contactIds: timelineBefore.contacts.slice(0, 2).map(({ id }) => id),
      tagIds: timelineBefore.tags.slice(0, 2).map(({ id }) => id),
    });

    assert(created.ok, created.ok ? "" : created.error);
    createdNoteId = created.note.id;

    const timelineAfterCreate =
      await getTimelineDataForDefaultDevelopmentUser();
    const createdVisibleThroughReadLayer = timelineAfterCreate.notes.some(
      ({ id }) => id === createdNoteId,
    );

    assert(
      timelineAfterCreate.notes.length === timelineBefore.notes.length + 1,
      "Create should add exactly one note.",
    );
    assert(
      createdVisibleThroughReadLayer,
      "Created note should be visible through the read layer.",
    );

    const updated = await updateNoteForDefaultDevelopmentUser({
      id: createdNoteId,
      title: "Phase 3B verification note updated",
      content: "Temporary note updated by verify:phase3b.",
      date: "2026-06-02",
      contactIds: timelineBefore.contacts.slice(2, 3).map(({ id }) => id),
      tagIds: timelineBefore.tags.slice(2, 4).map(({ id }) => id),
    });

    assert(updated.ok, updated.ok ? "" : updated.error);

    const persistedAfterUpdate = await prisma.note.findUnique({
      where: { id: createdNoteId },
      include: { contacts: true, tags: true },
    });
    const timelineAfterUpdate =
      await getTimelineDataForDefaultDevelopmentUser();
    const updateVisibleThroughReadLayer = timelineAfterUpdate.notes.some(
      (note) =>
        note.id === createdNoteId &&
        note.title === "Phase 3B verification note updated" &&
        note.date === "2026-06-02",
    );

    assert(persistedAfterUpdate !== null, "Updated note should exist.");
    assert(
      persistedAfterUpdate.contacts.length === 1,
      "Update should replace contact relationships.",
    );
    assert(
      persistedAfterUpdate.tags.length === 2,
      "Update should replace tag relationships.",
    );
    assert(
      updateVisibleThroughReadLayer,
      "Updated note should be visible through the read layer.",
    );

    const deleted = await deleteNoteForDefaultDevelopmentUser(createdNoteId);

    assert(deleted.ok, deleted.ok ? "" : deleted.error);

    const noteAfterDelete = await prisma.note.findUnique({
      where: { id: createdNoteId },
    });
    const contactLinksAfterDelete = await prisma.noteContact.count({
      where: { noteId: createdNoteId },
    });
    const tagLinksAfterDelete = await prisma.noteTag.count({
      where: { noteId: createdNoteId },
    });
    const timelineAfterDelete =
      await getTimelineDataForDefaultDevelopmentUser();
    const missingDelete = await deleteNoteForDefaultDevelopmentUser(
      createdNoteId,
    );

    assert(noteAfterDelete === null, "Delete should remove the note.");
    assert(
      contactLinksAfterDelete === 0 && tagLinksAfterDelete === 0,
      "Delete should cascade relationship cleanup.",
    );
    assert(
      timelineAfterDelete.notes.length === timelineBefore.notes.length,
      "Delete should restore the original note count.",
    );
    assert(!missingDelete.ok, "Deleting a missing note should be rejected.");

    createdNoteId = undefined;

    const result: VerificationResult = {
      contacts: timelineBefore.contacts.length,
      createVisibleThroughReadLayer: createdVisibleThroughReadLayer,
      deleteRemovedNote: noteAfterDelete === null,
      deleteRemovedRelationships:
        contactLinksAfterDelete === 0 && tagLinksAfterDelete === 0,
      invalidCreateRejected: !invalidCreate.ok,
      missingDeleteRejected: !missingDelete.ok,
      notesAfterCleanup: timelineAfterDelete.notes.length,
      notesAfterCreate: timelineAfterCreate.notes.length,
      notesAfterDelete: timelineAfterDelete.notes.length,
      notesBefore: timelineBefore.notes.length,
      noteContactRelationships: noteContactsBefore.length,
      noteTagRelationships: noteTagsBefore.length,
      tags: timelineBefore.tags.length,
      updateVisibleThroughReadLayer: updateVisibleThroughReadLayer,
      updatedContactLinks: persistedAfterUpdate.contacts.length,
      updatedTagLinks: persistedAfterUpdate.tags.length,
    };

    console.log("Phase 3B verification passed:");
    console.log(JSON.stringify(result, null, 2));
  } finally {
    if (createdNoteId) {
      await prisma.note.delete({ where: { id: createdNoteId } });
      console.log("Cleaned up unfinished verification note.");
    }

    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Phase 3B verification failed:");
  console.error(error);
  process.exitCode = 1;
});
