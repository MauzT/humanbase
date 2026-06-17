# Local PostgreSQL

## Ziel

Phase 3A richtet PostgreSQL und Prisma lokal ein. Phase 3B verwendet diese lokale Datenbank für Seed-Daten und datenbankgestütztes Note-CRUD.

## Voraussetzungen

- Node.js 20.9 oder neuer
- PostgreSQL Server
- PostgreSQL-Zugangsdaten für eine lokale Entwicklungsdatenbank

Unter Windows kann PostgreSQL über den offiziellen Installer installiert werden:

- <https://www.postgresql.org/download/windows/>

Docker ist für die lokale Einrichtung nicht erforderlich.

## Datenbank anlegen

Lege in PostgreSQL eine lokale Datenbank mit dem Namen `humanbase` an. Das geht zum Beispiel über pgAdmin oder mit installiertem `createdb`:

```powershell
createdb -U postgres humanbase
```

## Umgebungsvariable

Erstelle `apps/web/.env` auf Basis von `apps/web/.env.example` und ersetze `YOUR_PASSWORD`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/humanbase?schema=public"
DIRECT_URL=""
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
HUMANBASE_ALLOWED_EMAILS="you@example.com"
```

Die Datei `.env` bleibt lokal und wird nicht in Git eingecheckt.

`DIRECT_URL` ist fuer Phase 4 optional. Lokal kann der Wert leer bleiben, weil
`DATABASE_URL` bereits direkt auf PostgreSQL zeigt.

## Prisma-Befehle

Führe Prisma-Befehle im Verzeichnis `apps/web` aus:

```powershell
cd apps/web
npx.cmd prisma format
npx.cmd prisma validate
npx.cmd prisma generate
```

Unter Windows kann `npm.cmd` beziehungsweise `npx.cmd` nötig sein, wenn PowerShell die Skript-Shims blockiert.

## Initiale Migration

Die initiale Migration liegt versioniert unter `apps/web/prisma/migrations/` und wurde lokal angewendet. Nach einer frischen lokalen Einrichtung kann sie mit folgendem Befehl angewendet werden:

```powershell
npx.cmd prisma migrate dev
```

## Seed-Daten

Phase 3B seedet einen Default-Entwicklungsnutzer sowie Kontakte, Tags, Notizen und Beziehungen aus dem bisherigen Mock-Datenbestand:

```powershell
npx.cmd prisma db seed
```

Wenn `HUMANBASE_ALLOWED_EMAILS` gesetzt ist, kann der Seed die erste erlaubte
E-Mail dem Default-Entwicklungsnutzer zuordnen.

## Phase 3B verifizieren

Die datenbankgestützten Reads und Note-CRUD-Funktionen können lokal mit folgendem Befehl geprüft werden:

```powershell
npm.cmd run verify:phase3b
```

Der Befehl erstellt, bearbeitet und löscht eine temporäre Notiz und räumt sie danach wieder auf.

## Backup und Restore

Phase 3C ergänzt JSON-Export, PostgreSQL-Dump, Restore-Dokumentation und eine
read-only Export-Verifikation:

```powershell
npm.cmd run export:json
npm.cmd run verify:phase3c
npm.cmd run verify:phase5
```

Der vollständige Backup- und Restore-Prozess ist unter
[Backup and Restore](backup-and-restore.md) dokumentiert.
Die Phase-5-Anmeldung ist unter [Authentication](authentication.md)
dokumentiert.
