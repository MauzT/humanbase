# Data Model

## Überblick

Humanbase basiert langfristig auf vier Kernentitäten:

- `User`
- `Note`
- `Contact`
- `Tag`

Eine `Note` kann mehrere `Contact`- und mehrere `Tag`-Datensätze haben. Diese Beziehungen werden in PostgreSQL über explizite Join-Tabellen modelliert:

- `NoteContact`
- `NoteTag`

## Mandantengrenze für Cloud-Bereitschaft

Das `User`-Modell wird bereits in Phase 3A ergänzt, obwohl Authentifizierung erst in Phase 5 folgt. Jede `Note`, jeder `Contact` und jeder `Tag` gehört von Anfang an zu genau einem `User`.

Für die lokale Entwicklung kann ein definierter persönlicher Default-User verwendet werden. Damit muss das Datenmodell bei der späteren Cloud-Nutzung nicht grundlegend umgebaut werden.

## Authentifizierung in Phase 5

Phase 5 ergaenzt das bestehende `User`-Modell um optionale Mapping-Felder:

- `email`
- `supabaseAuthUserId`

Supabase Auth verwaltet Login und Sessions. Humanbase speichert keine eigenen
Passwort-Hashes und keine eigene Auth-Session-Tabelle mehr. Die
Kernentitaeten `Note`, `Contact` und `Tag` bleiben weiterhin durch `userId` vom
aktiven Humanbase-Nutzer abgegrenzt.

## Prisma-Modelle

Das Prisma-Schema liegt unter `apps/web/prisma/schema.prisma`. Die Kernentitäten verwenden UUIDs. Beziehungen zwischen Notizen, Kontakten und Tags bleiben als explizite Join-Tabellen sichtbar.

```text
User
  id
  email?
  supabaseAuthUserId?
  createdAt
  updatedAt

Note
  id
  userId
  title
  content
  date
  createdAt
  updatedAt

Contact
  id
  userId
  displayName
  email?
  phone?
  avatarUrl?
  source
  externalProvider?
  externalId?
  lastSyncedAt?
  createdAt
  updatedAt

Tag
  id
  userId
  name
  color?
  createdAt
  updatedAt

NoteContact
  noteId
  contactId

NoteTag
  noteId
  tagId
```

## Kontakte und Google-Import

`Contact` wurde in Phase 3A so vorbereitet, dass importierte Kontakte normale Humanbase-Kontakte bleiben:

- `source`: zum Beispiel `manual` oder `google`
- `externalProvider`: zum Beispiel `google`
- `externalId`: ID des Kontakts beim externen Anbieter
- `lastSyncedAt`: Zeitpunkt des letzten Imports oder Abgleichs

Phase 7 verwendet einen expliziten read-only Import aus der Google People API.
Google-Tokens werden nicht dauerhaft gespeichert. Wiederholte Importe
aktualisieren Kontakte anhand von `userId`, `externalProvider` und `externalId`.

## Hinweise zu Phase 1 und Phase 2

- Daten liegen aktuell als Mock-Daten in `apps/web/data/`.
- `date` verwendet das Format `YYYY-MM-DD`.
- Beziehungen werden im lokalen Prototyp über `contactIds` und `tagIds` dargestellt.
- Die Umstellung auf SQL-Relationen erfolgt schrittweise in Phase 3.
