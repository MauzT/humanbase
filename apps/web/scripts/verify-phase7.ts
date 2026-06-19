import { randomUUID } from "crypto";

import {
  fetchGooglePeopleConnections,
  importGooglePeopleForUser,
  toImportedGoogleContact,
} from "../lib/google-contacts";
import { prisma } from "../lib/prisma";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const userId = randomUUID();
  const otherUserId = randomUUID();
  const syncedAt = new Date("2026-06-19T12:00:00.000Z");

  try {
    await prisma.user.createMany({
      data: [
        { id: userId, email: `phase7-${userId}@humanbase.local` },
        { id: otherUserId, email: `phase7-${otherUserId}@humanbase.local` },
      ],
    });

    const mapped = toImportedGoogleContact({
      resourceName: "people/c123",
      names: [{ displayName: "Old Name", metadata: { primary: true } }],
      emailAddresses: [{ value: "old@example.com" }],
    });

    assert(mapped?.displayName === "Old Name", "Primary name should be mapped.");
    assert(
      mapped?.externalId === "people/c123",
      "Google resource name should be the external id.",
    );

    const requestedUrls: string[] = [];
    const pages = [
      {
        connections: [{ resourceName: "people/c123" }],
        nextPageToken: "page-2",
      },
      {
        connections: [{ resourceName: "people/c456" }],
      },
    ];
    let pageIndex = 0;
    const fetched = await fetchGooglePeopleConnections(
      "test-token",
      async (input, init) => {
        requestedUrls.push(String(input));
        assert(
          new Headers(init?.headers).get("Authorization") ===
            "Bearer test-token",
          "People API request should use the provider token.",
        );

        return Response.json(pages[pageIndex++]);
      },
    );

    assert(fetched.length === 2, "All People API pages should be fetched.");
    assert(
      requestedUrls[1].includes("pageToken=page-2"),
      "Next page token should be sent.",
    );

    await importGooglePeopleForUser(
      userId,
      [
        {
          resourceName: "people/c123",
          names: [{ displayName: "Old Name" }],
          emailAddresses: [{ value: "old@example.com" }],
          phoneNumbers: [{ value: "+49 123" }],
        },
        {},
      ],
      syncedAt,
    );

    await importGooglePeopleForUser(
      userId,
      [
        {
          resourceName: "people/c123",
          names: [{ displayName: "Updated Name" }],
          emailAddresses: [{ value: "new@example.com" }],
        },
      ],
      syncedAt,
    );

    const [contacts, otherUserContacts] = await Promise.all([
      prisma.contact.findMany({ where: { userId } }),
      prisma.contact.findMany({ where: { userId: otherUserId } }),
    ]);

    assert(contacts.length === 1, "Repeated imports should not duplicate contacts.");
    assert(
      contacts[0].displayName === "Updated Name" &&
        contacts[0].email === "new@example.com",
      "Repeated imports should update local contact fields.",
    );
    assert(
      contacts[0].source === "google" &&
        contacts[0].externalProvider === "google" &&
        contacts[0].externalId === "people/c123" &&
        contacts[0].lastSyncedAt?.toISOString() === syncedAt.toISOString(),
      "Imported contacts should retain Google provenance and sync time.",
    );
    assert(
      otherUserContacts.length === 0,
      "Import should remain scoped to the selected Humanbase user.",
    );

    console.log("Phase 7 verification passed:");
    console.log(
      JSON.stringify(
        {
          readOnlyScope:
            "https://www.googleapis.com/auth/contacts.readonly",
          paginationVerified: true,
          idempotentUpsertVerified: true,
          userScopingVerified: true,
          importedContact: contacts[0].displayName,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.user.deleteMany({
      where: { id: { in: [userId, otherUserId] } },
    });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Phase 7 verification failed:");
  console.error(error);
  process.exitCode = 1;
});
