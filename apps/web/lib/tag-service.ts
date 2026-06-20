import "server-only";

import { prisma } from "@/lib/prisma";
import type { Tag } from "@/types/humanbase";

type CreateTagInput = {
  name: string;
  color?: string;
};

export type CreateTagResult =
  | { ok: true; tag: Tag }
  | { ok: false; error: string };

export type DeleteTagResult =
  | { ok: true; tagId: string; unlinkedNotes: number }
  | { ok: false; error: string };

const hexColorPattern = /^#[0-9a-f]{6}$/i;

function toUiTag(tag: {
  id: string;
  name: string;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Tag {
  return {
    id: tag.id,
    name: tag.name,
    color: tag.color ?? undefined,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  };
}

export async function createTagForUser(
  userId: string,
  input: CreateTagInput,
): Promise<CreateTagResult> {
  const name =
    typeof input?.name === "string"
      ? input.name.trim().replace(/^#+\s*/, "")
      : "";
  const color =
    typeof input?.color === "string" ? input.color.trim().toLowerCase() : "";

  if (!name) {
    return { ok: false, error: "Bitte gib einen Namen für den Tag ein." };
  }

  if (name.length > 50) {
    return {
      ok: false,
      error: "Der Tag-Name darf höchstens 50 Zeichen lang sein.",
    };
  }

  if (color && !hexColorPattern.test(color)) {
    return { ok: false, error: "Die ausgewählte Tag-Farbe ist ungültig." };
  }

  try {
    const existingTag = await prisma.tag.findFirst({
      where: {
        userId,
        name: { equals: name, mode: "insensitive" },
      },
      select: { id: true },
    });

    if (existingTag) {
      return { ok: false, error: "Ein Tag mit diesem Namen existiert bereits." };
    }

    const tag = await prisma.tag.create({
      data: {
        userId,
        name,
        color: color || null,
      },
    });

    return { ok: true, tag: toUiTag(tag) };
  } catch (error) {
    console.error("Could not create tag.", error);
    return { ok: false, error: "Der Tag konnte nicht erstellt werden." };
  }
}

export async function deleteTagForUser(
  userId: string,
  tagId: string,
): Promise<DeleteTagResult> {
  if (typeof tagId !== "string" || !tagId) {
    return { ok: false, error: "Der Tag konnte nicht gelöscht werden." };
  }

  try {
    const tag = await prisma.tag.findFirst({
      where: { id: tagId, userId },
      select: {
        id: true,
        _count: { select: { notes: true } },
      },
    });

    if (!tag) {
      return { ok: false, error: "Der Tag wurde nicht gefunden." };
    }

    const result = await prisma.tag.deleteMany({
      where: { id: tag.id, userId },
    });

    if (result.count === 0) {
      return { ok: false, error: "Der Tag wurde nicht gefunden." };
    }

    return {
      ok: true,
      tagId: tag.id,
      unlinkedNotes: tag._count.notes,
    };
  } catch (error) {
    console.error("Could not delete tag.", error);
    return { ok: false, error: "Der Tag konnte nicht gelöscht werden." };
  }
}
