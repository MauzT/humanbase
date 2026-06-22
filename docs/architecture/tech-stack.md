# Tech Stack

## Leitlinie

Humanbase verwendet langweilige, verbreitete und portable Technologien. Das Projekt soll durch eine Person verständlich und wartbar bleiben. Hochskalierende SaaS-Architektur und tiefe Kopplung an einen proprietären Backend-Anbieter sind keine Ziele.

## Aktueller Web-Prototyp

- Next.js mit App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui-Struktur für wiederverwendbare UI-Komponenten
- statische Mock-Daten
- lokaler React State für Filter und Note-CRUD

## Phase 3: Portable Datenbank

- PostgreSQL
- Prisma als bevorzugtes ORM
- normale SQL-Relationen
- Prisma-Migrationen
- Seed-Daten aus dem aktuellen Mock-Datenbestand
- Next.js Server Actions oder Route Handlers nach Prüfung im Implementierungsschritt

## Spätere Cloud-Nutzung

Supabase ist ein wahrscheinlicher erster Kandidat für Managed PostgreSQL und gegebenenfalls Auth. Humanbase soll Supabase primär als Anbieter standardisierter Infrastruktur behandeln und tiefe Kopplung an proprietäre Plattformfunktionen vermeiden.

Google Cloud SQL oder ein anderer Managed-PostgreSQL-Anbieter bleibt ein möglicher späterer Migrationspfad. Das Kernmodell bleibt normales PostgreSQL über Prisma.

## Spätere optionale Ergänzungen

- Authentifizierung nach stabiler Cloud-Persistenz
- responsive Web-App und optional PWA
- Google People API für read-only Kontaktimport
- Expo oder React Native nur bei echtem Bedarf
- KI-Funktionen erst nach stabilen Backups

## Datenportabilität

- JSON-Export für Notizen, Notizvorlagen, Kontakte, Tags und Beziehungen
- optional CSV-Export
- dokumentierte PostgreSQL-Dumps
- dokumentierter Restore-Prozess
- dokumentierte Migration zwischen Managed-PostgreSQL-Anbietern
