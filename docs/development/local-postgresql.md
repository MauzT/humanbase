# Local PostgreSQL

## Ziel

Phase 3A richtet PostgreSQL und Prisma lokal ein. Die bestehende Web-App verwendet weiterhin Mock-Daten und lokalen React State. Seed-Daten und datenbankgestütztes CRUD folgen in Phase 3B.

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
```

Die Datei `.env` bleibt lokal und wird nicht in Git eingecheckt.

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

Seed-Daten und datenbankgestütztes CRUD sind nicht Teil von Phase 3A.
