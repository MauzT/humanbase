import "server-only";

import { DEFAULT_DEVELOPMENT_USER_ID } from "@/lib/default-user";
import {
  getInverseRelationshipType,
  isContactRelationshipCategory,
} from "@/lib/contact-relationship-options";
import { prisma } from "@/lib/prisma";
import type { ContactRelationship } from "@/types/humanbase";

type ContactRelationshipInput = {
  fromContactId: string;
  toContactId?: string;
  relatedName?: string;
  relationType: string;
  inverseRelationType?: string;
  category: string;
  note?: string;
};

type UpdateContactRelationshipInput = ContactRelationshipInput & {
  id: string;
};

type LinkContactRelationshipInput = {
  id: string;
  toContactId: string;
};

type ValidatedContactRelationshipInput = {
  fromContactId: string;
  toContactId: string | null;
  relatedName: string | null;
  relationType: string;
  inverseRelationType: string | null;
  category: ContactRelationship["category"];
  note: string | null;
};

export type SaveContactRelationshipResult =
  | { ok: true; relationship: ContactRelationship }
  | { ok: false; error: string };

export type DeleteContactRelationshipResult =
  | { ok: true; relationshipId: string }
  | { ok: false; error: string };

const maximumRelationTypeLength = 60;
const maximumRelatedNameLength = 120;
const maximumNoteLength = 500;

const invalidInputError =
  "Bitte gib eine gueltige Beziehung, Kategorie und optionale Notiz ein.";
