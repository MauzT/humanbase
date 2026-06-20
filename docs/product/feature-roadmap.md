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

Status: abgeschlossen. JSON-Export, PostgreSQL-Dump-Dokumentation, Restore-Dokumentation, Phase-3C-Verifikation und ein lokaler Restore-Test sind vorhanden.

- JSON-Export für Notizen, Kontakte, Tags und Beziehungen
- CSV-Export optional für später vorbereiten
- manuellen Datenbank-Dump dokumentieren
- Restore-Prozess dokumentieren
- Restore testweise durchführen
- sicherstellen, dass Nutzer die App verlassen und ihre Daten behalten können

## Phase 4: Persönliche Cloud-Datenbank

Ziel: PostgreSQL verwaltet hosten, ohne den Anbieter tief in das Kernmodell einzubauen.

Status: abgeschlossen. Supabase wird als erster Managed-PostgreSQL-Anbieter verwendet, `DIRECT_URL` ist für Prisma CLI und Admin-Werkzeuge vorbereitet, die Prisma-Migration wurde gegen Supabase PostgreSQL angewendet, Seed-Daten und Verifikationsskripte wurden ausgeführt und ein öffentlicher PostgreSQL-Schema-Dump wurde erstellt.

- Managed-PostgreSQL-Anbieter wählen
- Supabase als ersten Managed-PostgreSQL-Anbieter verwenden
- Google Cloud SQL oder anderen Managed-PostgreSQL-Anbieter als spätere Migrationsoption offenhalten
- EU-Region verwenden, wenn relevant
- Sicherheitsfunktionen des Anbieters aktivieren
- Prisma- und PostgreSQL-Portabilität erhalten
- anbieterspezifische Kopplung möglichst vermeiden
- Umgebungsvariablen und Migrationsprozess dokumentieren
- Cloud-CRUD, JSON-Export und öffentlichen PostgreSQL-Schema-Dump gegen die Cloud-Datenbank verifizieren

## Phase 5: Authentifizierung für persönliche Cloud-Nutzung

Ziel: Cloud-Daten erst nach stabiler Persistenz absichern.

Status: abgeschlossen. Supabase Auth mit Google OAuth, App-level Allowlist,
geschützter Timeline-Zugriff, geschützter JSON-Export, explizite Zuordnung zum
Humanbase-`User` und Phase-5-Verifikation sind vorhanden.

- Authentifizierung ergänzen
- zunächst Single-User- oder Limited-User-Nutzung unterstützen
- jeden Datensatz über `userId` abgrenzen
- keine öffentliche Registrierung, außer sie wird ausdrücklich aktiviert
- starke Passwörter und 2FA verwenden, soweit verfügbar

## Phase 6: Responsive Web und PWA/Mobile-Zugriff

Ziel: Humanbase zunächst im mobilen Browser gut nutzbar machen.

Status: abgeschlossen. Timeline, Filter, Suche, Notiz-Dialog,
Authentifizierungsansichten und Export-Zugriff sind für schmale Viewports
optimiert. Touch-Ziele, Textumbruch und mobile Formularbedienung wurden
verbessert. Ein leichtgewichtiges Web-App-Manifest ist vorhanden; Offline-Sync
und Service Worker bleiben bewusst ausgeschlossen.

- Web-App responsiv gestalten
- mobile Browser-Nutzung prüfen
- optional PWA-Unterstützung ergänzen
- Expo oder React Native erst später erwägen
- native Mobile App nicht verfrüht bauen

## Phase 6.5: Domain und OAuth Branding

Ziel: Die produktive Web- und Login-Erfahrung unter einer stabilen,
vertrauenswürdigen Humanbase-Domain bereitstellen.

Status: Auf später verschoben, da Humanbase erstmal nur zu persönlichen Zwecken und nicht für Dritte genutzt werden soll.

- eigene Domain verbinden
- Google Consent Screen Branding konfigurieren
- optional eine eigene Supabase Auth Domain konfigurieren
- produktive OAuth-Flows verifizieren

## Phase 7: Google Contacts Import

Ziel: Kontakte kontrolliert und mit minimalen Berechtigungen importieren.

Status: abgeschlossen.

- Google OAuth erst nach stabiler Authentifizierung und Cloud-Speicherung ergänzen
- read-only Import aus der Google People API starten
- zunächst keine Zwei-Wege-Synchronisation
- zunächst keine Änderungen an Google zurückschreiben
- minimale Google Scopes verwenden
- importierte Kontakte als normale `Contact`-Datensätze speichern
- `source`, `externalProvider`, `externalId` und `lastSyncedAt` pflegen

## Phase 8: Optionale erweiterte Funktionen

Ziel: Komfortfunktionen erst nach stabilem Kern und erprobten Backups ergänzen.

## Phase 8.1: Einstellungen und Schnellzugriff

Status: abgeschlossen.

- geschützte Einstellungsseite für Daten, Kontakte und Konto
- Google-Kontakte-Import in die Einstellungen verlagern
- JSON-Export in die Einstellungen verlagern
- Abmelden in die Einstellungen verlagern
- kompaktes Zahnrad-Menü auf der Timeline ergänzen
- Einstellungen, Kontakte-Import, JSON-Export und Abmelden auch über das
  Zahnrad-Menü erreichbar machen
- Menü per erneutem Klick, Außenklick und Escape schließen
- Import-Erfolge und OAuth-Fehler auf der Einstellungsseite anzeigen

