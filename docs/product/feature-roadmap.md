# Feature Roadmap

## Grundrichtung

Humanbase ist zuerst ein langlebiges persönliches Notiz- und Wissenssystem. Die Roadmap priorisiert Datenhoheit, Wartbarkeit, geringe operative Komplexität, sichere Speicherung und Portabilität. Sie optimiert nicht für SaaS-Skalierung mit Millionen von Nutzern.

## Phase 1: Klickbarer Mock-Daten-Prototyp

Status: abgeschlossen.

- Timeline
- Mock-Notizen
- Mock-Kontakte
- Mock-Tags
- Kontakt- und Tag-Filter
- Textsuche

## Phase 2: Lokale Interaktion

Status: abgeschlossen.

- lokaler React State
- Notiz erstellen
- Notiz bearbeiten
- Notiz löschen
- einfache Validierung
- noch keine Datenbank

## Phase 3A: Lokale PostgreSQL- und Prisma-Grundlage

Ziel: Das portable Datenfundament anlegen, ohne das bestehende UI unnötig zu verändern.

Status: abgeschlossen. Schema, Abhängigkeiten, lokale Datenbankeinrichtung, Setup-Dokumentation und initiale Migration sind vorhanden.

- Prisma ergänzen
- lokales PostgreSQL einrichten
- `User` bereits vor echter Authentifizierung modellieren
- jede `Note`, jeder `Contact` und jeder `Tag` gehört zu einem `User`
- `NoteContact` und `NoteTag` als explizite Join-Tabellen ergänzen
- `Contact` für einen späteren Google-Import vorbereiten:
  - `source`
  - `externalProvider`
  - `externalId`
  - `lastSyncedAt`

Nicht enthalten:

- Google OAuth
- Authentifizierung
- Cloud-Deployment

## Phase 3B: Seed-Daten und datenbankgestütztes CRUD

Ziel: Die vorhandene UI auf PostgreSQL umstellen und stabil halten.

Status: abgeschlossen.

- Datenbank aus den aktuellen Mock-Daten seeden
- lokale Notizpersistenz durch datenbankgestütztes CRUD ersetzen
- Kontakte und Tags aus der Datenbank laden
- Timeline und Filter erhalten
- Erstellen, Bearbeiten und Löschen erhalten
- bestehendes UI möglichst wenig verändern
- wiederholbare lokale Verifikation über `npm.cmd run verify:phase3b`

## Phase 3C: Export- und Backup-Grundlage

Ziel: Datenverlust vermeiden und einen Anbieterwechsel ermöglichen, bevor Humanbase wichtige persönliche Daten enthält.

- JSON-Export für Notizen, Kontakte, Tags und Beziehungen
- CSV-Export optional für später vorbereiten
- manuellen Datenbank-Dump dokumentieren
- Restore-Prozess dokumentieren
- Restore testweise durchführen
- sicherstellen, dass Nutzer die App verlassen und ihre Daten behalten können

## Phase 4: Persönliche Cloud-Datenbank

Ziel: PostgreSQL verwaltet hosten, ohne den Anbieter tief in das Kernmodell einzubauen.

- Managed-PostgreSQL-Anbieter wählen
- Supabase als wahrscheinlichen ersten Kandidaten prüfen
- Google Cloud SQL oder anderen Managed-PostgreSQL-Anbieter als spätere Migrationsoption offenhalten
- EU-Region verwenden, wenn relevant
- Sicherheitsfunktionen des Anbieters aktivieren
- Prisma- und PostgreSQL-Portabilität erhalten
- anbieterspezifische Kopplung möglichst vermeiden
- Umgebungsvariablen und Migrationsprozess dokumentieren

## Phase 5: Authentifizierung für persönliche Cloud-Nutzung

Ziel: Cloud-Daten erst nach stabiler Persistenz absichern.

- Authentifizierung ergänzen
- zunächst Single-User- oder Limited-User-Nutzung unterstützen
- jeden Datensatz über `userId` abgrenzen
- keine öffentliche Registrierung, außer sie wird ausdrücklich aktiviert
- starke Passwörter und 2FA verwenden, soweit verfügbar

## Phase 6: Responsive Web und PWA/Mobile-Zugriff

Ziel: Humanbase zunächst im mobilen Browser gut nutzbar machen.

- Web-App responsiv gestalten
- mobile Browser-Nutzung prüfen
- optional PWA-Unterstützung ergänzen
- Expo oder React Native erst später erwägen
- native Mobile App nicht verfrüht bauen

## Phase 7: Google Contacts Import

Ziel: Kontakte kontrolliert und mit minimalen Berechtigungen importieren.

- Google OAuth erst nach stabiler Authentifizierung und Cloud-Speicherung ergänzen
- read-only Import aus der Google People API starten
- zunächst keine Zwei-Wege-Synchronisation
- zunächst keine Änderungen an Google zurückschreiben
- minimale Google Scopes verwenden
- importierte Kontakte als normale `Contact`-Datensätze speichern
- `source`, `externalProvider`, `externalId` und `lastSyncedAt` pflegen

## Phase 8: Optionale erweiterte Funktionen

Ziel: Komfortfunktionen erst nach stabilem Kern und erprobten Backups ergänzen.

- KI-Zusammenfassungen
- semantische Suche
- Erinnerungen
- Gesprächsvorbereitung
- umfangreichere Kontakthistorie

## Grundregel

Jede Phase soll einzeln funktionieren. Neue Funktionen dürfen Datenportabilität, Backups und die einfache Wartbarkeit durch eine Person nicht gefährden.
