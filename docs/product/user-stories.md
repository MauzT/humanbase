# User Stories

## Ziel

Diese Datei beschreibt typische Nutzerbedürfnisse für Humanbase. Die User Stories helfen dabei, Features sinnvoll zu priorisieren.

## Phase 1: Klickbarer Mock-Daten-Prototyp

### Timeline sehen

Als Nutzer möchte ich meine Notizen nach Datum sortiert sehen, damit ich nachvollziehen kann, wann etwas passiert ist.

Akzeptanzkriterien:

- Notizen sind nach Datum gruppiert
- neuere Notizen stehen oben
- jede Note Card zeigt Titel, Vorschau, Kontakte und Tags
- leere Tage werden nicht angezeigt

### Nach Kontakt filtern

Als Nutzer möchte ich auf einen Kontakt klicken können, damit ich alle Notizen zu dieser Person sehe.

Akzeptanzkriterien:

- Kontakte werden in Note Cards angezeigt
- Klick auf einen Kontakt filtert die Timeline
- nur relevante Notizen werden angezeigt
- der Filter kann wieder entfernt werden

### Nach Tag filtern

Als Nutzer möchte ich auf einen Tag klicken können, damit ich alle Notizen zu diesem Thema sehe.

Akzeptanzkriterien:

- Tags werden in Note Cards angezeigt
- Klick auf einen Tag filtert die Timeline
- nur passende Notizen werden angezeigt
- der Filter kann wieder entfernt werden

### Suche verwenden

Als Nutzer möchte ich meine Notizen durchsuchen können, damit ich Informationen schnell finde.

Akzeptanzkriterien:

- Suche durchsucht Titel und Inhalt
- Suche durchsucht Tags und Kontakte
- Ergebnisse aktualisieren sich direkt

## Phase 2: Lokale Interaktion

### Notiz erstellen

Als Nutzer möchte ich eine neue Notiz erstellen, damit ich Gedanken, Gespräche oder Informationen festhalten kann.

Akzeptanzkriterien:

- Titel, Inhalt und Datum können eingegeben werden
- Kontakte und Tags können hinzugefügt werden
- die Notiz erscheint danach in der Timeline

### Notiz bearbeiten

Als Nutzer möchte ich eine bestehende Notiz bearbeiten können, falls sich Inhalt, Tags oder Kontakte ändern.

Akzeptanzkriterien:

- Titel und Inhalt können bearbeitet werden
- Tags und Kontakte können geändert werden
- Änderungen werden lokal gespeichert

### Notiz löschen

Als Nutzer möchte ich eine Notiz löschen können, wenn sie nicht mehr benötigt wird.

## Phase 8.7: Notizvorlagen

### Vorlage verwalten

Als Nutzer möchte ich eigene Vorlagen mit wiederkehrenden Fragen erstellen,
bearbeiten, sortieren und löschen können, damit ich häufige Notizarten
einheitlich vorbereiten kann.

Akzeptanzkriterien:

- jede Vorlage hat einen eindeutigen Namen und mindestens eine Frage
- Fragen können hinzugefügt, entfernt und neu angeordnet werden
- das Löschen einer Vorlage verändert bereits erstellte Notizen nicht

### Vorlage für eine Notiz verwenden

Als Nutzer möchte ich beim Erstellen einer Notiz eine Vorlage auswählen, damit
die vorbereiteten Fragen als Struktur im Inhalt erscheinen.

Akzeptanzkriterien:

- Vorlagen stehen nur beim Erstellen einer neuen Notiz zur Auswahl
- die Fragen werden in ihrer gespeicherten Reihenfolge eingefügt
- eingefügter Text bleibt frei bearbeitbar
- bestehender Inhalt wird nur nach Bestätigung ersetzt

## Später

- persistente Speicherung mit PostgreSQL und Prisma
- Export, Backup und Restore
- persönliche Cloud-Datenbank
- Authentifizierung
- responsive Web-App und optional PWA
- read-only Google Contacts Import
- optionale KI-Funktionen und Erinnerungen
