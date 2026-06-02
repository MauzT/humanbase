# Architecture Decisions

Diese Datei dokumentiert wichtige Architekturentscheidungen für Humanbase.

## ADR-001: Monorepo-Struktur

### Entscheidung

Humanbase wird als Monorepo aufgebaut. Die erste App liegt unter `apps/web`.

### Begründung

Die Struktur ermöglicht später Shared Packages oder eine Mobile App, ohne den einfachen Start der Web-App zu erschweren.

## ADR-002: Prototyp zuerst

### Entscheidung

Phase 1 verwendet statische Mock-Daten. Phase 2 ergänzt lokale Interaktion mit React State.

### Begründung

Timeline, Note Cards, Kontakte, Tags, Suche, Filter und Note-CRUD werden geprüft, bevor Persistenz ergänzt wird.

## ADR-003: Next.js App Router

### Entscheidung

Die Web-App verwendet Next.js mit App Router, TypeScript und Tailwind CSS.

### Begründung

Der Stack ist verbreitet, gut dokumentiert und bietet eine klare Basis für spätere Server-Funktionen.

## ADR-004: Persönliche Langlebigkeit vor SaaS-Skalierung

### Entscheidung

Humanbase wird primär als langlebiges persönliches System entwickelt, nicht als hochskalierendes SaaS-Produkt.

### Begründung

Datenhoheit, Wartbarkeit durch eine Person und geringe operative Komplexität sind wichtiger als Architektur für Millionen von Nutzern.

## ADR-005: PostgreSQL als portable Datengrundlage

### Entscheidung

PostgreSQL wird die langfristige Datengrundlage. Das Modell verwendet normale SQL-Relationen.

### Begründung

PostgreSQL ist verbreitet, dokumentiert und zwischen lokalen sowie verwalteten Umgebungen portierbar.

## ADR-006: Prisma als bevorzugtes ORM für Phase 3

### Entscheidung

Prisma ist das bevorzugte ORM für Phase 3, solange kein starker technischer Grund dagegen auftritt.

### Begründung

Prisma unterstützt ein verständliches Schema, Migrationen und einen gut nachvollziehbaren Zugriff aus TypeScript.

## ADR-007: Lokale Datenbank vor Cloud-Datenbank

### Entscheidung

PostgreSQL und Prisma werden zuerst lokal eingerichtet. Ein Managed-PostgreSQL-Anbieter folgt erst nach stabiler lokaler Persistenz.

### Begründung

Das Datenmodell und CRUD-Verhalten können unabhängig vom Cloud-Anbieter geprüft werden.

## ADR-008: Export und Backup vor wichtigen persönlichen Daten

### Entscheidung

JSON-Export, Datenbank-Dumps, Restore-Dokumentation und Restore-Tests werden ergänzt, bevor Humanbase als Ablage für wichtige persönliche Daten dient.

### Begründung

Cloud-Speicherung allein schützt nicht ausreichend gegen versehentliches Löschen, Ausfälle oder Anbieterwechsel.

## ADR-009: Cloud-Anbieter bleibt austauschbar

### Entscheidung

Supabase kann später als Managed PostgreSQL und gegebenenfalls für Auth verwendet werden. Das Kernmodell bleibt PostgreSQL über Prisma. Google Cloud SQL oder ein anderer Managed-PostgreSQL-Anbieter bleibt eine mögliche Migrationsoption.

### Begründung

Anbieterspezifische Funktionen dürfen keinen unnötigen Lock-in erzeugen.

## ADR-010: Google Contacts später und zuerst read-only

### Entscheidung

Google Contacts Import folgt erst nach stabiler Cloud-Persistenz und Authentifizierung. Die erste Integration liest nur über die Google People API und schreibt keine Änderungen zurück.

### Begründung

Minimale Scopes und ein begrenzter Import reduzieren Sicherheitsrisiken und Komplexität.
