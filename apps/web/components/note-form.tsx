"use client";

import { useEffect, useState } from "react";

import type { Contact, Note, Tag } from "@/types/humanbase";

import { Button } from "@/components/ui/button";

export type NoteFormInput = Pick<
  Note,
  "title" | "content" | "date" | "contactIds" | "tagIds"
>;

type NoteFormProps = {
  contacts: Contact[];
  tags: Tag[];
  note?: Note;
  onSubmit: (note: NoteFormInput) => void | Promise<void>;
  onCancel: () => void;
  submitError?: string;
  isSubmitting?: boolean;
};

const inputClasses =
  "min-h-12 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-base outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] sm:min-h-11 sm:text-sm";

export function NoteForm({
  contacts,
  tags,
  note,
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
}: NoteFormProps) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [date, setDate] = useState(note?.date ?? "");
  const [contactIds, setContactIds] = useState<string[]>(
    note?.contactIds ?? [],
  );
  const [tagIds, setTagIds] = useState<string[]>(note?.tagIds ?? []);
  const [error, setError] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onCancel]);

  function toggleSelection(
    id: string,
    selectedIds: string[],
    setSelectedIds: (ids: string[]) => void,
  ) {
    setSelectedIds(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !content.trim() || !date) {
      setError("Titel, Inhalt und Datum sind erforderlich.");
      return;
    }

    await onSubmit({
      title: title.trim(),
      content: content.trim(),
      date,
      contactIds,
      tagIds,
    });
  }

  return (
    <div className="fixed inset-0 z-10 flex items-stretch justify-center bg-[rgba(30,41,37,0.45)] sm:items-center sm:px-4 sm:py-8">
      <section
        aria-labelledby="note-form-title"
        aria-modal="true"
        role="dialog"
        className="flex h-[100dvh] w-full max-w-3xl flex-col overflow-hidden bg-[var(--card)] shadow-xl sm:h-auto sm:max-h-[calc(100dvh-4rem)] sm:rounded-2xl sm:border sm:border-[var(--border)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3 sm:px-5">
          <h2 id="note-form-title" className="text-lg font-semibold">
            {note ? "Notiz bearbeiten" : "Neue Notiz"}
          </h2>
          <Button
            aria-label="Formular schließen"
            title="Schließen"
            variant="ghost"
            size="sm"
            disabled={isSubmitting}
            onClick={onCancel}
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

        <form
          className="grid flex-1 gap-5 overflow-y-auto px-4 py-5 sm:px-5"
          onSubmit={handleSubmit}
        >
          <label className="grid gap-2">
            <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
              Titel
            </span>
            <input
              autoFocus
              autoComplete="off"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputClasses}
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
              Inhalt
            </span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className={`${inputClasses} min-h-40 resize-y sm:min-h-32`}
              required
            />
          </label>

          <label className="grid w-full gap-2 sm:max-w-52">
            <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
              Datum
            </span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={inputClasses}
              required
            />
          </label>

          <fieldset>
            <legend className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
              Kontakte
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {contacts.map((contact) => (
                <label
                  key={contact.id}
                  className="flex min-h-11 max-w-full cursor-pointer items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)]"
                >
                  <input
                    type="checkbox"
                    className="size-5 shrink-0 accent-[var(--accent)]"
                    checked={contactIds.includes(contact.id)}
                    onChange={() =>
                      toggleSelection(contact.id, contactIds, setContactIds)
                    }
                  />
                  {contact.displayName}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
              Tags
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex min-h-11 max-w-full cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold"
                  style={{ color: tag.color }}
                >
                  <input
                    type="checkbox"
                    className="size-5 shrink-0 accent-[var(--accent)]"
                    checked={tagIds.includes(tag.id)}
                    onChange={() => toggleSelection(tag.id, tagIds, setTagIds)}
                  />
                  #{tag.name}
                </label>
              ))}
            </div>
          </fieldset>

          {(error || submitError) && (
            <p role="alert" className="text-sm text-[#9b4f4f]">
              {error || submitError}
            </p>
          )}

          <div className="sticky bottom-0 -mx-4 -mb-5 grid grid-cols-2 gap-2 border-t border-[var(--border)] bg-[var(--card)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:-mx-5 sm:grid-cols-[auto_auto] sm:justify-start sm:px-5 sm:pb-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting
                ? "Wird gespeichert..."
                : note
                  ? "Aenderungen speichern"
                  : "Notiz erstellen"}
            </Button>
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              Abbrechen
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
