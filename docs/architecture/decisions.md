# Architecture Decisions

Diese Datei dokumentiert wichtige Architekturentscheidungen für Humanbase.

## ADR-001: Monorepo-Struktur

### Entscheidung

Humanbase wird als Monorepo aufgebaut. Die erste App liegt unter `apps/web`.

### Begründung

Die Struktur ermöglicht später eine Mobile App und Shared Packages, ohne den einfachen Start der Web-App zu erschweren.

## ADR-002: Web MVP mit Mock-Daten

### Entscheidung

Phase 1 verwendet statische Mock-Daten und lokalen React State.

### Begründung

Zuerst soll die Kernidee getestet werden: Timeline, Note Cards, Kontakte, Tags, Suche und Filter. Datenbank und Authentifizierung würden diesen Test unnötig verzögern.

## ADR-003: Next.js App Router

### Entscheidung

Die Web-App verwendet Next.js mit App Router, TypeScript und Tailwind CSS.

### Begründung

Der App Router ist der aktuelle Standard für neue Next.js-Projekte und bietet eine klare Basis für spätere Server-Funktionen.
