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
- Notizvorlagen mit ihren geordneten Fragen
- Kontakte inklusive spaeterer Importfelder
- Tags
- Note-Contact-Beziehungen
- Note-Tag-Beziehungen

Die Struktur kann mit folgendem Befehl geprueft werden:

```powershell
npm.cmd run verify:phase3c
```

## JSON-Wiederherstellung in der App

Ein Humanbase-JSON-Export der Version 1 kann auf der geschuetzten
Einstellungsseite wiederhergestellt werden. Die Funktion ist bewusst nicht im
Schnellzugriffsmenue verfuegbar.

Vor der Wiederherstellung:

1. Einen aktuellen JSON-Export als Sicherheitskopie herunterladen.
2. Unter `Einstellungen` die lokale JSON-Datei auswaehlen.
3. Exportzeitpunkt und angezeigte Datensatzanzahlen pruefen.
4. Die vollstaendige Ueberschreibung mit `WIEDERHERSTELLEN` bestaetigen.
5. Erst danach `Aktuelle Daten ersetzen` ausfuehren.

Die Wiederherstellung ersetzt ausschliesslich Notizen, Notizvorlagen, Kontakte,
Tags und deren Beziehungen des angemeldeten Humanbase-Nutzers. Der Humanbase-`User`, seine
E-Mail und die Supabase-Authentifizierungszuordnung bleiben erhalten.

Vor dem ersten Schreibzugriff werden Format, Version, UUIDs, Datumswerte,
Eindeutigkeiten und alle Beziehungen validiert. Importierte Datensatz-IDs
werden neu erzeugt und die Beziehungen auf diese neuen IDs abgebildet. Der
vollstaendige Ersatz erfolgt in einer serialisierbaren PostgreSQL-Transaktion.
Bei einem Validierungs- oder Datenbankfehler bleiben die bisherigen Daten
unveraendert.

Fruehe Exporte der Version 1 enthalten das spaeter hinzugekommene Kontaktfeld
`isFavorite` noch nicht. Solche Exporte bleiben kompatibel; fehlende
Favoriteninformationen werden als `false` wiederhergestellt.

Zusaetzliche Schutzmassnahmen:

- nur `.json`-Dateien
- maximal 10 MB Dateigroesse
- erlaubte Humanbase-Authentifizierung erforderlich
- POST-Anfragen nur vom Humanbase-Ursprung
- keine Protokollierung des JSON-Dateiinhalts

Die Restore-Logik kann mit folgendem Befehl gegen temporaere Testnutzer
verifiziert werden:

```powershell
npm.cmd run verify:phase8.5
```

Der Test prueft einen erfolgreichen Vollersatz, die Erhaltung der
Authentifizierungszuordnung, ID-Neuzuordnung, Beziehungen, Ablehnung
ungueltiger Dateien und den vollstaendigen Transaktions-Rollback bei einem
Datenbankfehler.

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

## Cloud-PostgreSQL-Dump

Phase 4 verwendet optional `DIRECT_URL` fuer Prisma CLI, `pg_dump` und
`pg_restore`. Wenn `DIRECT_URL` gesetzt ist, sollte ein Cloud-Dump gegen diese
Admin-Verbindung erstellt werden:

```powershell
cd apps/web
New-Item -ItemType Directory -Force backups
$env:PG_DATABASE_URL = $env:DIRECT_URL -replace '\?.*$', ''
pg_dump --dbname "$env:PG_DATABASE_URL" --schema=public --format custom --file "backups\humanbase-cloud.dump"
```

Hinweise:

- Supabase enthaelt verwaltete Schemas wie `auth`, `storage` und `realtime`.
  Fuer Humanbase wird deshalb nur das portable `public`-Schema gedumpt.
- Nutze fuer Dumps nach Moeglichkeit eine direkte oder Session-Pooler-Verbindung,
  nicht eine transaktionsgepoolte Runtime-Verbindung.
- Stelle sicher, dass SSL-Anforderungen des Cloud-Anbieters in der URL enthalten
  sind, wenn der Anbieter sie verlangt.
- Anbieter-Backups ersetzen keine eigenen Exporte. Erstelle weiterhin
  regelmaessige JSON-Exporte und PostgreSQL-Dumps.
- Bewahre mindestens eine Backup-Kopie ausserhalb des aktiven Cloud-Anbieters
  auf.

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
