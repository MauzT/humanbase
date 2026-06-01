# Tech Stack

## Phase 1: Web MVP

Für den ersten klickbaren Prototyp wird folgender Stack verwendet:

- Next.js mit App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui-Struktur für wiederverwendbare UI-Komponenten
- statische Mock-Daten
- lokaler React State für Suche und Filter

## Projektstruktur

Die Web-App liegt unter `apps/web`.

```text
apps/web/
  app/
  components/
    ui/
  data/
  lib/
  types/
```

## Nicht Teil von Phase 1

- Datenbank
- ORM
- Authentifizierung
- Google API
- externe State-Management-Bibliothek

## Spätere mögliche Ergänzungen

- PostgreSQL
- Prisma oder Drizzle
- Next.js Server Actions oder Route Handlers
- Auth.js, Clerk oder Supabase Auth
- Google People API
- Expo und React Native
