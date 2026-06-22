import { randomUUID } from "node:crypto";

import { buildUserJsonExport } from "../lib/export-data";
import type { HumanbaseJsonExport } from "../lib/json-export-format";
import {
  JsonRestoreValidationError,
  restoreUserJsonExport,
  restoreValidatedUserJsonExport,
  validateHumanbaseJsonExport,
  type ValidatedHumanbaseJsonExport,
} from "../lib/json-restore";
import { prisma } from "../lib/prisma";

type VerificationResult = {
  authenticationMappingPreserved: boolean;
  invalidExportLeftDataUntouched: boolean;
  legacyVersion1ContactAccepted: boolean;
  relationshipsRestored: boolean;
  sourceIdsRemapped: boolean;
  transactionRollbackPreservedData: boolean;
};

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function dataFingerprint(data: HumanbaseJsonExport) {
  return JSON.stringify({
    notes: data.notes,
    noteTemplates: data.noteTemplates,
    contacts: data.contacts,
    tags: data.tags,
    noteContacts: data.noteContacts,
    noteTags: data.noteTags,
  });
}

async function fingerprintUserData(userId: string) {
  return dataFingerprint(await buildUserJsonExport(userId));
}

async function main() {
  const testId = randomUUID();
  const sourceUserId = randomUUID();
  const targetUserId = randomUUID();
  const sourceNoteId = randomUUID();
  const sourceContactId = randomUUID();
  const sourceTagId = randomUUID();
  const targetAuthId = `phase8-5-target-${testId}`;
  let sourceUserCreated = false;
  let targetUserCreated = false;

  try {
    await prisma.user.create({
      data: {
        id: sourceUserId,
        email: `phase8-5-source-${testId}@example.invalid`,
        supabaseAuthUserId: `phase8-5-source-${testId}`,
      },
    });
    sourceUserCreated = true;

    await prisma.contact.create({
      data: {
        id: sourceContactId,
        userId: sourceUserId,
        displayName: "Restore Kontakt",
        email: "restore@example.invalid",
        source: "manual",
        isFavorite: true,
      },
    });
    await prisma.tag.create({
      data: {
        id: sourceTagId,
        userId: sourceUserId,
        name: "Restore",
        color: "#3f7c6d",
      },
    });
    await prisma.note.create({
      data: {
        id: sourceNoteId,
        userId: sourceUserId,
        title: "Wiederhergestellte Notiz",
        content: "Diese Notiz prüft den atomaren JSON-Restore.",
        date: new Date("2026-06-20T00:00:00.000Z"),
        contacts: {
          create: { contactId: sourceContactId },
        },
        tags: {
          create: { tagId: sourceTagId },
        },
      },
    });

    await prisma.user.create({
      data: {
        id: targetUserId,
        email: `phase8-5-target-${testId}@example.invalid`,
        supabaseAuthUserId: targetAuthId,
        notes: {
          create: {
            title: "Bestehende Notiz",
            content: "Dieser Inhalt darf bei Fehlern nicht verloren gehen.",
            date: new Date("2026-06-19T00:00:00.000Z"),
          },
        },
        contacts: {
          create: {
            displayName: "Bestehender Kontakt",
            source: "manual",
          },
        },
        tags: {
          create: {
            name: "Bestehend",
            color: "#6f7f78",
          },
        },
      },
    });
    targetUserCreated = true;

    const sourceExport = await buildUserJsonExport(sourceUserId);
    const legacyVersion1Export = structuredClone(sourceExport);
    delete (
      legacyVersion1Export as Partial<HumanbaseJsonExport>
    ).noteTemplates;
    const legacyContact = legacyVersion1Export.contacts[0] as {
      isFavorite?: boolean;
    };
    delete legacyContact.isFavorite;
    const legacyVersion1ContactAccepted =
      validateHumanbaseJsonExport(legacyVersion1Export).contacts[0]
        .isFavorite === false;
    assert(
      legacyVersion1ContactAccepted,
      "Early version-1 contacts without isFavorite should default to false.",
    );

    const initialTargetFingerprint = await fingerprintUserData(targetUserId);
    const invalidExport = structuredClone(legacyVersion1Export);
    invalidExport.noteContacts.push({
      noteId: sourceNoteId,
      contactId: randomUUID(),
    });

    let invalidExportRejected = false;

    try {
      await restoreUserJsonExport(targetUserId, invalidExport);
    } catch (error) {
      invalidExportRejected = error instanceof JsonRestoreValidationError;
    }

    assert(invalidExportRejected, "Invalid relationships should be rejected.");

    const invalidExportLeftDataUntouched =
      (await fingerprintUserData(targetUserId)) === initialTargetFingerprint;
    assert(
      invalidExportLeftDataUntouched,
      "Invalid JSON must not alter existing target data.",
    );

    const restoreResult = await restoreUserJsonExport(
      targetUserId,
      legacyVersion1Export,
    );

    assert(restoreResult.notes === 1, "One note should be restored.");
    assert(restoreResult.contacts === 1, "One contact should be restored.");
    assert(restoreResult.tags === 1, "One tag should be restored.");
    assert(
      restoreResult.noteContacts === 1 && restoreResult.noteTags === 1,
      "Both relationships should be restored.",
    );

    const [targetUser, restoredExport] = await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: targetUserId } }),
      buildUserJsonExport(targetUserId),
    ]);
    const authenticationMappingPreserved =
      targetUser.supabaseAuthUserId === targetAuthId &&
      targetUser.email === `phase8-5-target-${testId}@example.invalid`;
    assert(
      authenticationMappingPreserved,
      "Restore must preserve the target user's authentication mapping.",
    );

    const sourceIds = new Set<string>([
      sourceNoteId,
      sourceContactId,
      sourceTagId,
    ]);
    const restoredIds = [
      ...restoredExport.notes.map(({ id }) => id),
      ...restoredExport.contacts.map(({ id }) => id),
      ...restoredExport.tags.map(({ id }) => id),
    ];
    const sourceIdsRemapped = restoredIds.every((id) => !sourceIds.has(id));
    assert(
      sourceIdsRemapped,
      "Imported entity IDs should be remapped for the target user.",
    );

    const relationshipsRestored =
      restoredExport.noteContacts.length === 1 &&
      restoredExport.noteTags.length === 1 &&
      restoredExport.noteContacts[0].noteId === restoredExport.notes[0].id &&
      restoredExport.noteContacts[0].contactId ===
        restoredExport.contacts[0].id &&
      restoredExport.noteTags[0].noteId === restoredExport.notes[0].id &&
      restoredExport.noteTags[0].tagId === restoredExport.tags[0].id;
    assert(
      relationshipsRestored,
      "Restored relationships should reference remapped target records.",
    );

    const restoredFingerprint = await fingerprintUserData(targetUserId);
    const validData = validateHumanbaseJsonExport(sourceExport);
    const transactionFailureData = structuredClone(
      validData,
    ) as ValidatedHumanbaseJsonExport;
    transactionFailureData.tags.push({
      ...transactionFailureData.tags[0],
      id: randomUUID(),
    });

    let transactionFailed = false;

    try {
      await restoreValidatedUserJsonExport(
        targetUserId,
        transactionFailureData,
      );
    } catch {
      transactionFailed = true;
    }

    assert(
      transactionFailed,
      "The deliberate database constraint violation should fail.",
    );

    const transactionRollbackPreservedData =
      (await fingerprintUserData(targetUserId)) === restoredFingerprint;
    assert(
      transactionRollbackPreservedData,
      "A database failure must roll back the complete replacement.",
    );

    const result: VerificationResult = {
      authenticationMappingPreserved,
      invalidExportLeftDataUntouched,
      legacyVersion1ContactAccepted,
      relationshipsRestored,
      sourceIdsRemapped,
      transactionRollbackPreservedData,
    };

    console.log("Phase 8.5 verification passed:");
    console.log(JSON.stringify(result, null, 2));
  } finally {
    if (targetUserCreated) {
      await prisma.user.deleteMany({ where: { id: targetUserId } });
    }

    if (sourceUserCreated) {
      await prisma.user.deleteMany({ where: { id: sourceUserId } });
    }
  }
}

main()
  .catch((error) => {
    console.error("Phase 8.5 verification failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
