# Data Model

## Überblick

Humanbase basiert langfristig auf sechs Kernentitäten:

- `User`
- `Note`
- `Contact`
- `ContactRelationship`
- `Tag`
- `NoteTemplate`

Eine `Note` kann mehrere `Contact`- und mehrere `Tag`-Datensätze haben. Diese Beziehungen werden in PostgreSQL über explizite Join-Tabellen modelliert:

- `NoteContact`
- `NoteTag`

Ein `Contact` kann außerdem Humanbase-eigene Beziehungen zu anderen Kontakten
oder zu noch nicht verknüpften Personen haben. Diese Beziehungsebene gehört
nicht zu Google Kontakte und wird lokal in Humanbase gepflegt.

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
  isFavorite
  createdAt
  updatedAt

ContactRelationship
  id
  userId
  fromContactId
  toContactId?
  relatedName?
  relationType
  inverseRelationType?
  category
  note?
  createdAt
  updatedAt

Tag
  id
  userId
  name
  color?
  createdAt
  updatedAt

NoteTemplate
  id
  userId
  name
  questions[]
  createdAt
  updatedAt

NoteContact
  noteId
  contactId

NoteTag
  noteId
  tagId
```

## Notizvorlagen

`NoteTemplate` gehört wie Notizen, Kontakte und Tags genau einem Nutzer. Die
Fragen werden als geordnete PostgreSQL-Textliste gespeichert, weil sie nur
gemeinsam mit der Vorlage gelesen und geschrieben werden und keine eigenen
Beziehungen benötigen. Beim Anwenden einer Vorlage wird keine dauerhafte
Beziehung zur Notiz erzeugt: Die Fragen werden als normaler, vollständig
editierbarer Text in den Notizinhalt übernommen. Dadurch bleiben bestehende
Notizen auch nach dem Ändern oder Löschen einer Vorlage unverändert.

## Kontakte und Google-Import

`Contact` wurde in Phase 3A so vorbereitet, dass importierte Kontakte stabile
Humanbase-Datensätze bleiben:

- `source`: für neue operative Kontakte `google`; `manual` bleibt nur für
  historische Seed- und Backup-Kompatibilität erhalten
- `externalProvider`: zum Beispiel `google`
- `externalId`: ID des Kontakts beim externen Anbieter
- `lastSyncedAt`: Zeitpunkt des letzten Imports oder Abgleichs
- `isFavorite`: Mitgliedschaft in der Google-Systemgruppe `starred`

Phase 7 verwendet einen expliziten read-only Import aus der Google People API.
Google-Tokens werden nicht dauerhaft gespeichert. Wiederholte Importe
aktualisieren Kontakte anhand von `userId`, `externalProvider` und `externalId`.
Dabei bleibt `Contact.id` unverändert, sodass `NoteContact`-Beziehungen erhalten
bleiben. Humanbase erstellt oder bearbeitet Kontakte nicht manuell und löscht
keine lokalen Kontakte, nur weil sie in einem späteren Google-Import fehlen.

## Kontaktbeziehungen

Phase 8.8 ergänzt `ContactRelationship` als Humanbase-eigene Ebene über den
importierten Kontakten. Dadurch bleibt Google Kontakte weiterhin die einzige
operative Kontaktquelle, während Humanbase persönliche Beziehungserinnerungen
speichern kann.

Eine Beziehung hat immer einen Ausgangskontakt (`fromContactId`). Das Ziel kann
entweder ein bestehender Kontakt (`toContactId`) oder ein freier Platzhalter
sein. Der Platzhalter darf einen Namen (`relatedName`) haben, muss ihn aber
nicht haben. So kann Humanbase auch Wissen wie „hat einen Bruder, ist 9 Jahre
älter“ speichern, obwohl der Name oder der Google-Kontakt noch nicht bekannt
ist.

`relationType` beschreibt die Beziehung aus Sicht des Ausgangskontakts,
`inverseRelationType` optional die Gegenrichtung. Die UI kann dadurch
verknüpfte Beziehungen gegenseitig anzeigen, ohne doppelte Datensätze anlegen
zu müssen. `category` gruppiert Beziehungen grob in Familie, Freunde, Arbeit,
Ausbildung und Sonstiges. `note` speichert kurze strukturierte Zusatzangaben
zur Beziehung.

Kontaktbeziehungen gehören wie Notizen, Kontakte, Tags und Vorlagen zu genau
einem Nutzer. Export und Wiederherstellung bilden die Beziehungs-IDs neu ab
und remappen `fromContactId` und `toContactId` auf die wiederhergestellten
Kontakt-IDs.

## Hinweise zu Phase 1 und Phase 2

- Daten liegen aktuell als Mock-Daten in `apps/web/data/`.
- `date` verwendet das Format `YYYY-MM-DD`.
- Beziehungen werden im lokalen Prototyp über `contactIds` und `tagIds` dargestellt.
- Die Umstellung auf SQL-Relationen erfolgt schrittweise in Phase 3.
