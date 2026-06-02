# Coding Standards

## Ziel

Der Code soll klar, wartbar und gut verständlich sein.

## Sprache

- Neue Dateien verwenden TypeScript, wenn möglich.
- React-Komponenten verwenden `.tsx`.
- Utilities und Datentypen verwenden `.ts`.

## Benennung

- Dateien verwenden `kebab-case`.
- React-Komponenten verwenden `PascalCase`.
- Variablen und Funktionen verwenden `camelCase`.
- Typen verwenden `PascalCase`.

Beispiele:

```text
note-card.tsx
notes-timeline.tsx
timeline-filters.tsx
filter-notes.ts
```

## Komponenten

- Komponenten bleiben klein und auf eine Aufgabe fokussiert.
- Datenlogik wird nach Möglichkeit von Darstellung getrennt.
- Wiederverwendbare UI-Bausteine liegen unter `components/ui/`.

## State und Persistenz

- Phase 2 verwendet lokalen React State für Interaktionen.
- Ab Phase 3 wird Persistenz schrittweise über PostgreSQL und Prisma ergänzt.
- Eine externe State-Management-Bibliothek wird erst eingeführt, wenn konkrete Anforderungen dies nötig machen.
- Das Datenmodell bleibt portabel und vermeidet unnötige Anbieterabhängigkeit.
