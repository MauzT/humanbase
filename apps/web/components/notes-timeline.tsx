import type { Contact, Note, Tag } from "@/types/humanbase";

import { NoteCard } from "@/components/note-card";

type NotesTimelineProps = {
  notes: Note[];
  contacts: Contact[];
  tags: Tag[];
  onContactClick: (contactId: string) => void;
  onTagClick: (tagId: string) => void;
  onEditClick: (note: Note) => void;
  onDeleteClick: (note: Note) => void;
  deletingNoteId?: string;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function NotesTimeline({
  notes,
  contacts,
  tags,
  onContactClick,
  onTagClick,
  onEditClick,
  onDeleteClick,
  deletingNoteId,
}: NotesTimelineProps) {
  if (notes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[rgba(255,253,249,0.65)] px-6 py-14 text-center">
        <h2 className="text-lg font-semibold">Keine passenden Notizen</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Passe die Suche oder die aktiven Filter an.
        </p>
      </div>
    );
  }

  const groupedNotes = notes.reduce<Record<string, Note[]>>((groups, note) => {
    groups[note.date] ??= [];
    groups[note.date].push(note);

    return groups;
  }, {});
  const sortedDates = Object.keys(groupedNotes).sort((a, b) =>
    b.localeCompare(a),
  );

  return (
    <div className="grid gap-8">
      {sortedDates.map((date) => (
        <section key={date}>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-sm font-bold tracking-wider text-[var(--accent)] uppercase">
              {formatDate(date)}
            </h2>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {groupedNotes[date].map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                contacts={contacts}
                tags={tags}
                onContactClick={onContactClick}
                onTagClick={onTagClick}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
                isDeleting={note.id === deletingNoteId}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
