# Data Safety

## Ziel

Humanbase soll persönliche Daten langfristig sicher und portabel speichern. Sicherheit umfasst nicht nur Schutz vor Angreifern, sondern auch Schutz vor Datenverlust und Anbieterabhängigkeit.

## Threat Model

Humanbase berücksichtigt mindestens:

- Angreifer, die Zugangsdaten oder Daten stehlen möchten
- versehentliches Löschen oder fehlerhafte Änderungen
- Ausfall des Cloud-Anbieters
- Einstellung oder Änderung eines Anbieterdienstes
- Verlust oder Defekt des lokalen Rechners

## Sicherheitsprinzipien

- 2FA aktivieren, soweit der verwendete Anbieter dies unterstützt
- Secrets niemals in GitHub oder andere Versionskontrollen committen
- `.env`-Dateien lokal halten und nur dokumentierte Platzhalter teilen
- in Produktion ausschließlich HTTPS verwenden
- für Google nur die minimal erforderlichen Scopes anfordern
- Datenbankzugriff nicht unnötig öffentlich exponieren
- Zugriffsdaten regelmäßig prüfen und bei Verdacht rotieren

## Schutz vor Datenverlust

- automatische Backups des Cloud-Anbieters aktivieren und Aufbewahrung prüfen
- regelmäßige manuelle JSON-Exporte erstellen
- regelmäßige PostgreSQL-Dumps erstellen
- Restore-Prozess dokumentieren
- Restore wiederholt testen, nicht nur dokumentieren
- mindestens eine Sicherung getrennt vom aktiven Anbieter aufbewahren

## Portabilität

Humanbase reduziert Lock-in durch:

- PostgreSQL als Standarddatenbank
- Prisma-Migrationen
- normale SQL-Relationen
- JSON-Export für Notizen, Kontakte, Tags und Beziehungen
- optionalen CSV-Export für einfache Weiterverarbeitung
- dokumentierte Migration zu einem anderen Managed-PostgreSQL-Anbieter

## Phasen

Phase 3C ergänzt Export, Dumps, Restore-Dokumentation und eine lokale Restore-Verifikation. Erst danach soll Humanbase für wichtige persönliche Daten genutzt werden. Phase 4 ergänzt automatische Anbieter-Backups und dokumentiert die Cloud-Migration.

Phase 5 ergaenzt Supabase Auth, Google OAuth und `userId`-Scoping fuer alle
normalen App-Zugriffe. Oeffentliche Registrierung bleibt fuer Humanbase durch
eine App-level Allowlist blockiert. Google Contacts/People API Scopes werden
erst in Phase 7 betrachtet.

## Phase-4-Sicherheitsnotiz

Fuer Phase 4 sind mindestens SSL fuer PostgreSQL-Verbindungen, starke
Account-Sicherheit, gepruefte Anbieter-Backups und eine eigene Backup-Kopie
ausserhalb des aktiven Cloud-Anbieters erforderlich. Details stehen unter
[Cloud PostgreSQL](../development/cloud-postgresql.md).