## Phase 8.2: Tags und Notizerstellung verbessern

Status: abgeschlossen.

- eigene Tag-Verwaltung ergänzen
- Tags mit Name und Farbe erstellen
- doppelte Tag-Namen verhindern
- Nutzung eines Tags durch Notizen anzeigen
- Tags nach Bestätigung löschen, ohne die verknüpften Notizen zu löschen
- Tags direkt im Notizdialog suchen und neu erstellen
- neu erstellte Tags direkt für die Notiz auswählen
- Kontakte im Notizdialog nach Name, E-Mail oder Telefonnummer durchsuchen
- ausgewählte Kontakte und Tags kompakt als entfernbare Auswahl anzeigen
- vollständige Kontaktliste in einem begrenzten Bereich scrollbar machen
- Google-Favoriten aus der People API importieren und oben anzeigen
- ohne Google-Favoriten die häufigsten und zuletzt verwendeten Kontakte
  priorisieren
- Kontakte und Tags auf größeren Bildschirmen nebeneinander anzeigen
- Aktionsleiste des Notizdialogs vom scrollbaren Inhalt trennen
- Datum über einen zusätzlichen „Heute“-Button setzen

## Phase 8.3: Notizdialog komfortabler schließen

Status: abgeschlossen.

- neue Notizen standardmäßig mit dem heutigen lokalen Datum vorbelegen
- leeren Notizdialog per Klick außerhalb schließen
- ausgefüllte Notiz beim Klick außerhalb speichern
- bestehende Pflichtfeldvalidierung beim automatischen Speichern beibehalten

## Phase 8.4: Lange Notizen in der Timeline einklappen

Status: abgeschlossen.

- lange Notizinhalte auf der Hauptseite auf sechs Zeilen begrenzen
- nur bei tatsächlich überlaufendem Inhalt eine Ausklappfunktion anzeigen
- vollständigen Inhalt über einen kompakten Chevron öffnen und wieder einklappen
- Chevron platzsparend rechts direkt unter dem Notizinhalt anordnen
- Karten nicht auf die Höhe benachbarter Notizen strecken
- leere Kontakt- und Tag-Bereiche ohne zusätzlichen Abstand ausblenden

## Phase 8.5: Datenwiederherstellung durch JSON

Status: abgeschlossen.

- lokale Humanbase-JSON-Exporte ausschließlich in den Einstellungen auswählen
- Exportformat, Version, IDs, Datumswerte, Eindeutigkeiten und Beziehungen vor
  jeder Datenänderung validieren
- deutlich erklären, dass der aktuelle Datenstand vollständig überschrieben
  wird
- eine aktuelle JSON-Sicherheitskopie vor der Wiederherstellung empfehlen
- Überschreibung durch die Eingabe `WIEDERHERSTELLEN` explizit bestätigen
- Notizen, Kontakte, Tags und Beziehungen des angemeldeten Nutzers atomar
  ersetzen
- importierte Datensatz-IDs neu zuordnen und Beziehungen entsprechend abbilden
- Humanbase-Nutzer, E-Mail und Supabase-Authentifizierungszuordnung erhalten
- bei Validierungs- oder Datenbankfehlern alle bestehenden Daten unverändert
  lassen
- Dateigröße begrenzen und den geschützten Import gegen fremde Ursprünge
  absichern
- erfolgreichen Restore, ungültige Dateien und Transaktions-Rollback über
  `npm.cmd run verify:phase8.5` prüfen

## Phase 8.6: Google-Kontakte als einzige Kontaktquelle

Status: abgeschlossen.

- keine manuelle Erstellung oder Bearbeitung von Kontakten in Humanbase
- Google Kontakte bleibt die einzige operative Quelle für Kontakte
- wiederholte Importe anhand von `userId`, `externalProvider` und `externalId`
  dem bestehenden Humanbase-Kontakt zuordnen
- die interne `Contact.id` bei erneuten Importen stabil halten
- Name, E-Mail, Telefonnummer, Profilbild, Favoritenstatus und
  Synchronisationszeitpunkt aus Google aktualisieren
- alle vorhandenen `NoteContact`-Beziehungen erhalten
- Kontakte nicht löschen, wenn sie in einem späteren Google-Import fehlen
- ein schreibgeschütztes Kontaktbuch neben der Tag-Verwaltung bereitstellen
- Google-Profilbilder anzeigen und ohne Bild auf den Buchstaben-Avatar
  zurückfallen
- Sync-Verhalten über `npm.cmd run verify:phase8.6` prüfen

## Weitere mögliche Phase-8-Funktionen

- KI-Zusammenfassungen
- semantische Suche
- Dark Mode in den Einstellungen
- Login mit E-Mail-Konto ohne Google über Supabase inklusive
  „Passwort vergessen“
- Notizvorlage erstellen
- Kalender neben der Timeline anzeigen, der beim Scrollen den zugehörigen
  Monat zeigt und in den Einstellungen deaktiviert werden kann
- Filtern auch nach mehreren Kontakten und Tags gleichzeitig ermöglichen
- Erinnerungen
- Gesprächsvorbereitung
- umfangreichere Kontakthistorie

## Grundregel

Jede Phase soll einzeln funktionieren. Neue Funktionen dürfen Datenportabilität, Backups und die einfache Wartbarkeit durch eine Person nicht gefährden.
