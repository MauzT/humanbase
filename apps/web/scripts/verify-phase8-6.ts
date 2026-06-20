import { randomUUID } from "node:crypto";

import { importGooglePeopleForUser } from "../lib/google-contacts";
import { prisma } from "../lib/prisma";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const userId = randomUUID();
  const noteId = randomUUID();
  const firstSyncAt = new Date("2026-06-20T08:00:00.000Z");
  const secondSyncAt = new Date("2026-06-20T09:00:00.000Z");

  try {
    await prisma.user.create({
      data: {
        id: userId,
        email: `phase8-6-${userId}@example.invalid`,
      },
    });

    await importGooglePeopleForUser(
      userId,
      [
        {
          resourceName: "people/stable",
          names: [{ displayName: "Alter Name" }],
          emailAddresses: [{ value: "old@example.invalid" }],
          phoneNumbers: [{ value: "+49 111" }],
        },
        {
          resourceName: "people/missing-later",
          names: [{ displayName: "Bleibt lokal" }],
        },
      ],
      firstSyncAt,
    );

    const originalContact = await prisma.contact.findUniqueOrThrow({
      where: {
        userId_externalProvider_externalId: {
          userId,
          externalProvider: "google",
          externalId: "people/stable",
        },
      },
    });

    await prisma.note.create({
      data: {
        id: noteId,
        userId,
        title: "Phase 8.6 Beziehungstest",
        content: "Diese Beziehung muss einen erneuten Import überleben.",
        date: new Date("2026-06-20T00:00:00.000Z"),
        contacts: {
          create: { contactId: originalContact.id },
        },
      },
    });

    await importGooglePeopleForUser(
      userId,
      [
        {
          resourceName: "people/stable",
          names: [{ displayName: "Neuer Name" }],
          emailAddresses: [{ value: "new@example.invalid" }],
          photos: [
            {
              value: "https://lh3.googleusercontent.com/phase8-6-photo",
            },
          ],
          memberships: [
            {
              contactGroupMembership: {
                contactGroupResourceName: "contactGroups/starred",
              },
            },
          ],
        },
      ],
      secondSyncAt,
    );

    const [contacts, updatedContact, relationship] = await Promise.all([
      prisma.contact.findMany({ where: { userId } }),
      prisma.contact.findUniqueOrThrow({
        where: {
          userId_externalProvider_externalId: {
            userId,
            externalProvider: "google",
            externalId: "people/stable",
          },
        },
      }),
      prisma.noteContact.findUnique({
        where: {
          noteId_contactId: {
            noteId,
            contactId: originalContact.id,
          },
        },
      }),
    ]);

    assert(
      contacts.length === 2,
      "Contacts missing from a later Google import must remain in Humanbase.",
    );
    assert(
      updatedContact.id === originalContact.id,
      "Repeated imports must keep the Humanbase Contact.id stable.",
    );
    assert(
      updatedContact.displayName === "Neuer Name" &&
        updatedContact.email === "new@example.invalid" &&
        updatedContact.phone === null &&
        updatedContact.avatarUrl ===
          "https://lh3.googleusercontent.com/phase8-6-photo" &&
        updatedContact.isFavorite &&
        updatedContact.lastSyncedAt?.toISOString() ===
          secondSyncAt.toISOString(),
      "Repeated imports must replace all mutable Google contact fields.",
    );
    assert(
      relationship !== null,
      "Repeated imports must preserve NoteContact relationships.",
    );

    console.log("Phase 8.6 verification passed:");
    console.log(
      JSON.stringify(
        {
          stableContactIdVerified: true,
          mutableFieldsUpdated: true,
          noteContactPreserved: true,
          missingGoogleContactRetained: true,
          avatarImported: true,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Phase 8.6 verification failed:");
  console.error(error);
  process.exitCode = 1;
});
