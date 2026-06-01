# Humanbase

Humanbase ist eine datumsbasierte Notiz-App mit Kontakt- und Tag-Bezug.

Die erste Version ist ein klickbarer Web-Prototyp mit statischen Mock-Daten. Notizen werden in einer Timeline nach Datum gruppiert und können nach Kontakten, Tags und Suchtext gefiltert werden.

## Projektstatus

Aktuell entsteht Phase 1 des MVP:

- Next.js Web-App
- TypeScript
- Tailwind CSS
- vorbereitete shadcn/ui-Struktur
- statische Mock-Daten
- Timeline mit Note Cards
- Kontakt- und Tag-Filter
- einfache Suche

Noch nicht enthalten:

- Datenbank
- Authentifizierung
- Google API
- externe State-Management-Bibliothek
- Mobile App

## Lokale Entwicklung

Voraussetzung: Node.js 20.9 oder neuer.

```bash
cd apps/web
npm install
npm run dev
```

Danach ist die App unter `http://localhost:3000` erreichbar.

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
