import { randomUUID } from "node:crypto";

import {
  createContactRelationshipForUser,
  deleteContactRelationshipForUser,
  linkContactRelationshipForUser,
  updateContactRelationshipForUser,
} from "../lib/contact-relationship-service";
import { buildUserJsonExport } from "../lib/export-data";
import { restoreUserJsonExport } from "../lib/json-restore";
import { prisma } from "../lib/prisma";

type VerificationResult = {
  unknownRelationshipAccepted: boolean;
  placeholderLinkedToContact: boolean;
  crossUserTargetRejected: boolean;
  selfLinkRejected: boolean;
  relationshipExported: boolean;
  relationshipRestoredWithRemappedContacts: boolean;
  relationshipDeleted: boolean;
};

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const testId = randomUUID();
  const sourceUserId = randomUUID();
  const targetUserId = randomUUID();
  const otherUserId = randomUUID();
  const annaId = randomUUID();
  const paulId = randomUUID();
  const otherContactId = randomUUID();
  let sourceUserCreated = false;
  let targetUserCreated = false;
  let otherUserCreated = false;

  try {
    await prisma.user.create({
      data: {
        id: sourceUserId,
        email: `phase8-8-source-${testId}@example.invalid`,
        supabaseAuthUserId: `phase8-8-source-${testId}`,
        contacts: {
          createMany: {
            data: [
              {
                id: annaId,
                displayName: "Anna Beziehung",
                source: "google",
                externalProvider: "google",
                externalId: `people/anna-${testId}`,
              },
              {
                id: paulId,
                displayName: "Paul Beziehung",
                source: "google",
                externalProvider: "google",
                externalId: `people/paul-${testId}`,
              },
            ],
          },
        },
      },
    });
    sourceUserCreated = true;

    await prisma.user.create({
      data: {
        id: targetUserId,
        email: `phase8-8-target-${testId}@example.invalid`,
        supabaseAuthUserId: `phase8-8-target-${testId}`,
      },
    });
    targetUserCreated = true;

    await prisma.user.create({
      data: {
        id: otherUserId,
        email: `phase8-8-other-${testId}@example.invalid`,
        supabaseAuthUserId: `phase8-8-other-${testId}`,
        contacts: {
          create: {
            id: otherContactId,
            displayName: "Fremder Kontakt",
            source: "google",
            externalProvider: "google",
            externalId: `people/other-${testId}`,
          },
        },
      },
    });
    otherUserCreated = true;

    const unknownRelationship = await createContactRelationshipForUser(
      sourceUserId,
      {
        fromContactId: annaId,
        relationType: "brother",
        category: "family",
        note: "ist 9 Jahre aelter",
      },
    );
    assert(
      unknownRelationship.ok,
      "A relationship without name or linked contact should be accepted.",
    );
    const unknownRelationshipAccepted =
      unknownRelationship.relationship.toContactId === undefined &&
      unknownRelationship.relationship.relatedName === undefined &&
      unknownRelationship.relationship.note === "ist 9 Jahre aelter";

    const updatedRelationship = await updateContactRelationshipForUser(
      sourceUserId,
      {
        id: unknownRelationship.relationship.id,
        fromContactId: annaId,
        relatedName: "Paul",
        relationType: "brother",
        category: "family",
        note: "ist 9 Jahre aelter",
      },
    );
    assert(updatedRelationship.ok, "A placeholder relationship should be editable.");

    const linkedRelationship = await linkContactRelationshipForUser(
      sourceUserId,
      {
        id: updatedRelationship.relationship.id,
        toContactId: paulId,
      },
    );
    assert(linkedRelationship.ok, "A placeholder should link to an owned contact.");
    const placeholderLinkedToContact =
      linkedRelationship.relationship.toContactId === paulId &&
      linkedRelationship.relationship.relatedName === undefined;

    const crossUserRelationship = await createContactRelationshipForUser(
      sourceUserId,
      {
        fromContactId: annaId,
        toContactId: otherContactId,
        relationType: "friend",
        category: "friends",
      },
    );
    const crossUserTargetRejected = !crossUserRelationship.ok;
    assert(
      crossUserTargetRejected,
      "Relationships should reject contacts from another user.",
    );

    const selfRelationship = await createContactRelationshipForUser(sourceUserId, {
      fromContactId: annaId,
      toContactId: annaId,
      relationType: "friend",
      category: "friends",
    });
    const selfLinkRejected = !selfRelationship.ok;
    assert(selfLinkRejected, "Relationships should reject self-links.");

    const sourceExport = await buildUserJsonExport(sourceUserId);
    const relationshipExported =
      sourceExport.contactRelationships.length === 1 &&
      sourceExport.contactRelationships[0].fromContactId === annaId &&
      sourceExport.contactRelationships[0].toContactId === paulId;
    assert(relationshipExported, "JSON export should include contact relationships.");

    const restoreResult = await restoreUserJsonExport(targetUserId, sourceExport);
    assert(
      restoreResult.contactRelationships === 1,
      "JSON restore should recreate contact relationships.",
    );

    const restoredExport = await buildUserJsonExport(targetUserId);
    const restoredRelationship = restoredExport.contactRelationships[0];
    const restoredContactsByName = new Map(
      restoredExport.contacts.map((contact) => [contact.displayName, contact]),
    );
    const restoredAnna = restoredContactsByName.get("Anna Beziehung");
    const restoredPaul = restoredContactsByName.get("Paul Beziehung");
    const relationshipRestoredWithRemappedContacts =
      restoredRelationship !== undefined &&
      restoredAnna !== undefined &&
      restoredPaul !== undefined &&
      restoredRelationship.id !== sourceExport.contactRelationships[0].id &&
      restoredRelationship.fromContactId === restoredAnna.id &&
      restoredRelationship.toContactId === restoredPaul.id &&
      restoredRelationship.fromContactId !== annaId &&
      restoredRelationship.toContactId !== paulId;
    assert(
      relationshipRestoredWithRemappedContacts,
      "Restored contact relationships should reference remapped contacts.",
    );

    const deleteResult = await deleteContactRelationshipForUser(
      sourceUserId,
      linkedRelationship.relationship.id,
    );
    assert(deleteResult.ok, "An owned relationship should be deletable.");
    const relationshipDeleted =
      (await prisma.contactRelationship.count({
        where: { id: linkedRelationship.relationship.id, userId: sourceUserId },
      })) === 0;
    assert(relationshipDeleted, "Deleted relationships should be removed.");

    const result: VerificationResult = {
      unknownRelationshipAccepted,
      placeholderLinkedToContact,
      crossUserTargetRejected,
      selfLinkRejected,
      relationshipExported,
      relationshipRestoredWithRemappedContacts,
      relationshipDeleted,
    };

    console.log("Phase 8.8 verification passed:");
    console.log(JSON.stringify(result, null, 2));
  } finally {
    if (targetUserCreated) {
      await prisma.user.deleteMany({ where: { id: targetUserId } });
    }

    if (otherUserCreated) {
      await prisma.user.deleteMany({ where: { id: otherUserId } });
    }

    if (sourceUserCreated) {
      await prisma.user.deleteMany({ where: { id: sourceUserId } });
    }
  }
}

main()
  .catch((error) => {
    console.error("Phase 8.8 verification failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
