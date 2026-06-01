# Feature Roadmap

## Phase 0: Projektsetup

Ziel: Repository und Dokumentation vorbereiten.

Aufgaben:

- README erstellen
- Produktdocs erstellen
- Architekturdocs erstellen
- GitHub Repository einrichten
- VS Code als Entwicklungsumgebung nutzen
- Codex Guidelines festlegen

## Phase 1: Web MVP mit Mock-Daten

Ziel: Erste klickbare Version ohne Backend.

Features:

- Next.js App
- Tailwind Styling
- shadcn/ui Komponenten
- statische Mock-Daten
- Timeline View
- Note Cards
- Tags
- Kontakte
- Filter
- Suche

Nicht enthalten:

- Login
- Datenbank
- Google API
- Mobile App

## Phase 2: Lokale Interaktion

Ziel: Nutzer kann mit der App interagieren.

Features:

- Notiz erstellen
- Notiz bearbeiten
- Notiz löschen
- lokaler State
- einfache Validierung
- bessere Such- und Filterlogik

## Phase 3: Datenbank

Ziel: Notizen dauerhaft speichern.

Mögliche Tools:

- PostgreSQL
- Prisma oder Drizzle
- Next.js API Routes oder Server Actions

Features:

- Datenbank-Schema
- CRUD für Notes
- CRUD für Tags
- CRUD für Contacts
- Migrationen
- Seed-Daten

## Phase 4: Authentifizierung

Ziel: Nutzerkonten einführen.

Mögliche Tools:

- Auth.js
- Clerk
- Supabase Auth

Features:

- Login
- Logout
- Nutzerbezogene Daten
- geschützte Routen

## Phase 5: Google Contacts Integration

Ziel: Google Kontakte verwenden.

Mögliche Tools:

- Google People API
- OAuth

Features:

- Google Verbindung herstellen
- Kontakte importieren
- Kontakte synchronisieren
- Notizen mit Google Kontakten verknüpfen

## Phase 6: Mobile App

Ziel: Humanbase als mobile App verfügbar machen.

Mögliche Tools:

- Expo
- React Native
- shared TypeScript packages

Features:

- Timeline mobil
- Notiz erstellen
- Filter
- Suche
- später Offline Support

## Phase 7: KI-Funktionen

Ziel: Humanbase intelligenter machen.

Mögliche Features:

- automatische Tag-Vorschläge
- Zusammenfassungen pro Kontakt
- Zusammenfassungen pro Thema
- semantische Suche
- Gesprächsvorbereitung
- offene Punkte erkennen

## Phase 8: Teamfähigkeit

Ziel: Zusammenarbeit ermöglichen.

Mögliche Features:

- Workspaces
- geteilte Notizen
- Rollen und Rechte
- Kommentare
- Activity Feed

## Grundregel

Jede Phase soll einzeln funktionieren.

Keine spätere Phase darf die erste einfache Nutzung unnötig blockieren.