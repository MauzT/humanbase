"use client";

import { useEffect, useMemo, useState } from "react";

import {
  createTagForCurrentUser,
  deleteTagForCurrentUser,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import type { Note, Tag } from "@/types/humanbase";

type TagManagerProps = {
  tags: Tag[];
  notes: Note[];
  onClose: () => void;
  onTagCreated: (tag: Tag) => void;
  onTagDeleted: (tagId: string) => void;
};

const tagColors = [
  "#276956",
  "#8a5b2d",
  "#5b4b8a",
  "#9b4f4f",
  "#356a8a",
  "#68736e",
];

export function TagManager({
  tags,
  notes,
  onClose,
  onTagCreated,
  onTagDeleted,
}: TagManagerProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(tagColors[0]);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingTagId, setDeletingTagId] = useState("");

  const usageByTagId = useMemo(() => {
    const usage = new Map<string, number>();

    for (const note of notes) {
      for (const tagId of note.tagIds) {
        usage.set(tagId, (usage.get(tagId) ?? 0) + 1);
      }
    }

    return usage;
  }, [notes]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isCreating && !deletingTagId) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [deletingTagId, isCreating, onClose]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsCreating(true);

    try {
      const result = await createTagForCurrentUser({ name, color });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onTagCreated(result.tag);
      setName("");
    } catch {
      setError("Der Tag konnte nicht erstellt werden.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(tag: Tag) {
    const usageCount = usageByTagId.get(tag.id) ?? 0;
    const relationshipNotice =
      usageCount === 0
        ? "Er ist aktuell mit keiner Notiz verknüpft."
        : `Er wird dadurch von ${usageCount} ${
            usageCount === 1 ? "Notiz" : "Notizen"
          } entfernt. Die Notizen selbst bleiben erhalten.`;

    if (
      !window.confirm(
        `Tag "#${tag.name}" wirklich löschen?\n\n${relationshipNotice}`,
      )
    ) {
      return;
    }

    setError("");
    setDeletingTagId(tag.id);

    try {
      const result = await deleteTagForCurrentUser(tag.id);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onTagDeleted(result.tagId);
    } catch {
      setError("Der Tag konnte nicht gelöscht werden.");
    } finally {
      setDeletingTagId("");
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-stretch justify-center bg-[rgba(30,41,37,0.45)] sm:items-center sm:px-4 sm:py-8">
      <section
        aria-labelledby="tag-manager-title"
        aria-modal="true"
        role="dialog"
        className="flex h-[100dvh] w-full max-w-2xl flex-col overflow-hidden bg-[var(--card)] shadow-xl sm:h-auto sm:max-h-[calc(100dvh-4rem)] sm:rounded-2xl sm:border sm:border-[var(--border)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3 sm:px-5">
          <div>
            <h2 id="tag-manager-title" className="text-lg font-semibold">
              Tags verwalten
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Themen erstellen und nicht mehr benötigte Tags entfernen.
            </p>
          </div>
          <Button
            aria-label="Tag-Verwaltung schließen"
            title="Schließen"
            variant="ghost"
            size="sm"
            disabled={isCreating || Boolean(deletingTagId)}
            onClick={onClose}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          <form
            onSubmit={handleCreate}
            className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4"
          >
            <label className="grid gap-2">
              <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                Neuer Tag
              </span>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Zum Beispiel: Projektidee"
                  maxLength={50}
                  className="min-h-12 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-base outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] sm:min-h-11 sm:text-sm"
                />
                <Button
                  type="submit"
                  disabled={isCreating || !name.trim()}
                  className="w-full sm:w-auto"
                >
                  {isCreating ? "Wird erstellt …" : "Tag hinzufügen"}
                </Button>
              </div>
            </label>

            <fieldset className="mt-4">
              <legend className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                Farbe
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {tagColors.map((tagColor) => (
                  <label
                    key={tagColor}
                    className="relative flex size-11 cursor-pointer items-center justify-center rounded-full"
                    title={tagColor}
                  >
                    <input
                      type="radio"
                      name="tag-color"
                      value={tagColor}
                      checked={color === tagColor}
                      onChange={() => setColor(tagColor)}
                      className="peer sr-only"
                    />
                    <span
                      className="size-8 rounded-full border-2 border-white shadow-sm ring-2 ring-transparent peer-checked:ring-[var(--foreground)]"
                      style={{ backgroundColor: tagColor }}
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          </form>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-[#d9b4b4] bg-[#fff1f0] px-4 py-3 text-sm text-[#7d2e2c]"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-6">
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h3 className="font-semibold">Vorhandene Tags</h3>
              <span className="text-xs text-[var(--muted)]">
                {tags.length} {tags.length === 1 ? "Tag" : "Tags"}
              </span>
            </div>

            {tags.length > 0 ? (
              <ul className="grid gap-2">
                {tags.map((tag) => {
                  const usageCount = usageByTagId.get(tag.id) ?? 0;

                  return (
                    <li
                      key={tag.id}
                      className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-semibold"
                          style={{ color: tag.color }}
                        >
                          #{tag.name}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {usageCount === 0
                            ? "Noch nicht verwendet"
                            : `${usageCount} ${
                                usageCount === 1 ? "Notiz" : "Notizen"
                              }`}
                        </p>
                      </div>
                      <Button
                        aria-label={`Tag ${tag.name} löschen`}
                        title="Tag löschen"
                        variant="ghost"
                        size="sm"
                        disabled={Boolean(deletingTagId)}
                        onClick={() => handleDelete(tag)}
                        className="shrink-0 text-[#9b4f4f] hover:bg-[#f4e5e5]"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="size-4"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6 18 20H6L5 6" />
                          <path d="M10 11v5" />
                          <path d="M14 11v5" />
                        </svg>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-6 text-center text-sm text-[var(--muted)]">
                Noch keine Tags vorhanden.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
