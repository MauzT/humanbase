# Humanbase

Humanbase ist eine datumsbasierte Notiz-App mit Kontakt- und Tag-Bezug. Das Projekt ist in erster Linie ein langlebiges persönliches Notiz- und Wissenssystem, kein SaaS-Produkt für Millionen von Nutzern.

Die App soll verständlich und durch eine Person wartbar bleiben. Datenhoheit, sichere Speicherung, Schutz vor Datenverlust und Portabilität zwischen Anbietern sind wichtiger als unnötige Skalierungs- oder Plattformkomplexität.

## Projektstatus

Abgeschlossen:

- Phase 1: klickbarer Web-Prototyp mit statischen Mock-Daten
- Phase 2: lokale Interaktion mit React State
- Timeline mit Kontakt-, Tag- und Textfilter
- Notizen erstellen, bearbeiten und löschen
- einfache Validierung

Phase 3A ist abgeschlossen:

- Prisma-Abhängigkeiten und Prisma-Schema
- lokale PostgreSQL-Konfiguration über `DATABASE_URL`
- portable Datenbankmodelle inklusive `User`, `Note`, `Contact`, `Tag`, `NoteContact` und `NoteTag`
- angewendete initiale Prisma-Migration

Noch nicht enthalten:

- Datenbankpersistenz
- Seed-Daten
- Authentifizierung
- Cloud-Deployment
- Google Contacts Import
- Mobile App

## Langfristige technische Richtung

Humanbase verwendet bewusst verbreitete, portable Technologien:

- Next.js
- TypeScript
- PostgreSQL
- Prisma
- normale SQL-Relationen
- JSON-Export und später optional CSV-Export
- dokumentierte Backup- und Restore-Prozesse

## Lokale Entwicklung

Voraussetzung: Node.js 20.9 oder neuer.

```bash
cd apps/web
npm install
npm run dev
```

Danach ist die App unter `http://localhost:3000` erreichbar.

Für die lokale PostgreSQL- und Prisma-Einrichtung siehe [Lokales PostgreSQL](docs/development/local-postgresql.md).

## Struktur

```text
humanbase/
  apps/
    web/
  docs/
    product/
    architecture/
    development/
```

Weitere Informationen:

- [Produktvision](docs/product/vision.md)
- [MVP](docs/product/mvp.md)
- [Feature Roadmap](docs/product/feature-roadmap.md)
- [Tech Stack](docs/architecture/tech-stack.md)
- [Datenmodell](docs/architecture/data-model.md)
- [Datensicherheit](docs/architecture/data-safety.md)
