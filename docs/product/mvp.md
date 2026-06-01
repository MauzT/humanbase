# Humanbase MVP

## Ziel des MVP

Das MVP soll zeigen, ob die Grundidee von Humanbase funktioniert:

> Nutzer können Notizen in einer Timeline sehen und über Kontakte, Tags und Suchtext wiederfinden.

Der erste MVP-Schritt ist bewusst ein klickbarer Web-Prototyp mit statischen Mock-Daten. Er validiert die zentrale Darstellung und Navigation ohne Backend.

## Phase 1: Web MVP mit Mock-Daten

Die erste Version enthält:

1. Timeline-Ansicht
2. Notizen mit Datum
3. Note Cards mit Titel, Vorschau, Kontakten und Tags
4. statische Mock-Daten für Notizen, Kontakte und Tags
5. Filter nach Kontakt
6. Filter nach Tag
7. einfache Suche

Nicht enthalten:

- Notiz erstellen oder bearbeiten
- Datenbank und Persistenz
- Authentifizierung
- Google Contacts Integration
- externe State-Management-Bibliothek
- Mobile App

## Hauptscreen: Timeline View

Die Timeline ist die Hauptansicht. Sie zeigt Notizen gruppiert nach Datum, neuere Einträge zuerst.

Eine Note Card zeigt:

- Titel
- kurze Vorschau des Inhalts
- Datum
- Kontakte
- Tags

Beispiel:

```text
Heute

Gespräch über Humanbase MVP
Mit: Max
Tags: Humanbase, MVP, Produkt
Preview: Wir haben entschieden, zuerst eine einfache Timeline ...
```

## Nächste Phase

Nach dem klickbaren Prototyp folgt lokale Interaktion:

- Notiz erstellen
- Notiz bearbeiten
- Notiz löschen
- lokaler React State
- einfache Validierung
