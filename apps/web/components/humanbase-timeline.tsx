"use client";

import { useMemo, useState } from "react";

import { NoteForm, type NoteFormInput } from "@/components/note-form";
import { NotesTimeline } from "@/components/notes-timeline";
import { TimelineFilters } from "@/components/timeline-filters";
import { Button } from "@/components/ui/button";
import { mockContacts, mockNotes, mockTags } from "@/data/mock-data";
import { filterNotes } from "@/lib/filter-notes";
import type { Note } from "@/types/humanbase";

export function HumanbaseTimeline() {
  const [notes, setNotes] = useState(mockNotes);
  const [query, setQuery] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [selectedTagId, setSelectedTagId] = useState("");
  const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const filteredNotes = useMemo(
    () =>
      filterNotes({
        notes,
        contacts: mockContacts,
        tags: mockTags,
        query,
        contactId: selectedContactId,
        tagId: selectedTagId,
      }),
    [notes, query, selectedContactId, selectedTagId],
  );

  function clearFilters() {
    setQuery("");
    setSelectedContactId("");
    setSelectedTagId("");
  }

  function createNote(note: NoteFormInput) {
    const timestamp = new Date().toISOString();

    setNotes((currentNotes) => [
      {
        ...note,
        id: crypto.randomUUID(),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      ...currentNotes,
    ]);
  }

  function updateNote(note: NoteFormInput) {
    if (!editingNote) {
      return;
    }

    setNotes((currentNotes) =>
      currentNotes.map((currentNote) =>
        currentNote.id === editingNote.id
          ? {
              ...currentNote,
              ...note,
              updatedAt: new Date().toISOString(),
            }
          : currentNote,
      ),
    );
  }

  function openCreateForm() {
    setEditingNote(null);
    setIsNoteFormOpen(true);
  }

  function openEditForm(note: Note) {
    setEditingNote(note);
    setIsNoteFormOpen(true);
  }

  function closeNoteForm() {
    setEditingNote(null);
    setIsNoteFormOpen(false);
  }

  function saveNote(note: NoteFormInput) {
    if (editingNote) {
      updateNote(note);
    } else {
      createNote(note);
    }

    closeNoteForm();
  }

  function deleteNote(note: Note) {
    if (!window.confirm(`Notiz "${note.title}" wirklich löschen?`)) {
      return;
    }

    setNotes((currentNotes) =>
      currentNotes.filter((currentNote) => currentNote.id !== note.id),
    );
  }

  return (
    <>
      {isNoteFormOpen ? (
        <NoteForm
          key={editingNote?.id ?? "new"}
          contacts={mockContacts}
          tags={mockTags}
          note={editingNote ?? undefined}
          onSubmit={saveNote}
          onCancel={closeNoteForm}
        />
      ) : (
        <div className="mb-6 flex justify-end">
          <Button onClick={openCreateForm}>Neue Notiz</Button>
        </div>
      )}

      <TimelineFilters
        contacts={mockContacts}
        tags={mockTags}
        query={query}
        selectedContactId={selectedContactId}
        selectedTagId={selectedTagId}
        onQueryChange={setQuery}
        onContactChange={setSelectedContactId}
        onTagChange={setSelectedTagId}
        onClear={clearFilters}
      />

      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Timeline</h2>
        <p className="text-sm text-[var(--muted)]">
          {filteredNotes.length} von {notes.length} Notizen
        </p>
      </div>

      <NotesTimeline
        notes={filteredNotes}
        contacts={mockContacts}
        tags={mockTags}
        onContactClick={setSelectedContactId}
        onTagClick={setSelectedTagId}
        onEditClick={openEditForm}
        onDeleteClick={deleteNote}
      />
    </>
  );
}
