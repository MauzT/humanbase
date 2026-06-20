"use client";

import { useEffect, useRef, useState } from "react";

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
  const contentId = `note-content-${note.id}`;
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [isContentCollapsible, setIsContentCollapsible] = useState(false);

  useEffect(() => {
    const contentElement = contentRef.current;

    if (!contentElement) {
      return;
    }

    const updateCollapsibleState = () => {
      const lineHeight = Number.parseFloat(
        window.getComputedStyle(contentElement).lineHeight,
      );
      const collapsedHeight = lineHeight * 6;

      setIsContentCollapsible(
        contentElement.scrollHeight > collapsedHeight + 1,
      );
    };

    updateCollapsibleState();

    const resizeObserver = new ResizeObserver(updateCollapsibleState);
    resizeObserver.observe(contentElement);

    return () => resizeObserver.disconnect();
  }, [note.content]);

  return (
    <article className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 pt-4 pb-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:px-6 sm:pt-6 sm:pb-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 break-words text-lg font-semibold tracking-tight sm:text-xl">
          {note.title}
        </h3>
        <div className="-mr-2 -mt-2 flex shrink-0 gap-0 sm:mr-0 sm:mt-0 sm:gap-1">
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
      <p
        ref={contentRef}
        id={contentId}
        className={`mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--muted)] ${
          isContentExpanded ? "" : "line-clamp-6"
        }`}
      >
        {note.content}
      </p>
      {isContentCollapsible ? (
        <button
          type="button"
          aria-controls={contentId}
          aria-expanded={isContentExpanded}
          aria-label={
            isContentExpanded
              ? `${note.title} einklappen`
              : `${note.title} ausklappen`
          }
          title={isContentExpanded ? "Einklappen" : "Ausklappen"}
          onClick={() => setIsContentExpanded((isExpanded) => !isExpanded)}
          className="-mr-1 ml-auto flex size-8 cursor-pointer items-center justify-center rounded-lg text-[var(--accent)] transition hover:bg-[var(--accent-soft)]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={`size-5 transition-transform ${
              isContentExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      ) : null}

      {noteContacts.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {noteContacts.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => onContactClick(contact.id)}
              className="inline-flex min-h-11 max-w-full cursor-pointer items-center rounded-full bg-[var(--accent-soft)] px-3 py-2 text-left text-xs font-semibold text-[var(--accent)] transition hover:bg-[#cfe3db]"
            >
              {contact.displayName}
            </button>
          ))}
        </div>
      ) : null}

      {noteTags.length > 0 ? (
        <div
          className={`flex flex-wrap gap-2 ${
            noteContacts.length > 0 ? "mt-3" : "mt-5"
          }`}
        >
          {noteTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => onTagClick(tag.id)}
              className="inline-flex min-h-11 max-w-full cursor-pointer items-center rounded-full border border-[var(--border)] px-3 py-2 text-left text-xs font-semibold transition hover:border-[var(--accent)]"
              style={{ color: tag.color }}
            >
              #{tag.name}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}
