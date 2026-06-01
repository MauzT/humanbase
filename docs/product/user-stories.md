
---

# 6. docs/product/user-stories.md

```md
# User Stories

## Ziel

Diese Datei beschreibt typische Nutzerbedürfnisse für Humanbase.

Die User Stories helfen dabei, Features sinnvoll zu priorisieren und Codex klare Aufgaben zu geben.

## Grundlegende User Stories

### Notiz erstellen

Als Nutzer möchte ich eine neue Notiz erstellen, damit ich Gedanken, Gespräche oder Informationen festhalten kann.

Akzeptanzkriterien:

- Ich kann einen Titel eingeben
- Ich kann Inhalt eingeben
- Ich kann ein Datum setzen
- Ich kann Kontakte hinzufügen
- Ich kann Tags hinzufügen
- Die Notiz erscheint danach in der Timeline

### Timeline sehen

Als Nutzer möchte ich meine Notizen nach Datum sortiert sehen, damit ich nachvollziehen kann, wann etwas passiert ist.

Akzeptanzkriterien:

- Notizen sind nach Datum gruppiert
- Neuere Notizen stehen oben
- Jede Notiz zeigt Titel, Vorschau, Kontakte und Tags
- Leere Tage müssen nicht angezeigt werden

### Nach Kontakt filtern

Als Nutzer möchte ich auf einen Kontakt klicken können, damit ich alle Notizen zu dieser Person sehe.

Akzeptanzkriterien:

- Kontakte werden in Notizkarten angezeigt
- Klick auf Kontakt filtert die Timeline
- Ich sehe nur relevante Notizen
- Ich kann den Filter wieder entfernen

### Nach Tag filtern

Als Nutzer möchte ich auf einen Tag klicken können, damit ich alle Notizen zu diesem Thema sehe.

Akzeptanzkriterien:

- Tags werden in Notizkarten angezeigt
- Klick auf Tag filtert die Timeline
- Ich sehe nur passende Notizen
- Ich kann den Filter wieder entfernen

### Notizdetails anzeigen

Als Nutzer möchte ich eine Notiz öffnen können, damit ich den vollständigen Inhalt sehe.

Akzeptanzkriterien:

- Klick auf eine Notiz öffnet Detailansicht
- Titel, Inhalt, Datum, Kontakte und Tags sind sichtbar
- Ich kann zurück zur Timeline

### Notiz bearbeiten

Als Nutzer möchte ich eine bestehende Notiz bearbeiten können, falls sich Inhalt, Tags oder Kontakte ändern.

Akzeptanzkriterien:

- Ich kann Titel bearbeiten
- Ich kann Inhalt bearbeiten
- Ich kann Tags ändern
- Ich kann Kontakte ändern
- Änderungen werden gespeichert

### Suche verwenden

Als Nutzer möchte ich meine Notizen durchsuchen können, damit ich Informationen schnell finde.

Akzeptanzkriterien:

- Suche durchsucht Titel
- Suche durchsucht Inhalt
- Suche durchsucht Tags
- Suche durchsucht Kontakte
- Ergebnisse aktualisieren sich schnell

## Spätere User Stories

### Google Kontakte importieren

Als Nutzer möchte ich meine Google Kontakte verwenden können, damit ich Personen nicht manuell anlegen muss.

Nicht Teil des ersten MVP.

### Gesprächshistorie pro Kontakt

Als Nutzer möchte ich auf einer Kontaktseite sehen, was ich mit dieser Person besprochen habe.

Teil eines späteren Ausbaus.

### KI-Zusammenfassung

Als Nutzer möchte ich eine automatische Zusammenfassung meiner Notizen zu einer Person oder einem Thema erhalten.

Nicht Teil des ersten MVP.

### Erinnerungen

Als Nutzer möchte ich aus einer Notiz eine Erinnerung erstellen können.

Nicht Teil des ersten MVP.

## Priorisierung

### Muss im MVP enthalten sein

- Notizen anzeigen
- Timeline
- Kontakte als Mock-Daten
- Tags als Mock-Daten
- Filter nach Kontakt
- Filter nach Tag
- einfache Suche

### Sollte bald folgen

- Notiz erstellen
- Notiz bearbeiten
- Persistenz in Datenbank
- bessere Detailansicht

### Später

- Google Kontakte
- Auth
- Mobile App
- KI-Funktionen
- Erinnerungen