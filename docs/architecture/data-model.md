# Data Model

## Überblick

Humanbase basiert im Kern auf drei Hauptentitäten:

- `Note`
- `Contact`
- `Tag`

Eine Note kann mehrere Contacts und mehrere Tags haben.

## Typen

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
```

## Hinweise für Phase 1

- Daten werden als statische Mock-Daten in `apps/web/data/` abgelegt.
- `date` verwendet das Format `YYYY-MM-DD`.
- Verknüpfungen werden zunächst über `contactIds` und `tagIds` abgebildet.
- Ein `User`-Modell wird erst mit der Authentifizierung benötigt.
