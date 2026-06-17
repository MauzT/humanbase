import { randomUUID } from "crypto";

import { isEmailAllowed } from "../lib/auth/allowlist";
import { getOrCreateHumanbaseUserForSupabaseUser } from "../lib/auth/supabase-user";
import { DEFAULT_DEVELOPMENT_USER_ID } from "../lib/default-user";
import { buildUserJsonExport } from "../lib/export-data";
import {
  getNotesForDefaultDevelopmentUser,
  getTimelineDataForUser,
} from "../lib/humanbase-data";
import {
  createNoteForUser,
  deleteNoteForUser,
  updateNoteForUser,
} from "../lib/note-service";
import { prisma } from "../lib/prisma";

type VerificationResult = {
  allowedEmailAccepted: boolean;
  deniedEmailRejected: boolean;
  supabaseUserMappedToHumanbaseUser: boolean;
  exportScopedToMappedUser: boolean;
  crossUserRelationshipRejected: boolean;
  crossUserUpdateRejected: boolean;
  crossUserDeleteRejected: boolean;
  notesVisibleToMappedUser: number;
  defaultUserStillReadableByLegacyVerifier: boolean;
};

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const allowedEmail = `phase5-${randomUUID()}@humanbase.local`;
  const deniedEmail = `phase5-denied-${randomUUID()}@humanbase.local`;
  const tempSupabaseUserId = randomUUID();
  const tempUserId = randomUUID();
  const tempContactId = randomUUID();
  const tempTagId = randomUUID();
  let createdNoteId: string | undefined;

  try {
    const [defaultContact, defaultNote, defaultNotesBefore] =
      await Promise.all([
        prisma.contact.findFirst({
          where: { userId: DEFAULT_DEVELOPMENT_USER_ID },
          select: { id: true },
        }),
        prisma.note.findFirst({
          where: { userId: DEFAULT_DEVELOPMENT_USER_ID },
          select: { id: true },
        }),
        getNotesForDefaultDevelopmentUser(),
      ]);

    assert(defaultContact !== null, "Expected a seeded default contact.");
    assert(defaultNote !== null, "Expected a seeded default note.");
    assert(
      isEmailAllowed(allowedEmail, new Set([allowedEmail])),
      "Allowed email should pass the allowlist check.",
    );
    assert(
      !isEmailAllowed(deniedEmail, new Set([allowedEmail])),
      "Denied email should fail the allowlist check.",
    );

    const denied = await getOrCreateHumanbaseUserForSupabaseUser(
      {
        id: randomUUID(),
        email: deniedEmail,
      },
      new Set([allowedEmail]),
    );

    assert(
      denied.status === "denied",
      "A non-allowlisted Supabase user should be denied.",
    );

    await prisma.user.create({
      data: {
        id: tempUserId,
        email: allowedEmail,
        contacts: {
          create: {
            id: tempContactId,
            displayName: "Phase 5 Supabase Verification Contact",
          },
        },
        tags: {
          create: {
            id: tempTagId,
            name: `phase5-${tempUserId.slice(0, 8)}`,
          },
        },
      },
    });

    const mapped = await getOrCreateHumanbaseUserForSupabaseUser(
      {
        id: tempSupabaseUserId,
        email: allowedEmail,
      },
      new Set([allowedEmail]),
    );

    assert(mapped.status === "allowed", "Allowed Supabase user should map.");
    assert(
      mapped.user.id === tempUserId,
      "Allowed Supabase user should map by email to the existing app user.",
    );

    const persistedMapping = await prisma.user.findUnique({
      where: { id: tempUserId },
      select: { supabaseAuthUserId: true },
    });

    assert(
      persistedMapping?.supabaseAuthUserId === tempSupabaseUserId,
      "Mapping should persist the Supabase Auth user id.",
    );

    const created = await createNoteForUser(tempUserId, {
      title: "Phase 5 Supabase verification note",
      content: "Temporary note created by verify:phase5.",
      date: "2026-06-16",
      contactIds: [tempContactId],
      tagIds: [tempTagId],
    });

    assert(created.ok, created.ok ? "" : created.error);
    createdNoteId = created.note.id;

    const timeline = await getTimelineDataForUser(tempUserId);
    const exportData = await buildUserJsonExport(tempUserId);

    assert(timeline.notes.length === 1, "Mapped user should see one note.");
    assert(
      exportData.notes.length === 1 &&
        exportData.notes.every(({ userId }) => userId === tempUserId),
      "Export should only include the mapped user's notes.",
    );

    const crossUserRelationship = await createNoteForUser(tempUserId, {
      title: "Invalid cross-user relationship",
      content: "This must not be written.",
      date: "2026-06-16",
      contactIds: [defaultContact.id],
      tagIds: [tempTagId],
    });

    const crossUserUpdate = await updateNoteForUser(tempUserId, {
      id: defaultNote.id,
      title: "Invalid cross-user update",
      content: "This must not be written.",
      date: "2026-06-16",
      contactIds: [tempContactId],
      tagIds: [tempTagId],
    });

    const crossUserDelete = await deleteNoteForUser(tempUserId, defaultNote.id);
    const defaultNotesAfter = await getNotesForDefaultDevelopmentUser();

    assert(
      !crossUserRelationship.ok,
      "Cross-user relationships should be rejected.",
    );
    assert(!crossUserUpdate.ok, "Cross-user updates should be rejected.");
    assert(!crossUserDelete.ok, "Cross-user deletes should be rejected.");
    assert(
      defaultNotesAfter.length === defaultNotesBefore.length,
      "Phase 5 checks should not change default user notes.",
    );

    const result: VerificationResult = {
      allowedEmailAccepted: true,
      deniedEmailRejected: denied.status === "denied",
      supabaseUserMappedToHumanbaseUser:
        persistedMapping?.supabaseAuthUserId === tempSupabaseUserId,
      exportScopedToMappedUser: exportData.notes.every(
        ({ userId }) => userId === tempUserId,
      ),
      crossUserRelationshipRejected: !crossUserRelationship.ok,
      crossUserUpdateRejected: !crossUserUpdate.ok,
      crossUserDeleteRejected: !crossUserDelete.ok,
      notesVisibleToMappedUser: timeline.notes.length,
      defaultUserStillReadableByLegacyVerifier:
        defaultNotesAfter.length === defaultNotesBefore.length,
    };

    console.log("Phase 5 verification passed:");
    console.log(JSON.stringify(result, null, 2));
  } finally {
    try {
      if (createdNoteId) {
        await prisma.note.deleteMany({ where: { id: createdNoteId } });
      }
    } catch (error) {
      console.warn("Could not clean up the temporary Phase 5 note.", error);
    }

    try {
      await prisma.user.deleteMany({ where: { id: tempUserId } });
    } catch (error) {
      console.warn("Could not clean up the temporary Phase 5 user.", error);
    }

    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Phase 5 verification failed:");
  console.error(error);
  process.exitCode = 1;
});
