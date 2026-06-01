import type { Contact, Note, Tag } from "@/types/humanbase";

type NoteCardProps = {
  note: Note;
  contacts: Contact[];
  tags: Tag[];
  onContactClick: (contactId: string) => void;
  onTagClick: (tagId: string) => void;
};

export function NoteCard({
  note,
  contacts,
  tags,
  onContactClick,
  onTagClick,
}: NoteCardProps) {
  const noteContacts = contacts.filter((contact) =>
    note.contactIds.includes(contact.id),
  );
  const noteTags = tags.filter((tag) => note.tagIds.includes(tag.id));

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <h3 className="text-xl font-semibold tracking-tight">{note.title}</h3>
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
