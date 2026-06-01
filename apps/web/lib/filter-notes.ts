import type { Contact, Note, Tag } from "@/types/humanbase";

type FilterNotesOptions = {
  notes: Note[];
  contacts: Contact[];
  tags: Tag[];
  query: string;
  contactId: string;
  tagId: string;
};

export function filterNotes({
  notes,
  contacts,
  tags,
  query,
  contactId,
  tagId,
}: FilterNotesOptions) {
  const normalizedQuery = query.trim().toLocaleLowerCase("de");

  return notes.filter((note) => {
    const matchesContact = !contactId || note.contactIds.includes(contactId);
    const matchesTag = !tagId || note.tagIds.includes(tagId);

    if (!matchesContact || !matchesTag || !normalizedQuery) {
      return matchesContact && matchesTag;
    }

    const contactNames = contacts
      .filter((contact) => note.contactIds.includes(contact.id))
      .map((contact) => contact.displayName);
    const tagNames = tags
      .filter((tag) => note.tagIds.includes(tag.id))
      .map((tag) => tag.name);
    const searchableText = [
      note.title,
      note.content,
      ...contactNames,
      ...tagNames,
    ]
      .join(" ")
      .toLocaleLowerCase("de");

    return searchableText.includes(normalizedQuery);
  });
}
