# Humanbase MVP

## Ziel des MVP

Das MVP zeigt, ob die Grundidee von Humanbase funktioniert:

> Nutzer können Notizen in einer Timeline sehen und über Kontakte, Tags und Suchtext wiederfinden.

Humanbase wird schrittweise zu einem langlebigen persönlichen Notizsystem ausgebaut. Der klickbare Prototyp und die lokale Interaktion sind bereits umgesetzt. Datenbank, Cloud und Authentifizierung folgen getrennt, damit jeder Schritt klein und überprüfbar bleibt.

## Phase 1: Klickbarer Mock-Daten-Prototyp

Status: abgeschlossen.

Enthalten:

1. Timeline-Ansicht
2. Notizen mit Datum
3. Note Cards mit Titel, Vorschau, Kontakten und Tags
4. statische Mock-Daten für Notizen, Kontakte und Tags
5. Filter nach Kontakt
6. Filter nach Tag
7. einfache Suche

## Phase 2: Lokale Interaktion

Status: abgeschlossen.

Enthalten:

- Notiz erstellen
- Notiz bearbeiten
- Notiz löschen
- lokaler React State
- einfache Validierung
- noch keine Datenbankpersistenz

## Hauptscreen: Timeline View

Die Timeline ist die Hauptansicht. Sie zeigt Notizen gruppiert nach Datum, neuere Einträge zuerst.

Eine Note Card zeigt:

- Titel
- kurze Vorschau des Inhalts
- Datum
- Kontakte
- Tags

## Phase 3A: Lokale PostgreSQL- und Prisma-Grundlage

Status: abgeschlossen.

- Prisma-Abhängigkeiten und Prisma-Konfiguration
- PostgreSQL als lokaler Datenbankanbieter
- ein `User`-Modell bereits vor echter Authentifizierung
- Zuordnung von `Note`, `Contact` und `Tag` zu einem `User`
- `NoteContact` und `NoteTag` als Join-Tabellen
- Kontaktfelder für einen späteren Google-Import
- angewendete initiale Prisma-Migration

## Phase 3B: Seed-Daten und datenbankgestütztes CRUD

Status: abgeschlossen.

- Default-Entwicklungsnutzer
- Seed-Daten aus dem bisherigen Mock-Datenbestand
- datenbankgestütztes Laden von Notizen, Kontakten und Tags
- erhaltene Kontakt-, Tag- und Textfilter
- datenbankgestütztes Erstellen, Bearbeiten und Löschen von Notizen
- lokale Verifikation über `npm.cmd run verify:phase3b`

Noch nicht enthalten:

- Authentifizierung
- Google OAuth
- Cloud-Deployment
