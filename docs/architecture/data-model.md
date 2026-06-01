
---

# 9. docs/architecture/data-model.md

```md
# Data Model

## Überblick

Humanbase basiert im Kern auf drei Hauptentitäten:

- Note
- Contact
- Tag

Eine Note kann mehrere Contacts und mehrere Tags haben.

## Note

Eine Note ist ein einzelner Eintrag in Humanbase.

Beispiele:

- Gesprächsnotiz
- Gedanke
- Idee
- Meeting-Notiz
- Projektentscheidung
- Erinnerung
- Tagesnotiz

### Felder

```ts
export type Note = {
  id: string
  title: string
  content: string
  date: string
  contactIds: string[]
  tagIds: string[]
  createdAt: string
  updatedAt: string
}

export type Contact = {
  id: string
  displayName: string
  email?: string
  phone?: string
  avatarUrl?: string
  source: 'manual' | 'google'
  createdAt: string
  updatedAt: string
}

export type Tag = {
  id: string
  name: string
  color?: string
  createdAt: string
  updatedAt: string
}

export type User = {
  id: string
  email: string
  name?: string
  createdAt: string
  updatedAt: string
}


### Mock-Daten

Für den MVP sollen Mock-Daten verwendet werden.

Beispiel:

export const mockContacts: Contact[] = [
  {
    id: 'contact_1',
    displayName: 'Max Mustermann',
    email: 'max@example.com',
    source: 'manual',
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z'
  }
]

export const mockTags: Tag[] = [
  {
    id: 'tag_1',
    name: 'Humanbase',
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z'
  }
]

export const mockNotes: Note[] = [
  {
    id: 'note_1',
    title: 'Gespräch über Humanbase MVP',
    content: 'Wir haben entschieden, zuerst eine einfache Timeline mit Kontakten und Tags zu bauen.',
    date: '2026-06-01',
    contactIds: ['contact_1'],
    tagIds: ['tag_1'],
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z'
  }
]