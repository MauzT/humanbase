"use client";

import { useMemo, useState } from "react";

import {
  createNoteForCurrentUser,
  deleteNoteForCurrentUser,
  updateNoteForCurrentUser,
} from "@/app/actions";
import { NoteForm, type NoteFormInput } from "@/components/note-form";
import { NotesTimeline } from "@/components/notes-timeline";
import { TimelineFilters } from "@/components/timeline-filters";
import { Button } from "@/components/ui/button";
import { filterNotes } from "@/lib/filter-notes";
import type { Contact, Note, Tag } from "@/types/humanbase";

type HumanbaseTimelineProps = {
  notes: Note[];
  contacts: Contact[];
  tags: Tag[];
};

export function HumanbaseTimeline({
  notes: initialNotes,
  contacts,
  tags,
}: HumanbaseTimelineProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [query, setQuery] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [selectedTagId, setSelectedTagId] = useState("");
  const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [saveError, setSaveError] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState("");

  const filteredNotes = useMemo(
    () =>
      filterNotes({
        notes,
        contacts,
        tags,
        query,
        contactId: selectedContactId,
        tagId: selectedTagId,
      }),
    [notes, contacts, tags, query, selectedContactId, selectedTagId],
  );

  function clearFilters() {
    setQuery("");
    setSelectedContactId("");
    setSelectedTagId("");
  }

  async function createNote(note: NoteFormInput) {
    setSaveError("");
    setIsSavingNote(true);

    try {
      const result = await createNoteForCurrentUser(note);

      if (!result.ok) {
        setSaveError(result.error);
        return;
      }

      setNotes((currentNotes) => [result.note, ...currentNotes]);
      closeNoteForm();
    } catch {
      setSaveError(
        "Die Notiz konnte nicht gespeichert werden. Pruefe PostgreSQL und DATABASE_URL.",
      );
    } finally {
      setIsSavingNote(false);
    }
  }

  async function updateNote(note: NoteFormInput) {
    if (!editingNote) {
      return;
    }

    setSaveError("");
    setIsSavingNote(true);

    try {
      const result = await updateNoteForCurrentUser({
        id: editingNote.id,
        ...note,
      });

      if (!result.ok) {
        setSaveError(result.error);
        return;
      }

      setNotes((currentNotes) =>
        currentNotes.map((currentNote) =>
          currentNote.id === result.note.id ? result.note : currentNote,
        ),
      );
      closeNoteForm();
    } catch {
      setSaveError(
        "Die Notiz konnte nicht gespeichert werden. Pruefe PostgreSQL und DATABASE_URL.",
      );
    } finally {
      setIsSavingNote(false);
    }
  }

  function openCreateForm() {
    setSaveError("");
    setEditingNote(null);
    setIsNoteFormOpen(true);
  }

  function openEditForm(note: Note) {
    setSaveError("");
    setEditingNote(note);
    setIsNoteFormOpen(true);
  }

  function closeNoteForm() {
    setSaveError("");
    setEditingNote(null);
    setIsNoteFormOpen(false);
  }

  async function saveNote(note: NoteFormInput) {
    if (editingNote) {
      await updateNote(note);
    } else {
      await createNote(note);
    }
  }

  async function deleteNote(note: Note) {
    if (deletingNoteId) {
      return;
    }

    if (!window.confirm(`Notiz "${note.title}" wirklich löschen?`)) {
      return;
    }

    setDeletingNoteId(note.id);

    try {
      const result = await deleteNoteForCurrentUser(note.id);

      if (!result.ok) {
        window.alert(result.error);
        return;
      }

      setNotes((currentNotes) =>
        currentNotes.filter((currentNote) => currentNote.id !== note.id),
      );
    } finally {
      setDeletingNoteId("");
    }
  }

  return (
    <>
      {isNoteFormOpen ? (
        <NoteForm
          key={editingNote?.id ?? "new"}
          contacts={contacts}
          tags={tags}
          note={editingNote ?? undefined}
          onSubmit={saveNote}
          onCancel={closeNoteForm}
          submitError={saveError}
          isSubmitting={isSavingNote}
        />
      ) : (
        <div className="mb-6 flex justify-end">
          <Button onClick={openCreateForm}>Neue Notiz</Button>
        </div>
      )}

      <TimelineFilters
        contacts={contacts}
        tags={tags}
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
        contacts={contacts}
        tags={tags}
        onContactClick={setSelectedContactId}
        onTagClick={setSelectedTagId}
        onEditClick={openEditForm}
        onDeleteClick={deleteNote}
        deletingNoteId={deletingNoteId}
      />
    </>
  );
}
