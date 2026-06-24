"use client";

import { useMemo, useState } from "react";

import {
  createNoteForCurrentUser,
  createTagForCurrentUser,
  deleteNoteForCurrentUser,
  updateNoteForCurrentUser,
} from "@/app/actions";
import { ContactBook } from "@/components/contact-book";
import { NoteForm, type NoteFormInput } from "@/components/note-form";
import { NoteTemplateManager } from "@/components/note-template-manager";
import { NotesTimeline } from "@/components/notes-timeline";
import { TagManager } from "@/components/tag-manager";
import { TimelineFilters } from "@/components/timeline-filters";
import { Button } from "@/components/ui/button";
import { filterNotes } from "@/lib/filter-notes";
import type {
  Contact,
  ContactRelationship,
  Note,
  NoteTemplate,
  Tag,
} from "@/types/humanbase";

type HumanbaseTimelineProps = {
  notes: Note[];
  noteTemplates: NoteTemplate[];
  contacts: Contact[];
  contactRelationships: ContactRelationship[];
  tags: Tag[];
};

export function HumanbaseTimeline({
  notes: initialNotes,
  noteTemplates: initialNoteTemplates,
  contacts,
  contactRelationships: initialContactRelationships,
  tags: initialTags,
}: HumanbaseTimelineProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [noteTemplates, setNoteTemplates] = useState(initialNoteTemplates);
  const [contactRelationships, setContactRelationships] = useState(
    initialContactRelationships,
  );
  const [tags, setTags] = useState(initialTags);
  const [query, setQuery] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [selectedTagId, setSelectedTagId] = useState("");
  const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
  const [isNoteTemplateManagerOpen, setIsNoteTemplateManagerOpen] =
    useState(false);
  const [isContactBookOpen, setIsContactBookOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
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
  const featuredContacts = useMemo(() => {
    const googleFavorites = contacts.filter((contact) => contact.isFavorite);

    if (googleFavorites.length > 0) {
      return {
        ids: googleFavorites.map(({ id }) => id),
        label: "Google-Favoriten",
      };
    }

    const usage = new Map<string, { count: number; lastUsedAt: string }>();

    for (const note of notes) {
      for (const contactId of note.contactIds) {
        const current = usage.get(contactId);
        usage.set(contactId, {
          count: (current?.count ?? 0) + 1,
          lastUsedAt:
            !current || note.date > current.lastUsedAt
              ? note.date
              : current.lastUsedAt,
        });
      }
    }

    return {
      ids: contacts
        .filter((contact) => usage.has(contact.id))
        .sort((first, second) => {
          const firstUsage = usage.get(first.id)!;
          const secondUsage = usage.get(second.id)!;

          return (
            secondUsage.count - firstUsage.count ||
            secondUsage.lastUsedAt.localeCompare(firstUsage.lastUsedAt) ||
            first.displayName.localeCompare(second.displayName, "de")
          );
        })
        .slice(0, 5)
        .map(({ id }) => id),
      label: "Häufig verwendet",
    };
  }, [contacts, notes]);

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

  function addTag(tag: Tag) {
    setTags((currentTags) =>
      [...currentTags, tag].sort((first, second) =>
        first.name.localeCompare(second.name, "de"),
      ),
    );
  }

  async function createTag(name: string) {
    const result = await createTagForCurrentUser({
      name,
      color: "#276956",
    });

    if (result.ok) {
      addTag(result.tag);
    }

    return result;
  }

  function removeTag(tagId: string) {
    setTags((currentTags) => currentTags.filter((tag) => tag.id !== tagId));
    setNotes((currentNotes) =>
      currentNotes.map((note) => ({
        ...note,
        tagIds: note.tagIds.filter((currentTagId) => currentTagId !== tagId),
      })),
    );

    if (selectedTagId === tagId) {
      setSelectedTagId("");
    }
  }

  function addNoteTemplate(template: NoteTemplate) {
    setNoteTemplates((currentTemplates) =>
      [...currentTemplates, template].sort((first, second) =>
        first.name.localeCompare(second.name, "de"),
      ),
    );
  }

  function updateNoteTemplate(template: NoteTemplate) {
    setNoteTemplates((currentTemplates) =>
      currentTemplates
        .map((currentTemplate) =>
          currentTemplate.id === template.id ? template : currentTemplate,
        )
        .sort((first, second) => first.name.localeCompare(second.name, "de")),
    );
  }

  function removeNoteTemplate(templateId: string) {
    setNoteTemplates((currentTemplates) =>
      currentTemplates.filter((template) => template.id !== templateId),
    );
  }

  function saveContactRelationship(relationship: ContactRelationship) {
    setContactRelationships((currentRelationships) => {
      const relationshipExists = currentRelationships.some(
        (currentRelationship) => currentRelationship.id === relationship.id,
      );
      const nextRelationships = relationshipExists
        ? currentRelationships.map((currentRelationship) =>
            currentRelationship.id === relationship.id
              ? relationship
              : currentRelationship,
          )
        : [...currentRelationships, relationship];

      return nextRelationships.sort((first, second) =>
        first.createdAt.localeCompare(second.createdAt),
      );
    });
  }

  function removeContactRelationship(relationshipId: string) {
    setContactRelationships((currentRelationships) =>
      currentRelationships.filter(
        (relationship) => relationship.id !== relationshipId,
      ),
    );
  }

  return (
    <>
      {isNoteTemplateManagerOpen ? (
        <NoteTemplateManager
          templates={noteTemplates}
          onClose={() => setIsNoteTemplateManagerOpen(false)}
          onTemplateCreated={addNoteTemplate}
          onTemplateUpdated={updateNoteTemplate}
          onTemplateDeleted={removeNoteTemplate}
        />
      ) : null}

      {isTagManagerOpen ? (
        <TagManager
          tags={tags}
          notes={notes}
          onClose={() => setIsTagManagerOpen(false)}
          onTagCreated={addTag}
          onTagDeleted={removeTag}
        />
      ) : null}

      {isContactBookOpen ? (
        <ContactBook
          contacts={contacts}
          contactRelationships={contactRelationships}
          onRelationshipSaved={saveContactRelationship}
          onRelationshipDeleted={removeContactRelationship}
          onClose={() => setIsContactBookOpen(false)}
        />
      ) : null}

      {isNoteFormOpen ? (
        <NoteForm
          key={editingNote?.id ?? "new"}
          contacts={contacts}
          featuredContactIds={featuredContacts.ids}
          featuredContactsLabel={featuredContacts.label}
          noteTemplates={noteTemplates}
          tags={tags}
          note={editingNote ?? undefined}
          onCreateTag={createTag}
          onSubmit={saveNote}
          onCancel={closeNoteForm}
          submitError={saveError}
          isSubmitting={isSavingNote}
        />
      ) : (
        <div className="mb-5 grid grid-cols-2 gap-2 sm:mb-6 sm:flex sm:justify-end">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setIsNoteTemplateManagerOpen(true)}
          >
            Vorlagen
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setIsTagManagerOpen(true)}
          >
            Tags verwalten
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setIsContactBookOpen(true)}
          >
            Kontaktbuch
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={openCreateForm}
          >
            Neue Notiz
          </Button>
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

      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Timeline
        </h2>
        <p
          aria-live="polite"
          className="text-xs text-[var(--muted)] sm:text-sm"
        >
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
