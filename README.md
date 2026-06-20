# Humanbase

Humanbase ist eine datumsbasierte Notiz-App mit Kontakt- und Tag-Bezug. Das Projekt ist in erster Linie ein langlebiges persönliches Notiz- und Wissenssystem, kein SaaS-Produkt für Millionen von Nutzern.

Die App soll verständlich und durch eine Person wartbar bleiben. Datenhoheit, sichere Speicherung, Schutz vor Datenverlust und Portabilität zwischen Anbietern sind wichtiger als unnötige Skalierungs- oder Plattformkomplexität.

## Projektstatus

Abgeschlossen:

- Phase 1: klickbarer Web-Prototyp mit statischen Mock-Daten
- Phase 2: lokale Interaktion mit React State
- Timeline mit Kontakt-, Tag- und Textfilter
- Notizen erstellen, bearbeiten und löschen
- einfache Validierung

Phase 3A ist abgeschlossen:

- Prisma-Abhängigkeiten und Prisma-Schema
- lokale PostgreSQL-Konfiguration über `DATABASE_URL`
- portable Datenbankmodelle inklusive `User`, `Note`, `Contact`, `Tag`, `NoteContact` und `NoteTag`
- angewendete initiale Prisma-Migration

Phase 3B ist abgeschlossen:

- Seed-Daten aus dem bisherigen Mock-Datenbestand
- Default-Entwicklungsnutzer
- datenbankgestütztes Laden von Notizen, Kontakten und Tags
- datenbankgestütztes Erstellen, Bearbeiten und Löschen von Notizen
- erhaltene Timeline-Filter nach Kontakt, Tag und Suchtext
- lokale Verifikation über `npm.cmd run verify:phase3b`

Phase 3C ist abgeschlossen:

- JSON-Export für Notizen, Kontakte, Tags und Beziehungen
- lokale Exportdateien unter `apps/web/exports/`
- PostgreSQL-Dump- und Restore-Prozess dokumentiert
- read-only Verifikation über `npm.cmd run verify:phase3c`
- lokaler Restore-Test gegen eine temporäre PostgreSQL-Datenbank durchgeführt

Phase 4 ist abgeschlossen:

- Supabase als erster Managed-PostgreSQL-Anbieter verwendet
- Google Cloud SQL oder anderer Managed-PostgreSQL-Anbieter als Migrationspfad offengehalten
- optionale `DIRECT_URL` für Prisma CLI und Admin-Werkzeuge ergänzt
- Cloud-Migrations-, Sicherheits- und Verifikationsprozess dokumentiert
- Prisma-Migrationen gegen Supabase PostgreSQL angewendet
- Seed-Daten und Verifikationsskripte gegen Supabase PostgreSQL ausgeführt
- JSON-Export und öffentlicher PostgreSQL-Schema-Dump erstellt

Phase 5 ist abgeschlossen:

- Supabase Auth als Authentifizierungsanbieter
- Google OAuth als erster Login-Weg
- keine öffentliche Registrierung für Humanbase
- App-level Allowlist über `HUMANBASE_ALLOWED_EMAILS`
- Timeline, CRUD und JSON-Export auf den angemeldeten `userId` begrenzt
- lokale Verifikation über `npm.cmd run verify:phase5`

Phase 6 ist abgeschlossen:

- responsive Timeline, Filter, Suche und Kontrollen ab 320 px Viewport-Breite
- mobil optimierter Notiz-Editor für Erstellen und Bearbeiten
- größere Touch-Ziele und robuster Umbruch langer Inhalte
- mobil erreichbare Authentifizierungs-, Export- und Abmeldeaktionen
- leichtgewichtiges Web-App-Manifest ohne Offline-Sync
- dokumentierte Breakpoint- und Flow-Prüfung

Phase 7 ist abgeschlossen:

- expliziter Google-Kontakte-Import mit read-only People-API-Scope
- paginierter Import ohne gespeicherte Google-Tokens
- idempotente lokale Aktualisierung über die Google-Kontakt-ID
- Herkunft und Importzeitpunkt in `Contact` dokumentiert
- lokale Verifikation über `npm.cmd run verify:phase7`

Noch nicht enthalten:

- Cloud-Deployment der Web-App
- Mobile App

## Langfristige technische Richtung

Humanbase verwendet bewusst verbreitete, portable Technologien:

- Next.js
- TypeScript
- PostgreSQL
- Prisma
- normale SQL-Relationen
- JSON-Export und später optional CSV-Export
- dokumentierte Backup- und Restore-Prozesse

## Lokale Entwicklung

Voraussetzung: Node.js 20.9 oder neuer.

```bash
cd apps/web
npm install
npx.cmd prisma migrate dev
npx.cmd prisma db seed
npm run dev
```

Danach ist die App unter `http://localhost:3000` erreichbar.

Phase 3B kann lokal mit folgendem Befehl geprüft werden:

```powershell
npm.cmd run verify:phase3b
```

Phase 3C kann lokal mit folgendem Befehl geprüft werden:

```powershell
npm.cmd run verify:phase3c
```

Phase 5 kann lokal mit folgendem Befehl geprüft werden:

```powershell
npm.cmd run verify:phase5
```

Die Browser-Smoke-Tests können aus `apps/web` mit Playwright ausgeführt werden:

```powershell
npm.cmd run test:e2e
```

Für den interaktiven Playwright-Testmodus:

```powershell
npm.cmd run test:e2e:ui
```

Beide Befehle erstellen zuerst einen Produktionsbuild und starten Humanbase
isoliert unter `http://127.0.0.1:3100`. Der normale E2E-Lauf beendet Server und
Browser nach dem Test automatisch.

Ein manueller JSON-Export kann so erstellt werden:

```powershell
npm.cmd run export:json
```

Für die lokale PostgreSQL- und Prisma-Einrichtung siehe [Lokales PostgreSQL](docs/development/local-postgresql.md).
Für Phase 4 und Cloud PostgreSQL siehe [Cloud PostgreSQL](docs/development/cloud-postgresql.md).
Für Backup und Restore siehe [Backup and Restore](docs/development/backup-and-restore.md).
Für Authentifizierung siehe [Authentication](docs/development/authentication.md).
Für mobile Browser- und Responsive-Tests siehe [Responsive Web](docs/development/responsive-web.md).

## Struktur

```text
humanbase/
  apps/
    web/
  docs/
    product/
    architecture/
    development/
```

Weitere Informationen:

- [Produktvision](docs/product/vision.md)
- [MVP](docs/product/mvp.md)
- [Feature Roadmap](docs/product/feature-roadmap.md)
- [Tech Stack](docs/architecture/tech-stack.md)
- [Datenmodell](docs/architecture/data-model.md)
- [Datensicherheit](docs/architecture/data-safety.md)
