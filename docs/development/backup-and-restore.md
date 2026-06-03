# Backup and Restore

## Ziel

Phase 3C stellt sicher, dass Humanbase-Daten exportiert, gesichert und in
eine andere PostgreSQL-Datenbank wiederhergestellt werden koennen.

Backups schuetzen vor:

- versehentlichem Loeschen
- fehlerhaften Aenderungen
- Ausfall des lokalen Rechners oder Cloud-Anbieters
- Anbieterwechsel

## JSON-Export

Der JSON-Export ist fuer Menschen lesbar und bleibt unabhaengig von einem
bestimmten PostgreSQL-Anbieter.

```powershell
cd apps/web
npm.cmd run export:json
```

Der Befehl schreibt eine Datei nach `apps/web/exports/`, zum Beispiel:

```text
apps/web/exports/humanbase-export-2026-06-03T19-54-28-603Z.json
```

Der Ordner `apps/web/exports/` ist absichtlich in Git ignoriert. Exportdateien
enthalten persoenliche Daten und sollen nicht versioniert werden.

Das Exportformat enthaelt:

- Metadaten mit Format, Version und Exportzeitpunkt
- den aktuellen Entwicklungsnutzer
- Notizen
- Kontakte inklusive spaeterer Importfelder
- Tags
- Note-Contact-Beziehungen
- Note-Tag-Beziehungen

Die Struktur kann mit folgendem Befehl geprueft werden:

```powershell
npm.cmd run verify:phase3c
```

## PostgreSQL-Dump

Ein PostgreSQL-Dump ist die bevorzugte technische Sicherung fuer eine spaetere
vollstaendige Wiederherstellung.

Erstelle zuerst einen lokalen Backup-Ordner, der nicht in Git liegt:

```powershell
cd apps/web
New-Item -ItemType Directory -Force backups
```

Erstelle dann einen Custom-Format-Dump:

```powershell
$env:PG_DATABASE_URL = $env:DATABASE_URL -replace '\?.*$', ''
pg_dump --dbname "$env:PG_DATABASE_URL" --format custom --file "backups\humanbase.dump"
```

Hinweise:

- `DATABASE_URL` muss auf die aktuell zu sichernde Humanbase-Datenbank zeigen.
- PostgreSQL-CLI-Tools wie `pg_dump` verstehen Prisma-Parameter wie
  `?schema=public` nicht. Fuer diese Tools wird die URL ohne Query-Parameter
  verwendet.
- Der Dump enthaelt Datenbankinhalte und kann persoenliche Daten enthalten.
- Bewahre mindestens eine Kopie getrennt vom aktiven Rechner oder Anbieter auf.
- Fuer regelmaessige Backups sollte der Dateiname einen Zeitstempel enthalten.

## Restore-Test

Ein Backup ist erst vertrauenswuerdig, wenn ein Restore erfolgreich getestet
wurde. Der Restore-Test soll in eine separate Datenbank erfolgen, nicht in die
aktive Entwicklungsdatenbank.

Beispiel fuer eine lokale Testdatenbank:

```powershell
createdb -U postgres humanbase_restore_test
```

Setze danach temporaer eine Restore-URL. Passe Benutzer, Passwort und Port an
deine lokale PostgreSQL-Installation an:

```powershell
$env:RESTORE_PG_DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5432/humanbase_restore_test"
$env:RESTORE_PRISMA_DATABASE_URL = "$env:RESTORE_PG_DATABASE_URL?schema=public"
```

Spiele den Dump in die Testdatenbank ein:

```powershell
pg_restore --dbname "$env:RESTORE_PG_DATABASE_URL" --clean --if-exists "backups\humanbase.dump"
```

Pruefe die wiederhergestellte Datenbank, indem du `DATABASE_URL` temporaer auf
die Restore-Datenbank setzt:

```powershell
$env:ORIGINAL_DATABASE_URL = $env:DATABASE_URL
$env:DATABASE_URL = $env:RESTORE_PRISMA_DATABASE_URL
npm.cmd run verify:phase3c
$env:DATABASE_URL = $env:ORIGINAL_DATABASE_URL
```

Wenn `verify:phase3c` erfolgreich ist, sind Kernentitaeten und Beziehungen im
Restore vorhanden.

Nach dem Test kann die Restore-Datenbank geloescht werden:

```powershell
dropdb -U postgres humanbase_restore_test
```

## Restore-Checkliste

- JSON-Export erzeugt
- PostgreSQL-Dump erzeugt
- Dump in separater Datenbank wiederhergestellt
- `verify:phase3c` gegen die Restore-Datenbank ausgefuehrt
- Restore-Datenbank nach dem Test entfernt
- Backup-Kopie ausserhalb des aktiven Rechners oder Anbieters abgelegt

## CSV-Ausblick

CSV-Export ist fuer Phase 3C nicht erforderlich. Ein spaeterer CSV-Export kann
als zusaetzlicher Komfort fuer Notizen, Kontakte und Tags ergaenzt werden. Die
Beziehungstabellen sollten dabei entweder eigene CSV-Dateien erhalten oder in
einem klar dokumentierten Format exportiert werden.
