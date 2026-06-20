"use client";

import { useEffect, useMemo, useState } from "react";

import type { Contact, Note, Tag } from "@/types/humanbase";

import { Button } from "@/components/ui/button";

export type NoteFormInput = Pick<
  Note,
  "title" | "content" | "date" | "contactIds" | "tagIds"
>;

type NoteFormProps = {
  contacts: Contact[];
  featuredContactIds: string[];
  featuredContactsLabel: string;
  tags: Tag[];
  note?: Note;
  onCreateTag: (name: string) => Promise<
    | { ok: true; tag: Tag }
    | { ok: false; error: string }
  >;
  onSubmit: (note: NoteFormInput) => void | Promise<void>;
  onCancel: () => void;
  submitError?: string;
  isSubmitting?: boolean;
};

const inputClasses =
  "min-h-12 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-base outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] sm:min-h-11 sm:text-sm";

function getLocalDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function NoteForm({
  contacts,
  featuredContactIds,
  featuredContactsLabel,
  tags,
  note,
  onCreateTag,
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
  const [contactQuery, setContactQuery] = useState("");
  const [tagQuery, setTagQuery] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [error, setError] = useState("");

  const selectedContacts = useMemo(
    () => contacts.filter((contact) => contactIds.includes(contact.id)),
    [contactIds, contacts],
  );
  const selectedTags = useMemo(
    () => tags.filter((tag) => tagIds.includes(tag.id)),
    [tagIds, tags],
  );
  const visibleContacts = useMemo(() => {
    const normalizedQuery = contactQuery.trim().toLocaleLowerCase("de");
    const unselectedContacts = contacts.filter(
      (contact) => !contactIds.includes(contact.id),
    );

    if (!normalizedQuery) {
      return unselectedContacts;
    }

    return unselectedContacts.filter((contact) =>
      [contact.displayName, contact.email, contact.phone]
        .filter(Boolean)
        .some((value) =>
          value?.toLocaleLowerCase("de").includes(normalizedQuery),
        ),
    );
  }, [contactIds, contactQuery, contacts]);
  const featuredContacts = useMemo(
    () =>
      featuredContactIds
        .map((contactId) =>
          visibleContacts.find((contact) => contact.id === contactId),
        )
        .filter((contact): contact is Contact => contact !== undefined),
    [featuredContactIds, visibleContacts],
  );
  const visibleTags = useMemo(() => {
    const normalizedQuery = tagQuery
      .trim()
      .replace(/^#+\s*/, "")
      .toLocaleLowerCase("de");
    const unselectedTags = tags.filter((tag) => !tagIds.includes(tag.id));

    if (!normalizedQuery) {
      return unselectedTags.slice(0, 8);
    }

    return unselectedTags
      .filter((tag) =>
        tag.name.toLocaleLowerCase("de").includes(normalizedQuery),
      )
      .slice(0, 20);
  }, [tagIds, tagQuery, tags]);
  const normalizedTagQuery = tagQuery.trim().replace(/^#+\s*/, "");
  const tagAlreadyExists = tags.some(
    (tag) =>
      tag.name.toLocaleLowerCase("de") ===
      normalizedTagQuery.toLocaleLowerCase("de"),
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting && !isCreatingTag) {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCreatingTag, isSubmitting, onCancel]);

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

  function addContact(contactId: string) {
    setContactIds((currentIds) => [...currentIds, contactId]);
    setContactQuery("");
  }

  function addTag(tagId: string) {
    setTagIds((currentIds) => [...currentIds, tagId]);
    setTagQuery("");
  }

  async function createAndSelectTag() {
    if (!normalizedTagQuery || tagAlreadyExists || isCreatingTag) {
      return;
    }

    setError("");
    setIsCreatingTag(true);

    try {
      const result = await onCreateTag(normalizedTagQuery);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setTagIds((currentIds) => [...currentIds, result.tag.id]);
      setTagQuery("");
    } catch {
      setError("Der Tag konnte nicht erstellt werden.");
    } finally {
      setIsCreatingTag(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isCreatingTag) {
      setError("Bitte warte, bis der neue Tag erstellt wurde.");
      return;
    }

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
            disabled={isSubmitting || isCreatingTag}
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
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit}
        >
          <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto px-4 py-5 sm:px-5">
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

          <fieldset className="grid w-full gap-2 sm:max-w-80">
            <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
              Datum
            </span>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <input
                aria-label="Datum"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={inputClasses}
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setDate(getLocalDateString())}
              >
                Heute
              </Button>
            </div>
          </fieldset>

          <div className="grid items-start gap-4 md:grid-cols-2">
            <fieldset className="min-w-0 rounded-2xl border border-[var(--border)] p-4">
              <legend className="px-1 text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                Kontakte
              </legend>

              {selectedContacts.length > 0 ? (
                <div
                  aria-label="Ausgewählte Kontakte"
                  className="mb-3 flex flex-wrap gap-2"
                >
                  {selectedContacts.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() =>
                        toggleSelection(
                          contact.id,
                          contactIds,
                          setContactIds,
                        )
                      }
                      className="inline-flex min-h-9 max-w-full cursor-pointer items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-left text-xs font-semibold text-[var(--accent)]"
                      title={`${contact.displayName} entfernen`}
                    >
                      <span className="truncate">{contact.displayName}</span>
                      <span aria-hidden="true">×</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mb-3 text-xs text-[var(--muted)]">
                  Noch keine Kontakte ausgewählt.
                </p>
              )}

              <label className="grid gap-2">
                <span className="sr-only">Kontakte suchen</span>
                <input
                  type="search"
                  value={contactQuery}
                  onChange={(event) => setContactQuery(event.target.value)}
                  placeholder="Name oder E-Mail suchen"
                  className={inputClasses}
                />
              </label>

              <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-1">
                {visibleContacts.length > 0 ? (
                  <>
                    {!contactQuery && featuredContacts.length > 0 ? (
                      <>
                        <p className="px-3 pt-2 pb-1 text-[0.65rem] font-bold tracking-wider text-[var(--muted)] uppercase">
                          {featuredContactsLabel}
                        </p>
                        {featuredContacts.map((contact) => (
                          <button
                            key={`featured-${contact.id}`}
                            type="button"
                            onClick={() => addContact(contact.id)}
                            className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--accent-soft)]"
                          >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm text-[var(--accent)]">
                              ★
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold">
                                {contact.displayName}
                              </span>
                              {contact.email ? (
                                <span className="block truncate text-xs text-[var(--muted)]">
                                  {contact.email}
                                </span>
                              ) : null}
                            </span>
                          </button>
                        ))}
                        <div className="mx-2 my-1 border-t border-[var(--border)]" />
                        <p className="px-3 pt-2 pb-1 text-[0.65rem] font-bold tracking-wider text-[var(--muted)] uppercase">
                          Alle Kontakte
                        </p>
                      </>
                    ) : contactQuery ? (
                      <p className="px-3 pt-2 pb-1 text-[0.65rem] font-bold tracking-wider text-[var(--muted)] uppercase">
                        Suchergebnisse
                      </p>
                    ) : null}

                    {visibleContacts.map((contact) => (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => addContact(contact.id)}
                        className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--accent-soft)]"
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent)]">
                          {contact.displayName
                            .slice(0, 1)
                            .toLocaleUpperCase("de")}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {contact.displayName}
                          </span>
                          {contact.email ? (
                            <span className="block truncate text-xs text-[var(--muted)]">
                              {contact.email}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    ))}
                  </>
                ) : (
                  <p className="px-3 py-5 text-center text-xs text-[var(--muted)]">
                    Keine passenden Kontakte gefunden.
                  </p>
                )}
              </div>
            </fieldset>

            <fieldset className="min-w-0 rounded-2xl border border-[var(--border)] p-4">
              <legend className="px-1 text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                Tags
              </legend>

              {selectedTags.length > 0 ? (
                <div
                  aria-label="Ausgewählte Tags"
                  className="mb-3 flex flex-wrap gap-2"
                >
                  {selectedTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        toggleSelection(tag.id, tagIds, setTagIds)
                      }
                      className="inline-flex min-h-9 max-w-full cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-left text-xs font-semibold"
                      style={{ color: tag.color }}
                      title={`Tag ${tag.name} entfernen`}
                    >
                      <span className="truncate">#{tag.name}</span>
                      <span aria-hidden="true">×</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mb-3 text-xs text-[var(--muted)]">
                  Noch keine Tags ausgewählt.
                </p>
              )}

              <label className="grid gap-2">
                <span className="sr-only">Tags suchen oder erstellen</span>
                <input
                  type="search"
                  value={tagQuery}
                  onChange={(event) => setTagQuery(event.target.value)}
                  placeholder="Tag suchen oder neu anlegen"
                  className={inputClasses}
                />
              </label>

              <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-1">
                {normalizedTagQuery && !tagAlreadyExists ? (
                  <button
                    type="button"
                    disabled={isCreatingTag}
                    onClick={createAndSelectTag}
                    className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft)] disabled:pointer-events-none disabled:opacity-60"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-lg">
                      +
                    </span>
                    {isCreatingTag
                      ? "Tag wird erstellt …"
                      : `#${normalizedTagQuery} hinzufügen`}
                  </button>
                ) : null}

                {visibleTags.length > 0 ? (
                  visibleTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => addTag(tag.id)}
                      className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--accent-soft)]"
                    >
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{
                          backgroundColor: tag.color ?? "var(--accent)",
                        }}
                      />
                      <span
                        className="truncate text-sm font-semibold"
                        style={{ color: tag.color }}
                      >
                        #{tag.name}
                      </span>
                    </button>
                  ))
                ) : normalizedTagQuery && !tagAlreadyExists ? null : (
                  <p className="px-3 py-5 text-center text-xs text-[var(--muted)]">
                    Keine passenden Tags gefunden.
                  </p>
                )}
              </div>
              {!tagQuery && tags.length > visibleTags.length ? (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Suche nach weiteren Tags.
                </p>
              ) : null}
            </fieldset>
          </div>

          {(error || submitError) && (
            <p role="alert" className="text-sm text-[#9b4f4f]">
              {error || submitError}
            </p>
          )}
          </div>

          <div className="z-10 grid shrink-0 grid-cols-2 gap-2 border-t border-[var(--border)] bg-[var(--card)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:grid-cols-[auto_auto] sm:justify-start sm:px-5 sm:pb-3">
            <Button
              type="submit"
              disabled={isSubmitting || isCreatingTag}
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
              disabled={isSubmitting || isCreatingTag}
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
