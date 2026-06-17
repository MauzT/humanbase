# Cloud PostgreSQL

## Ziel

Phase 4 bringt Humanbase auf eine persoenliche Cloud-Datenbank, ohne das
Kernmodell an einen Anbieter zu binden. Supabase ist der erste Anbieter, wird
in dieser Phase aber nur als Managed PostgreSQL verwendet.

Nicht Teil von Phase 4:

- Supabase Auth
- Supabase Storage
- Supabase Realtime
- Google OAuth
- oeffentliche Registrierung
- Cloud-Deployment der Web-App

Die lokale PostgreSQL-Entwicklung bleibt weiterhin unter
[Local PostgreSQL](local-postgresql.md) dokumentiert.

## Anbieterwahl fuer Phase 4

Umsetzung fuer den ersten Pilot:

- Supabase-Projekt als Managed-PostgreSQL-Datenbank
- EU-Region, wenn die Daten vor allem in Europa genutzt werden
- PostgreSQL-Zugriff ueber Prisma und normale SQL-Relationen
- keine Supabase-spezifischen Tabellen, Policies oder Client-SDK-Abhaengigkeiten
  fuer den Humanbase-Kern

Google Cloud SQL oder ein anderer Managed-PostgreSQL-Anbieter bleibt ein
spaeterer Migrationspfad. Ein Anbieterwechsel soll ueber Prisma-Migrationen,
PostgreSQL-Dumps und den JSON-Export moeglich bleiben.

## Supabase-Projekt anlegen

1. Erstelle ein neues Supabase-Projekt.
2. Waehle eine EU-Region, zum Beispiel Central EU/Frankfurt, wenn passend.
3. Verwende ein starkes Datenbankpasswort und speichere es ausserhalb von Git.
4. Aktiviere 2FA fuer den Supabase-Account beziehungsweise den verwendeten
   Login-Anbieter.
5. Verwende Humanbase zunaechst nur ueber Prisma, nicht ueber das Supabase
   JavaScript SDK.

## Verbindungsvariablen

Humanbase verwendet zwei unterschiedliche Datenbank-URLs:

```env
# Runtime: wird von der Web-App und den Verifikationsskripten verwendet.
DATABASE_URL="postgresql://..."

# Migrations/Admin: wird von Prisma CLI, pg_dump und pg_restore verwendet.
DIRECT_URL="postgresql://..."
```

Lokal koennen beide Werte identisch sein oder `DIRECT_URL` kann leer bleiben.
Bei Supabase sollte `DATABASE_URL` auf die fuer Runtime geeignete Verbindung
zeigen und `DIRECT_URL` auf eine direkte oder Session-Pooler-Verbindung fuer
Migrationen und Admin-Werkzeuge.

Die Datei `apps/web/.env` bleibt lokal. Secrets werden nicht committet.

## Prisma-Migration auf Cloud PostgreSQL

Fuehre Prisma-Befehle aus `apps/web` aus:

```powershell
cd apps/web
npx.cmd prisma validate
npx.cmd prisma migrate deploy
npx.cmd prisma generate
```

Hinweise:

- `migrate deploy` wendet die versionierten Migrationen auf eine bestehende
  Datenbank an und ist fuer Cloud-Umgebungen besser geeignet als
  `migrate dev`.
- Prisma CLI verwendet `DIRECT_URL`, wenn es gesetzt ist, sonst `DATABASE_URL`.
- Die App selbst verwendet weiterhin `DATABASE_URL`.

## Seed-Daten

Wenn die Cloud-Datenbank ein frischer persoenlicher Pilot ohne echte Daten ist,
koennen die bisherigen Entwicklungsdaten geseedet werden:

```powershell
npx.cmd prisma db seed
```

Seed-Daten sollten nicht blind auf eine Datenbank mit echten persoenlichen Daten
angewendet werden.

## Verifikation

Setze `DATABASE_URL` temporaer auf die Cloud-Datenbank und pruefe den
bestehenden Datenzugriff:

