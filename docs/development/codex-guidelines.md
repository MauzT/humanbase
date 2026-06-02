# Codex Guidelines

## Ziel

Codex soll beim Entwickeln von Humanbase helfen, ohne unkontrolliert große Änderungen vorzunehmen.

## Grundregel

Codex ist ein Coding-Assistent, nicht der alleinige Architekt.

Der Mensch entscheidet:

- Produktlogik
- Prioritäten
- Architektur
- Review
- Merge
- Veröffentlichungen

Codex hilft bei:

- Code schreiben
- Dateien erstellen
- Bugs finden
- Refactoring
- Tests
- Dokumentation
- Erklärungen

## Arbeitsweise

- Vor Änderungen relevante Produkt- und Architekturdocs lesen.
- Vor der Implementierung den aktuellen Repo-Stand prüfen.
- Kleine, klar abgegrenzte und reviewbare Schritte umsetzen.
- Bestehende Strukturen und Benennungen respektieren.
- Das funktionierende UI möglichst stabil halten.
- Nach Änderungen betroffene Dateien und Verifikation erklären.

## Architekturleitlinien

Codex soll erhalten:

- Datenportabilität über PostgreSQL, Prisma und normale SQL-Relationen
- einfache Architektur, die durch eine Person wartbar bleibt
- Export-, Backup- und Restore-Fähigkeit
- geringe operative Komplexität
- austauschbare Cloud-Anbieter und möglichst wenig Vendor Lock-in

Codex soll nicht verfrüht ergänzen:

- Google OAuth oder Google Contacts Import
- Authentifizierung
- Cloud-Deployment
- native Mobile App
- KI-Funktionen
- SaaS-Skalierungsarchitektur ohne konkreten Bedarf

## Gute Aufgaben für Codex

```text
Inspect the repository and propose a small plan for adding the Phase 3A Prisma schema. Do not change files until the plan is reviewed.
```

```text
Add JSON export for notes, contacts, tags and relationships without introducing provider-specific dependencies.
```
