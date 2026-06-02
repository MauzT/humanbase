# Project Structure

## Ziel

Humanbase startet als einfache Web-App, lässt aber Raum für spätere Shared Packages und optionalen mobilen Zugriff.

## Aktuelle Struktur

```text
humanbase/
  apps/
    web/
      app/
      components/
        ui/
      data/
      prisma/
        migrations/
        schema.prisma
      lib/
      types/
      .env.example
      prisma.config.ts
  docs/
    product/
    architecture/
      data-safety.md
    development/
  README.md
  .gitignore
```

## Spätere Erweiterung

Gemeinsam genutzte Typen und Utilities können bei Bedarf in ein Shared Package verschoben werden:

```text
packages/
  shared/
    src/
      types/
      utils/
```

Das Shared Package wird erst ergänzt, wenn mindestens zwei Apps dieselben Module verwenden.

Prisma-Dateien und versionierte Migrationen liegen neben der Web-App unter `apps/web`. Der generierte Prisma Client wird unter `apps/web/generated/prisma/` erzeugt und nicht in Git eingecheckt.
