"use client";

import { useState } from "react";

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
  onSubmit: (note: NoteFormInput) => void;
  onCancel: () => void;
};

const inputClasses =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]";

export function NoteForm({
  contacts,
  tags,
  note,
  onSubmit,
  onCancel,
}: NoteFormProps) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [date, setDate] = useState(note?.date ?? "");
  const [contactIds, setContactIds] = useState<string[]>(
    note?.contactIds ?? [],
  );
  const [tagIds, setTagIds] = useState<string[]>(note?.tagIds ?? []);
  const [error, setError] = useState("");

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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !content.trim() || !date) {
      setError("Titel, Inhalt und Datum sind erforderlich.");
      return;
    }

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      date,
      contactIds,
      tagIds,
    });
  }

  return (
    <div className="fixed inset-0 z-10 flex items-start justify-center overflow-y-auto bg-[rgba(30,41,37,0.45)] px-4 py-8 sm:py-12">
      <section
        aria-labelledby="note-form-title"
        aria-modal="true"
        role="dialog"
        className="w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xl sm:p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="note-form-title" className="text-lg font-semibold">
            {note ? "Notiz bearbeiten" : "Neue Notiz"}
          </h2>
          <Button
            aria-label="Formular schließen"
            title="Schließen"
            variant="ghost"
            size="sm"
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

        <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
              Titel
            </span>
            <input
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
              className={`${inputClasses} min-h-28 resize-y`}
              required
            />
          </label>

          <label className="grid max-w-52 gap-2">
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
                  className="flex cursor-pointer items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]"
                >
                  <input
                    type="checkbox"
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
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                  style={{ color: tag.color }}
                >
                  <input
                    type="checkbox"
                    checked={tagIds.includes(tag.id)}
                    onChange={() => toggleSelection(tag.id, tagIds, setTagIds)}
                  />
                  #{tag.name}
                </label>
              ))}
            </div>
          </fieldset>

          {error && <p className="text-sm text-[#9b4f4f]">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <Button type="submit">
              {note ? "Änderungen speichern" : "Notiz erstellen"}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Abbrechen
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
