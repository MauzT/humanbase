import type { Contact, Note, Tag } from "@/types/humanbase";

export const mockContacts: Contact[] = [
  {
    id: "contact_1",
    displayName: "Max Mustermann",
    email: "max@example.com",
    source: "manual",
    isFavorite: false,
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "contact_2",
    displayName: "Lea Sommer",
    email: "lea@example.com",
    source: "manual",
    isFavorite: false,
    createdAt: "2026-05-28T09:00:00.000Z",
    updatedAt: "2026-05-28T09:00:00.000Z",
  },
  {
    id: "contact_3",
    displayName: "Jonas Weber",
    email: "jonas@example.com",
    source: "manual",
    isFavorite: false,
    createdAt: "2026-05-22T15:30:00.000Z",
    updatedAt: "2026-05-22T15:30:00.000Z",
  },
];

export const mockTags: Tag[] = [
  {
    id: "tag_1",
    name: "Humanbase",
    color: "#276956",
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "tag_2",
    name: "MVP",
    color: "#8a5b2d",
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "tag_3",
    name: "Produkt",
    color: "#5b4b8a",
    createdAt: "2026-05-31T12:00:00.000Z",
    updatedAt: "2026-05-31T12:00:00.000Z",
  },
  {
    id: "tag_4",
    name: "Offene Punkte",
    color: "#9b4f4f",
    createdAt: "2026-05-29T08:00:00.000Z",
    updatedAt: "2026-05-29T08:00:00.000Z",
  },
];

export const mockNotes: Note[] = [
  {
    id: "note_1",
    title: "Gespräch über Humanbase MVP",
    content:
      "Wir haben entschieden, zuerst eine einfache Timeline mit Kontakten, Tags und einer schnellen Suche zu bauen.",
    date: "2026-06-01",
    contactIds: ["contact_1", "contact_2"],
    tagIds: ["tag_1", "tag_2", "tag_3"],
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "note_2",
    title: "Fragen für den nächsten Produktcheck",
    content:
      "Welche Informationen müssen auf einer Note Card sofort sichtbar sein? Prüfen, ob Kontakt- und Tag-Filter im Alltag reichen.",
    date: "2026-06-01",
    contactIds: ["contact_2"],
    tagIds: ["tag_2", "tag_4"],
    createdAt: "2026-06-01T13:30:00.000Z",
    updatedAt: "2026-06-01T13:30:00.000Z",
  },
  {
    id: "note_3",
    title: "Projektstruktur festgelegt",
    content:
      "Die erste App liegt unter apps/web. Shared Packages kommen erst dazu, wenn eine zweite App tatsächlich Code wiederverwendet.",
    date: "2026-05-31",
    contactIds: ["contact_3"],
    tagIds: ["tag_1", "tag_3"],
    createdAt: "2026-05-31T16:15:00.000Z",
    updatedAt: "2026-05-31T16:15:00.000Z",
  },
  {
    id: "note_4",
    title: "Idee: Gesprächsvorbereitung",
    content:
      "Später könnte eine Kontaktansicht offene Punkte und die letzten Gespräche zusammenfassen. Noch nicht Teil des MVP.",
    date: "2026-05-29",
    contactIds: ["contact_1"],
    tagIds: ["tag_1", "tag_4"],
    createdAt: "2026-05-29T08:45:00.000Z",
    updatedAt: "2026-05-29T08:45:00.000Z",
  },
];
