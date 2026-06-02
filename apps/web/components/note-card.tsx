import type { Contact, Note, Tag } from "@/types/humanbase";

import { Button } from "@/components/ui/button";

type NoteCardProps = {
  note: Note;
  contacts: Contact[];
  tags: Tag[];
  onContactClick: (contactId: string) => void;
  onTagClick: (tagId: string) => void;
  onEditClick: (note: Note) => void;
  onDeleteClick: (note: Note) => void;
  isDeleting?: boolean;
};

export function NoteCard({
  note,
  contacts,
  tags,
  onContactClick,
  onTagClick,
  onEditClick,
  onDeleteClick,
  isDeleting = false,
}: NoteCardProps) {
  const noteContacts = contacts.filter((contact) =>
    note.contactIds.includes(contact.id),
  );
  const noteTags = tags.filter((tag) => note.tagIds.includes(tag.id));

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-semibold tracking-tight">{note.title}</h3>
        <div className="flex gap-1">
          <Button
            aria-label={`${note.title} bearbeiten`}
            title="Bearbeiten"
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            onClick={() => onEditClick(note)}
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
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </Button>
          <Button
            aria-label={`${note.title} löschen`}
            title="Löschen"
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            onClick={() => onDeleteClick(note)}
            className="text-[#9b4f4f] hover:bg-[#f4e5e5]"
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
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{note.content}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {noteContacts.map((contact) => (
          <button
            key={contact.id}
            type="button"
            onClick={() => onContactClick(contact.id)}
            className="cursor-pointer rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)] transition hover:bg-[#cfe3db]"
          >
            {contact.displayName}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {noteTags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onTagClick(tag.id)}
            className="cursor-pointer rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold transition hover:border-[var(--accent)]"
            style={{ color: tag.color }}
          >
            #{tag.name}
          </button>
        ))}
      </div>
    </article>
  );
}