const invalidContactError =
  "Mindestens eine ausgewaehlte Person gehoert nicht zu deinem Kontaktbuch.";

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function toUiContactRelationship(relationship: {
  id: string;
  fromContactId: string;
  toContactId: string | null;
  relatedName: string | null;
  relationType: string;
  inverseRelationType: string | null;
  category: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ContactRelationship {
  return {
    id: relationship.id,
    fromContactId: relationship.fromContactId,
    toContactId: relationship.toContactId ?? undefined,
    relatedName: relationship.relatedName ?? undefined,
    relationType: relationship.relationType,
    inverseRelationType: relationship.inverseRelationType ?? undefined,
    category: isContactRelationshipCategory(relationship.category)
      ? relationship.category
      : "other",
    note: relationship.note ?? undefined,
    createdAt: relationship.createdAt.toISOString(),
    updatedAt: relationship.updatedAt.toISOString(),
  };
}

function validateRelationshipInput(
  input: ContactRelationshipInput,
): ValidatedContactRelationshipInput | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const fromContactId =
    typeof input.fromContactId === "string" ? input.fromContactId : "";
  const toContactId =
    typeof input.toContactId === "string" && input.toContactId
      ? input.toContactId
      : null;
  const relatedName = normalizeOptionalString(input.relatedName);
  const relationType = normalizeOptionalString(input.relationType);
  const explicitInverseRelationType = normalizeOptionalString(
    input.inverseRelationType,
  );
  const note = normalizeOptionalString(input.note);
  const category = typeof input.category === "string" ? input.category : "";

  if (
    !fromContactId ||
    !relationType ||
    relationType.length > maximumRelationTypeLength ||
    (explicitInverseRelationType &&
      explicitInverseRelationType.length > maximumRelationTypeLength) ||
    relatedName.length > maximumRelatedNameLength ||
    note.length > maximumNoteLength ||
    !isContactRelationshipCategory(category) ||
    (toContactId !== null && toContactId === fromContactId)
  ) {
    return null;
  }

  const inverseRelationType =
    explicitInverseRelationType ||
    getInverseRelationshipType(relationType) ||
    relationType;

  return {
    fromContactId,
    toContactId,
    relatedName: toContactId ? null : relatedName || null,
    relationType,
    inverseRelationType,
    category,
    note: note || null,
  };
}

async function validateContactsForUser(
  userId: string,
  input: Pick<ValidatedContactRelationshipInput, "fromContactId" | "toContactId">,
) {
  const contactIds = [input.fromContactId, input.toContactId].filter(
    (contactId): contactId is string => Boolean(contactId),
  );
  const contacts = await prisma.contact.findMany({
    where: {
      id: { in: contactIds },
      userId,
    },
    select: { id: true },
  });

  return contacts.length === contactIds.length;
}

export async function createContactRelationshipForUser(
  userId: string,
  input: ContactRelationshipInput,
): Promise<SaveContactRelationshipResult> {
  const validatedInput = validateRelationshipInput(input);

  if (!validatedInput) {
    return { ok: false, error: invalidInputError };
  }

  try {
    if (!(await validateContactsForUser(userId, validatedInput))) {
      return { ok: false, error: invalidContactError };
    }

    const relationship = await prisma.contactRelationship.create({
      data: {
        userId,
        ...validatedInput,
      },
    });

    return {
      ok: true,
      relationship: toUiContactRelationship(relationship),
    };
  } catch (error) {
    console.error("Could not create contact relationship.", error);
    return { ok: false, error: "Die Beziehung konnte nicht erstellt werden." };
  }
}

export async function updateContactRelationshipForUser(
  userId: string,
  input: UpdateContactRelationshipInput,
): Promise<SaveContactRelationshipResult> {
  if (!input || typeof input.id !== "string") {
    return { ok: false, error: "Die Beziehung konnte nicht gespeichert werden." };
  }

  const validatedInput = validateRelationshipInput(input);

  if (!validatedInput) {
    return { ok: false, error: invalidInputError };
  }

  try {
    const [relationship, contactsAreValid] = await Promise.all([
      prisma.contactRelationship.findFirst({
        where: { id: input.id, userId },
        select: { id: true },
      }),
      validateContactsForUser(userId, validatedInput),
    ]);

    if (!relationship) {
      return { ok: false, error: "Die Beziehung wurde nicht gefunden." };
    }

    if (!contactsAreValid) {
      return { ok: false, error: invalidContactError };
    }

    const updatedRelationship = await prisma.contactRelationship.update({
      where: { id: relationship.id },
      data: validatedInput,
    });

    return {
      ok: true,
      relationship: toUiContactRelationship(updatedRelationship),
    };
  } catch (error) {
    console.error("Could not update contact relationship.", error);
    return { ok: false, error: "Die Beziehung konnte nicht gespeichert werden." };
  }
}

export async function linkContactRelationshipForUser(
  userId: string,
  input: LinkContactRelationshipInput,
): Promise<SaveContactRelationshipResult> {
  if (
    !input ||
    typeof input.id !== "string" ||
    typeof input.toContactId !== "string"
  ) {
    return { ok: false, error: "Die Beziehung konnte nicht verknuepft werden." };
  }

  try {
    const [relationship, contact] = await Promise.all([
      prisma.contactRelationship.findFirst({
        where: { id: input.id, userId },
        select: { id: true, fromContactId: true },
      }),
      prisma.contact.findFirst({
        where: { id: input.toContactId, userId },
        select: { id: true },
      }),
    ]);

    if (!relationship) {
      return { ok: false, error: "Die Beziehung wurde nicht gefunden." };
    }

    if (!contact || contact.id === relationship.fromContactId) {
      return { ok: false, error: invalidContactError };
    }

    const updatedRelationship = await prisma.contactRelationship.update({
      where: { id: relationship.id },
      data: {
        toContactId: contact.id,
        relatedName: null,
      },
    });

    return {
      ok: true,
      relationship: toUiContactRelationship(updatedRelationship),
    };
  } catch (error) {
    console.error("Could not link contact relationship.", error);
    return { ok: false, error: "Die Beziehung konnte nicht verknuepft werden." };
  }
}

export async function deleteContactRelationshipForUser(
  userId: string,
  relationshipId: string,
): Promise<DeleteContactRelationshipResult> {
  if (typeof relationshipId !== "string") {
    return { ok: false, error: "Die Beziehung konnte nicht geloescht werden." };
  }

  try {
    const result = await prisma.contactRelationship.deleteMany({
      where: { id: relationshipId, userId },
    });

    if (result.count === 0) {
      return { ok: false, error: "Die Beziehung wurde nicht gefunden." };
    }

    return { ok: true, relationshipId };
  } catch (error) {
    console.error("Could not delete contact relationship.", error);
    return { ok: false, error: "Die Beziehung konnte nicht geloescht werden." };
  }
}

export function createContactRelationshipForDefaultDevelopmentUser(
  input: ContactRelationshipInput,
) {
  return createContactRelationshipForUser(DEFAULT_DEVELOPMENT_USER_ID, input);
}

export function updateContactRelationshipForDefaultDevelopmentUser(
  input: UpdateContactRelationshipInput,
) {
  return updateContactRelationshipForUser(DEFAULT_DEVELOPMENT_USER_ID, input);
}

export function linkContactRelationshipForDefaultDevelopmentUser(
  input: LinkContactRelationshipInput,
) {
  return linkContactRelationshipForUser(DEFAULT_DEVELOPMENT_USER_ID, input);
}

export function deleteContactRelationshipForDefaultDevelopmentUser(
  relationshipId: string,
) {
  return deleteContactRelationshipForUser(
    DEFAULT_DEVELOPMENT_USER_ID,
    relationshipId,
  );
}
