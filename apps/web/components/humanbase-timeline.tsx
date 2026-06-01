"use client";

import { useMemo, useState } from "react";

import { NotesTimeline } from "@/components/notes-timeline";
import { TimelineFilters } from "@/components/timeline-filters";
import { mockContacts, mockNotes, mockTags } from "@/data/mock-data";
import { filterNotes } from "@/lib/filter-notes";

export function HumanbaseTimeline() {
  const [query, setQuery] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [selectedTagId, setSelectedTagId] = useState("");

  const filteredNotes = useMemo(
    () =>
      filterNotes({
        notes: mockNotes,
        contacts: mockContacts,
        tags: mockTags,
        query,
        contactId: selectedContactId,
        tagId: selectedTagId,
      }),
    [query, selectedContactId, selectedTagId],
  );

  function clearFilters() {
    setQuery("");
    setSelectedContactId("");
    setSelectedTagId("");
  }

  return (
    <>
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
          {filteredNotes.length} von {mockNotes.length} Notizen
        </p>
      </div>

      <NotesTimeline
        notes={filteredNotes}
        contacts={mockContacts}
        tags={mockTags}
        onContactClick={setSelectedContactId}
        onTagClick={setSelectedTagId}
      />
    </>
  );
}
