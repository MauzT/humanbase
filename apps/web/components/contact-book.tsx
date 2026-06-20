"use client";

import { useEffect, useMemo, useState } from "react";

import { ContactAvatar } from "@/components/contact-avatar";
import { Button } from "@/components/ui/button";
import type { Contact } from "@/types/humanbase";

type ContactBookProps = {
  contacts: Contact[];
  onClose: () => void;
};

const inputClasses =
  "min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-base outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] sm:min-h-11 sm:text-sm";

function formatSyncDate(value?: string) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ContactBook({ contacts, onClose }: ContactBookProps) {
  const [query, setQuery] = useState("");
  const visibleContacts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("de");

    if (!normalizedQuery) {
      return contacts;
    }

    return contacts.filter((contact) =>
      [contact.displayName, contact.email, contact.phone]
        .filter(Boolean)
        .some((value) =>
          value?.toLocaleLowerCase("de").includes(normalizedQuery),
        ),
    );
  }, [contacts, query]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function handleBackdropPointerDown(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-stretch justify-center bg-[rgba(30,41,37,0.45)] sm:items-center sm:px-4 sm:py-8"
      onPointerDown={handleBackdropPointerDown}
    >
      <section
        aria-labelledby="contact-book-title"
        aria-modal="true"
        role="dialog"
        className="flex h-[100dvh] w-full max-w-3xl flex-col overflow-hidden bg-[var(--card)] shadow-xl sm:h-auto sm:max-h-[calc(100dvh-4rem)] sm:rounded-2xl sm:border sm:border-[var(--border)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 id="contact-book-title" className="text-lg font-semibold">
              Kontaktbuch
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Schreibgeschützt aus Google Kontakte synchronisiert.
            </p>
          </div>
          <Button
            aria-label="Kontaktbuch schließen"
            title="Schließen"
            variant="ghost"
            size="sm"
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

        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-5 sm:px-5">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
              Kontakte durchsuchen
            </span>
            <input
              autoFocus
              type="search"
              inputMode="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, E-Mail oder Telefonnummer"
              className={inputClasses}
            />
          </label>

          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-semibold">Kontakte</h3>
            <span className="text-xs text-[var(--muted)]">
              {visibleContacts.length} von {contacts.length}
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {visibleContacts.length > 0 ? (
              <ul className="grid gap-2 sm:grid-cols-2">
                {visibleContacts.map((contact) => {
                  const lastSyncedAt = formatSyncDate(contact.lastSyncedAt);

                  return (
                    <li
                      key={contact.id}
                      className="flex min-w-0 items-start gap-3 rounded-xl border border-[var(--border)] p-3"
                    >
                      <ContactAvatar
                        contact={contact}
                        className="size-12 text-base"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <p className="min-w-0 flex-1 break-words text-sm font-semibold">
                            {contact.displayName}
                          </p>
                          {contact.isFavorite ? (
                            <span
                              aria-label="Google-Favorit"
                              title="Google-Favorit"
                              className="shrink-0 text-[var(--accent)]"
                            >
                              ★
                            </span>
                          ) : null}
                        </div>
                        {contact.email ? (
                          <a
                            href={`mailto:${contact.email}`}
                            className="mt-1 block truncate text-xs text-[var(--accent)] hover:underline"
                          >
                            {contact.email}
                          </a>
                        ) : null}
                        {contact.phone ? (
                          <a
                            href={`tel:${contact.phone}`}
                            className="mt-1 block truncate text-xs text-[var(--muted)] hover:text-[var(--accent)]"
                          >
                            {contact.phone}
                          </a>
                        ) : null}
                        {lastSyncedAt ? (
                          <p className="mt-2 text-[0.65rem] text-[var(--muted)]">
                            Synchronisiert: {lastSyncedAt}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
                {contacts.length === 0
                  ? "Noch keine Google-Kontakte synchronisiert."
                  : "Keine passenden Kontakte gefunden."}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
