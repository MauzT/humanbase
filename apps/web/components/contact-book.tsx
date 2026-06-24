"use client";

import { useEffect, useMemo, useState } from "react";

import {
  createContactRelationshipForCurrentUser,
  deleteContactRelationshipForCurrentUser,
  linkContactRelationshipForCurrentUser,
  updateContactRelationshipForCurrentUser,
} from "@/app/actions";
import { ContactAvatar } from "@/components/contact-avatar";
import { Button } from "@/components/ui/button";
import {
  contactRelationshipCategories,
  contactRelationshipTypeOptions,
  getRelationshipTypeLabel,
} from "@/lib/contact-relationship-options";
import type { Contact, ContactRelationship } from "@/types/humanbase";

type ContactBookProps = {
  contacts: Contact[];
  contactRelationships: ContactRelationship[];
  onRelationshipSaved: (relationship: ContactRelationship) => void;
  onRelationshipDeleted: (relationshipId: string) => void;
  onClose: () => void;
};

type RelationshipFormState = {
  id?: string;
  fromContactId: string;
  toContactId: string;
  relatedName: string;
  relationType: string;
  inverseRelationType: string;
  category: ContactRelationship["category"];
  note: string;
};

type DisplayRelationship = {
  relationship: ContactRelationship;
  category: ContactRelationship["category"];
  direction: "outgoing" | "incoming";
  relationType: string;
  personLabel: string;
  linkedContactId?: string;
  note?: string;
};

const inputClasses =
  "min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-base outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] sm:text-sm";
const textareaClasses = `${inputClasses} min-h-24 py-3`;
const categoryOrder = contactRelationshipCategories.map(({ value }) => value);
const customRelationValue = "__custom";

function formatSyncDate(value?: string) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getCategoryLabel(category: ContactRelationship["category"]) {
  return (
    contactRelationshipCategories.find((option) => option.value === category)
      ?.label ?? "Sonstiges"
  );
}

function getContactLabel(contact?: Contact) {
  return contact?.displayName ?? "Name unbekannt";
}

function createEmptyForm(contactId: string): RelationshipFormState {
  return {
    fromContactId: contactId,
    toContactId: "",
    relatedName: "",
    relationType: "friend",
    inverseRelationType: "",
    category: "friends",
    note: "",
  };
}

function createEditForm(
  relationship: ContactRelationship,
): RelationshipFormState {
  return {
    id: relationship.id,
    fromContactId: relationship.fromContactId,
    toContactId: relationship.toContactId ?? "",
    relatedName: relationship.relatedName ?? "",
    relationType: relationship.relationType,
    inverseRelationType: relationship.inverseRelationType ?? "",
    category: relationship.category,
    note: relationship.note ?? "",
  };
}

