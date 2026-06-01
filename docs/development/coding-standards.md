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

## State

Für Phase 1 reicht lokaler React State. Eine externe State-Management-Bibliothek wird erst eingeführt, wenn konkrete Anforderungen dies nötig machen.
