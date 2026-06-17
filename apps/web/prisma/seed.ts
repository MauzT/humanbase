import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { mockContacts, mockNotes, mockTags } from "../data/mock-data";
import { PrismaClient } from "../generated/prisma/client";
import { getPrimaryAllowedEmail } from "../lib/auth/allowlist";
import { DEFAULT_DEVELOPMENT_USER_ID } from "../lib/default-user";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const contactIds: Record<string, string> = {
  contact_1: "00000000-0000-4000-8000-000000000101",
  contact_2: "00000000-0000-4000-8000-000000000102",
  contact_3: "00000000-0000-4000-8000-000000000103",
};

const tagIds: Record<string, string> = {
  tag_1: "00000000-0000-4000-8000-000000000201",
  tag_2: "00000000-0000-4000-8000-000000000202",
  tag_3: "00000000-0000-4000-8000-000000000203",
  tag_4: "00000000-0000-4000-8000-000000000204",
};

const noteIds: Record<string, string> = {
  note_1: "00000000-0000-4000-8000-000000000301",
  note_2: "00000000-0000-4000-8000-000000000302",
  note_3: "00000000-0000-4000-8000-000000000303",
  note_4: "00000000-0000-4000-8000-000000000304",
};

function getSeedId(ids: Record<string, string>, mockId: string) {
  const seedId = ids[mockId];

  if (!seedId) {
    throw new Error(`Missing seed UUID for ${mockId}.`);
  }

  return seedId;
}

async function main() {
  const primaryAllowedEmail = getPrimaryAllowedEmail();

  await prisma.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { id: DEFAULT_DEVELOPMENT_USER_ID },
      update: primaryAllowedEmail
        ? {
            email: primaryAllowedEmail,
          }
        : {},
      create: {
        id: DEFAULT_DEVELOPMENT_USER_ID,
        email: primaryAllowedEmail,
      },
    });

    for (const contact of mockContacts) {
      const id = getSeedId(contactIds, contact.id);
      const data = {
        userId: DEFAULT_DEVELOPMENT_USER_ID,
        displayName: contact.displayName,
        email: contact.email,
        phone: contact.phone,
        avatarUrl: contact.avatarUrl,
        source: contact.source,
        createdAt: new Date(contact.createdAt),
        updatedAt: new Date(contact.updatedAt),
      };

      await tx.contact.upsert({
        where: { id },
        update: data,
        create: { id, ...data },
      });
    }

    for (const tag of mockTags) {
      const id = getSeedId(tagIds, tag.id);
      const data = {
        userId: DEFAULT_DEVELOPMENT_USER_ID,
        name: tag.name,
        color: tag.color,
        createdAt: new Date(tag.createdAt),
        updatedAt: new Date(tag.updatedAt),
      };

      await tx.tag.upsert({
        where: { id },
        update: data,
        create: { id, ...data },
      });
    }

    for (const note of mockNotes) {
      const id = getSeedId(noteIds, note.id);
      const data = {
        userId: DEFAULT_DEVELOPMENT_USER_ID,
        title: note.title,
        content: note.content,
        date: new Date(`${note.date}T00:00:00.000Z`),
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      };

      await tx.note.upsert({
        where: { id },
        update: data,
        create: { id, ...data },
      });
    }

    const seededNoteIds = mockNotes.map((note) => getSeedId(noteIds, note.id));

    await tx.noteContact.deleteMany({
      where: { noteId: { in: seededNoteIds } },
    });
    await tx.noteTag.deleteMany({
      where: { noteId: { in: seededNoteIds } },
    });

    await tx.noteContact.createMany({
      data: mockNotes.flatMap((note) =>
        note.contactIds.map((contactId) => ({
          noteId: getSeedId(noteIds, note.id),
          contactId: getSeedId(contactIds, contactId),
        })),
      ),
    });
    await tx.noteTag.createMany({
      data: mockNotes.flatMap((note) =>
        note.tagIds.map((tagId) => ({
          noteId: getSeedId(noteIds, note.id),
          tagId: getSeedId(tagIds, tagId),
        })),
      ),
    });
  });

  console.log(
    `Seeded 1 user, ${mockContacts.length} contacts, ${mockTags.length} tags and ${mockNotes.length} notes.`,
  );

  if (primaryAllowedEmail) {
    console.log(
      `Linked the default user to allowed email ${primaryAllowedEmail}.`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
