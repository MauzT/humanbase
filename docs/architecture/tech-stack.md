Mock-Daten

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