export function ContactBook({
  contacts,
  contactRelationships,
  onRelationshipSaved,
  onRelationshipDeleted,
  onClose,
}: ContactBookProps) {
  const [query, setQuery] = useState("");
  const [selectedContactId, setSelectedContactId] = useState(
    contacts[0]?.id ?? "",
  );
  const [form, setForm] = useState<RelationshipFormState | null>(null);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quickLinkRelationshipId, setQuickLinkRelationshipId] = useState("");
  const [quickLinkContactId, setQuickLinkContactId] = useState("");

  const contactById = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact])),
    [contacts],
  );
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
  const selectedContact =
    contactById.get(selectedContactId) ?? visibleContacts[0] ?? contacts[0];
  const relationshipViews = useMemo<DisplayRelationship[]>(() => {
    if (!selectedContact) {
      return [];
    }

    const views: DisplayRelationship[] = [];

    for (const relationship of contactRelationships) {
      if (relationship.fromContactId === selectedContact.id) {
        const linkedContact = relationship.toContactId
          ? contactById.get(relationship.toContactId)
          : undefined;

        views.push({
          relationship,
          category: relationship.category,
          direction: "outgoing",
          relationType: relationship.relationType,
          personLabel:
            linkedContact?.displayName ??
            relationship.relatedName ??
            "Name unbekannt",
          linkedContactId: linkedContact?.id,
          note: relationship.note,
        });
      }

      if (relationship.toContactId === selectedContact.id) {
        const sourceContact = contactById.get(relationship.fromContactId);

        views.push({
          relationship,
          category: relationship.category,
          direction: "incoming",
          relationType:
            relationship.inverseRelationType ?? relationship.relationType,
          personLabel: getContactLabel(sourceContact),
          linkedContactId: sourceContact?.id,
          note: relationship.note,
        });
      }
    }

    return views.sort((first, second) => {
      return (
        categoryOrder.indexOf(first.category) -
          categoryOrder.indexOf(second.category) ||
        first.personLabel.localeCompare(second.personLabel, "de")
      );
    });
  }, [contactById, contactRelationships, selectedContact]);
  const groupedRelationships = useMemo(
    () =>
      contactRelationshipCategories.map((category) => ({
        ...category,
        relationships: relationshipViews.filter(
          (relationship) => relationship.category === category.value,
        ),
      })),
    [relationshipViews],
  );
  const selectedPresetValue = form
    ? contactRelationshipTypeOptions.some(
        (option) => option.value === form.relationType,
      )
      ? form.relationType
      : customRelationValue
    : "friend";
  const availableLinkContacts = selectedContact
    ? contacts.filter((contact) => contact.id !== selectedContact.id)
    : contacts;

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

  function startCreateRelationship() {
    if (!selectedContact) {
      return;
    }

    setForm(createEmptyForm(selectedContact.id));
    setFormError("");
    setQuickLinkRelationshipId("");
  }

  function startEditRelationship(relationship: ContactRelationship) {
    setForm(createEditForm(relationship));
    setFormError("");
    setQuickLinkRelationshipId("");
  }

  async function saveRelationship(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form) {
      return;
    }

    const relationType = form.relationType.trim();

    if (!relationType) {
      setFormError("Bitte gib eine Beziehungsart ein.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const payload = {
        fromContactId: form.fromContactId,
        toContactId: form.toContactId || undefined,
        relatedName: form.relatedName,
        relationType,
        inverseRelationType: form.inverseRelationType,
        category: form.category,
        note: form.note,
      };
      const result = form.id
        ? await updateContactRelationshipForCurrentUser({
            id: form.id,
            ...payload,
          })
        : await createContactRelationshipForCurrentUser(payload);

      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      onRelationshipSaved(result.relationship);
      setForm(null);
    } catch {
      setFormError("Die Beziehung konnte nicht gespeichert werden.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteRelationship(relationship: ContactRelationship) {
    if (
      !window.confirm(
        `Beziehung "${getRelationshipTypeLabel(
          relationship.relationType,
        )}" wirklich löschen?`,
      )
    ) {
      return;
    }

    const result = await deleteContactRelationshipForCurrentUser(
      relationship.id,
    );

    if (!result.ok) {
      window.alert(result.error);
      return;
    }

    onRelationshipDeleted(result.relationshipId);
  }

  async function quickLinkRelationship(relationship: ContactRelationship) {
    if (!quickLinkContactId) {
      return;
    }

    const result = await linkContactRelationshipForCurrentUser({
      id: relationship.id,
      toContactId: quickLinkContactId,
    });

    if (!result.ok) {
      window.alert(result.error);
      return;
    }

    onRelationshipSaved(result.relationship);
    setQuickLinkRelationshipId("");
    setQuickLinkContactId("");
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
        className="flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden bg-[var(--card)] shadow-xl sm:h-[calc(100dvh-4rem)] sm:rounded-2xl sm:border sm:border-[var(--border)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 id="contact-book-title" className="text-lg font-semibold">
              Kontaktbuch
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Google-Kontakte mit Humanbase-Beziehungen.
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

        <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] sm:grid-cols-[minmax(18rem,22rem)_1fr] sm:grid-rows-1">
          <aside className="flex min-h-0 flex-col border-b border-[var(--border)] p-4 sm:border-r sm:border-b-0 sm:p-5">
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

            <div className="mt-4 flex items-baseline justify-between gap-4">
              <h3 className="font-semibold">Kontakte</h3>
              <span className="text-xs text-[var(--muted)]">
                {visibleContacts.length} von {contacts.length}
              </span>
            </div>

            <div className="mt-3 min-h-0 max-h-52 overflow-x-hidden overflow-y-auto px-1 py-1 [scrollbar-gutter:stable] sm:max-h-none sm:flex-1">
              {visibleContacts.length > 0 ? (
                <ul className="grid min-w-0 gap-2 pr-3">
                  {visibleContacts.map((contact) => (
                    <li key={contact.id} className="min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedContactId(contact.id);
                          setForm(null);
                          setQuickLinkRelationshipId("");
                        }}
                        className={`flex w-full max-w-full min-w-0 items-center gap-3 overflow-hidden rounded-xl border p-3 text-left transition ${
                          selectedContact?.id === contact.id
                            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                            : "border-[var(--border)] hover:border-[var(--accent)]"
                        }`}
                      >
                        <ContactAvatar
                          contact={contact}
                          className="size-10 text-sm"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {contact.displayName}
                          </span>
                          <span className="mt-1 block truncate text-xs text-[var(--muted)]">
                            {contact.email ?? contact.phone ?? "Kein Detail"}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
                  {contacts.length === 0
                    ? "Noch keine Google-Kontakte synchronisiert."
                    : "Keine passenden Kontakte gefunden."}
                </p>
              )}
            </div>
          </aside>

          <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
            {selectedContact ? (
              <div className="mx-auto flex max-w-3xl flex-col gap-5">
                <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <ContactAvatar
                      contact={selectedContact}
                      className="size-16 text-lg"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words text-xl font-semibold">
                          {selectedContact.displayName}
                        </h3>
                        {selectedContact.isFavorite ? (
                          <span
                            aria-label="Google-Favorit"
                            title="Google-Favorit"
                            className="text-[var(--accent)]"
                          >
                            ★
                          </span>
                        ) : null}
                      </div>
                      {selectedContact.email ? (
                        <a
                          href={`mailto:${selectedContact.email}`}
                          className="mt-2 block break-words text-sm text-[var(--accent)] hover:underline"
                        >
                          {selectedContact.email}
                        </a>
                      ) : null}
                      {selectedContact.phone ? (
                        <a
                          href={`tel:${selectedContact.phone}`}
                          className="mt-1 block text-sm text-[var(--muted)] hover:text-[var(--accent)]"
                        >
                          {selectedContact.phone}
                        </a>
                      ) : null}
                      {formatSyncDate(selectedContact.lastSyncedAt) ? (
                        <p className="mt-2 text-xs text-[var(--muted)]">
                          Synchronisiert:{" "}
                          {formatSyncDate(selectedContact.lastSyncedAt)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <Button
                    className="w-full sm:w-auto"
                    onClick={startCreateRelationship}
                  >
                    Beziehung hinzufügen
                  </Button>
                </header>

                {form ? (
                  <form
                    onSubmit={saveRelationship}
                    className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex flex-col gap-2">
                        <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                          Kategorie
                        </span>
                        <select
                          value={form.category}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              category: event.target
                                .value as ContactRelationship["category"],
                            })
                          }
                          className={inputClasses}
                        >
                          {contactRelationshipCategories.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="flex flex-col gap-2">
                        <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                          Beziehung
                        </span>
                        <select
                          value={selectedPresetValue}
                          onChange={(event) => {
                            const preset = contactRelationshipTypeOptions.find(
                              (option) => option.value === event.target.value,
                            );

                            if (!preset) {
                              setForm({
                                ...form,
                                relationType: "",
                                inverseRelationType: "",
                              });
                              return;
                            }

                            setForm({
                              ...form,
                              relationType: preset.value,
                              inverseRelationType: preset.inverse,
                              category: preset.category,
                            });
                          }}
                          className={inputClasses}
                        >
                          {contactRelationshipTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                          <option value={customRelationValue}>Eigene</option>
                        </select>
                      </label>
                    </div>

                    {selectedPresetValue === customRelationValue ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex flex-col gap-2">
                          <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                            Eigene Beziehung
                          </span>
                          <input
                            value={form.relationType}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                relationType: event.target.value,
                              })
                            }
                            className={inputClasses}
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                            Gegenbeziehung
                          </span>
                          <input
                            value={form.inverseRelationType}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                inverseRelationType: event.target.value,
                              })
                            }
                            className={inputClasses}
                          />
                        </label>
                      </div>
                    ) : null}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex flex-col gap-2">
                        <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                          Verknüpfter Kontakt
                        </span>
                        <select
                          value={form.toContactId}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              toContactId: event.target.value,
                              relatedName: event.target.value
                                ? ""
                                : form.relatedName,
                            })
                          }
                          className={inputClasses}
                        >
                          <option value="">Nicht verknüpft</option>
                          {contacts
                            .filter((contact) => contact.id !== form.fromContactId)
                            .map((contact) => (
                              <option key={contact.id} value={contact.id}>
                                {contact.displayName}
                              </option>
                            ))}
                        </select>
                      </label>

                      <label className="flex flex-col gap-2">
                        <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                          Name
                        </span>
                        <input
                          value={form.relatedName}
                          disabled={Boolean(form.toContactId)}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              relatedName: event.target.value,
                            })
                          }
                          placeholder="Optional"
                          className={inputClasses}
                        />
                      </label>
                    </div>

                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                        Notiz
                      </span>
                      <textarea
                        value={form.note}
                        onChange={(event) =>
                          setForm({ ...form, note: event.target.value })
                        }
                        placeholder="z.B. ist 9 Jahre älter"
                        className={textareaClasses}
                      />
                    </label>

                    {formError ? (
                      <p
                        role="alert"
                        className="rounded-xl border border-[#a94442] bg-[#fff1f0] px-4 py-3 text-sm text-[#7d2e2c]"
                      >
                        {formError}
                      </p>
                    ) : null}

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <Button
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={() => setForm(null)}
                      >
                        Abbrechen
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Speichert..." : "Speichern"}
                      </Button>
                    </div>
                  </form>
                ) : null}

                <section className="flex flex-col gap-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-lg font-semibold">Beziehungen</h3>
                    <span className="text-xs text-[var(--muted)]">
                      {relationshipViews.length}
                    </span>
                  </div>

                  {relationshipViews.length > 0 ? (
                    groupedRelationships.map((group) =>
                      group.relationships.length > 0 ? (
                        <div key={group.value} className="flex flex-col gap-2">
                          <h4 className="text-sm font-semibold">
                            {group.label}
                          </h4>
                          <ul className="grid gap-2">
                            {group.relationships.map((displayRelationship) => {
                              const { relationship } = displayRelationship;
                              const canEdit =
                                relationship.fromContactId ===
                                selectedContact.id;
                              const canQuickLink =
                                canEdit &&
                                !relationship.toContactId &&
                                availableLinkContacts.length > 0;

                              return (
                                <li
                                  key={`${relationship.id}-${displayRelationship.direction}`}
                                  className="rounded-xl border border-[var(--border)] p-3"
                                >
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                      <p className="break-words text-sm font-semibold">
                                        {getRelationshipTypeLabel(
                                          displayRelationship.relationType,
                                        )}
                                        : {displayRelationship.personLabel}
                                      </p>
                                      {displayRelationship.note ? (
                                        <p className="mt-1 break-words text-sm text-[var(--muted)]">
                                          {displayRelationship.note}
                                        </p>
                                      ) : null}
                                      {displayRelationship.direction ===
                                      "incoming" ? (
                                        <p className="mt-1 text-xs text-[var(--muted)]">
                                          Gegenseitige Ansicht aus{" "}
                                          {getCategoryLabel(
                                            displayRelationship.category,
                                          )}
                                        </p>
                                      ) : null}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      {displayRelationship.linkedContactId ? (
                                        <Button
                                          variant="ghost"
                                          onClick={() => {
                                            setSelectedContactId(
                                              displayRelationship.linkedContactId!,
                                            );
                                            setForm(null);
                                          }}
                                        >
                                          Öffnen
                                        </Button>
                                      ) : null}
                                      {canEdit ? (
                                        <>
                                          <Button
                                            variant="outline"
                                            onClick={() =>
                                              startEditRelationship(
                                                relationship,
                                              )
                                            }
                                          >
                                            Bearbeiten
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            onClick={() =>
                                              deleteRelationship(relationship)
                                            }
                                          >
                                            Löschen
                                          </Button>
                                        </>
                                      ) : null}
                                    </div>
                                  </div>

                                  {canQuickLink ? (
                                    <div className="mt-3 flex flex-col gap-2 border-t border-[var(--border)] pt-3 sm:flex-row">
                                      {quickLinkRelationshipId ===
                                      relationship.id ? (
                                        <>
                                          <select
                                            value={quickLinkContactId}
                                            onChange={(event) =>
                                              setQuickLinkContactId(
                                                event.target.value,
                                              )
                                            }
                                            className={inputClasses}
                                          >
                                            <option value="">
                                              Kontakt auswählen
                                            </option>
                                            {availableLinkContacts.map(
                                              (contact) => (
                                                <option
                                                  key={contact.id}
                                                  value={contact.id}
                                                >
                                                  {contact.displayName}
                                                </option>
                                              ),
                                            )}
                                          </select>
                                          <Button
                                            disabled={!quickLinkContactId}
                                            onClick={() =>
                                              quickLinkRelationship(
                                                relationship,
                                              )
                                            }
                                          >
                                            Verknüpfen
                                          </Button>
                                        </>
                                      ) : (
                                        <Button
                                          variant="outline"
                                          onClick={() => {
                                            setQuickLinkRelationshipId(
                                              relationship.id,
                                            );
                                            setQuickLinkContactId("");
                                          }}
                                        >
                                          Mit Kontakt verknüpfen
                                        </Button>
                                      )}
                                    </div>
                                  ) : null}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : null,
                    )
                  ) : (
                    <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
                      Noch keine Beziehungen gespeichert.
                    </p>
                  )}
                </section>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
                Noch keine Google-Kontakte synchronisiert.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
