# Project Structure

## Ziel

Humanbase startet als einfache Web-App, lässt aber Raum für spätere Shared Packages und eine Mobile App.

## Aktuelle Struktur

```text
humanbase/
  apps/
    web/
      app/
      components/
        ui/
      data/
      lib/
      types/
  docs/
    product/
    architecture/
    development/
  README.md
  .gitignore
  .env.example
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
