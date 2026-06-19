import type { Contact, Tag } from "@/types/humanbase";

import { Button } from "@/components/ui/button";

type TimelineFiltersProps = {
  contacts: Contact[];
  tags: Tag[];
  query: string;
  selectedContactId: string;
  selectedTagId: string;
  onQueryChange: (query: string) => void;
  onContactChange: (contactId: string) => void;
  onTagChange: (tagId: string) => void;
  onClear: () => void;
};

const inputClasses =
  "h-12 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-base outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] sm:h-11 sm:text-sm";

export function TimelineFilters({
  contacts,
  tags,
  query,
  selectedContactId,
  selectedTagId,
  onQueryChange,
  onContactChange,
  onTagChange,
  onClear,
}: TimelineFiltersProps) {
  const hasFilters = Boolean(query || selectedContactId || selectedTagId);

  return (
    <section
      aria-label="Timeline filtern"
      className="mb-6 rounded-2xl border border-[var(--border)] bg-[rgba(255,253,249,0.82)] p-4 shadow-sm backdrop-blur sm:mb-8 sm:p-5"
    >
      <div className="grid gap-3 md:grid-cols-[1fr_13rem_13rem_auto] md:items-end">
        <label className="grid gap-2">
          <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
            Suche
          </span>
          <input
            type="search"
            inputMode="search"
            enterKeyHint="search"
            aria-label="Notizen durchsuchen"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Titel, Inhalt, Kontakt oder Tag"
            className={inputClasses}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
            Kontakt
          </span>
          <select
            value={selectedContactId}
            onChange={(event) => onContactChange(event.target.value)}
            className={inputClasses}
          >
            <option value="">Alle Kontakte</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.displayName}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
            Tag
          </span>
          <select
            value={selectedTagId}
            onChange={(event) => onTagChange(event.target.value)}
            className={inputClasses}
          >
            <option value="">Alle Tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </label>

        <Button
          variant="outline"
          onClick={onClear}
          disabled={!hasFilters}
          className="w-full md:w-auto md:px-4"
        >
          Zurücksetzen
        </Button>
      </div>
    </section>
  );
}
