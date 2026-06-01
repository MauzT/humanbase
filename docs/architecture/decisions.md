# Architecture Decisions

Diese Datei dokumentiert wichtige Architekturentscheidungen für Humanbase.

## ADR-001: Monorepo-Struktur

### Entscheidung

Humanbase wird als Monorepo aufgebaut.

Geplante Struktur:

```text
humanbase/
  apps/
    web/
  packages/
    shared/
  docs/