```powershell
npm.cmd run verify:phase3b
npm.cmd run verify:phase3c
npm.cmd run verify:phase5
npm.cmd run export:json
```

`verify:phase3b` erstellt, bearbeitet und loescht eine temporaere Notiz. Fuehre
diesen Befehl nur gegen eine Datenbank aus, in der dieser Schreibtest gewollt
ist.

## Sicherheitseinstellungen

Pruefe beim Anbieter mindestens:

- 2FA fuer den Account
- starke, einzigartige Datenbankpasswoerter
- SSL fuer PostgreSQL-Verbindungen
- Netzwerk- oder IP-Beschraenkungen, wenn sinnvoll
- automatische Backups und deren Aufbewahrung
- Point-in-Time Recovery, wenn wichtige persoenliche Daten gespeichert werden
- regelmaessige Passwortrotation bei Verdacht auf Zugriff

Phase 5 ergaenzt Supabase Auth mit Google OAuth und App-level Allowlist.
Details stehen unter [Authentication](authentication.md). Der Humanbase-Kern
bleibt weiterhin Prisma/PostgreSQL und koppelt App-Daten nicht an
Supabase-verwaltete Auth-Tabellen.

## Backup vor und nach der Migration

Vor der Cloud-Migration:

```powershell
cd apps/web
npm.cmd run export:json
$env:PG_DATABASE_URL = $env:DATABASE_URL -replace '\?.*$', ''
pg_dump --dbname "$env:PG_DATABASE_URL" --schema=public --format custom --file "backups\humanbase-before-cloud.dump"
```

Nach der Cloud-Migration:

```powershell
npm.cmd run export:json
$env:PG_DATABASE_URL = $env:DIRECT_URL -replace '\?.*$', ''
pg_dump --dbname "$env:PG_DATABASE_URL" --schema=public --format custom --file "backups\humanbase-cloud.dump"
```

Falls die URL Prisma-Parameter wie `?schema=public` enthaelt, entferne diese
fuer PostgreSQL-CLI-Tools oder verwende eine separate `PG_DATABASE_URL` ohne
Query-Parameter.

Bei Supabase werden verwaltete Schemas wie `auth`, `storage` und `realtime`
nicht fuer Humanbase benoetigt. Der portable Phase-4-Dump beschraenkt sich
deshalb auf `--schema=public`.

## Anbieterwechsel

Ein spaeterer Wechsel zu Google Cloud SQL oder einem anderen Managed
PostgreSQL-Anbieter sollte so ablaufen:

1. JSON-Export und PostgreSQL-Dump beim aktuellen Anbieter erstellen.
2. Neue PostgreSQL-Datenbank beim Zielanbieter anlegen.
3. Prisma-Migrationen mit `npx.cmd prisma migrate deploy` anwenden oder den
   Dump in die Zieldatenbank einspielen.
4. `DATABASE_URL` und optional `DIRECT_URL` auf den Zielanbieter umstellen.
5. `npm.cmd run verify:phase3b`, `npm.cmd run verify:phase3c` und
   `npm.cmd run verify:phase5` ausfuehren.
6. Erst nach erfolgreicher Verifikation den alten Anbieter stilllegen.

## Phase-4-Abnahmekriterien

- Lokale PostgreSQL-Entwicklung funktioniert weiterhin.
- Cloud-PostgreSQL enthaelt das bestehende Prisma-Schema.
- Datenbankgestuetztes CRUD funktioniert gegen die Cloud-Datenbank.
- JSON-Export funktioniert gegen die Cloud-Datenbank.
- Oeffentlicher PostgreSQL-Schema-Dump kann fuer die Cloud-Datenbank erstellt werden.
- Backup-, Restore- und Anbieterwechsel-Schritte sind dokumentiert.
- Der Humanbase-Kern nutzt weiterhin portable PostgreSQL- und Prisma-Muster.
