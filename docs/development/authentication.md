# Authentication

## Ziel

Phase 5 verwendet Supabase Auth als Authentifizierungsanbieter fuer die
persoenliche Cloud-Nutzung. Der Humanbase-Kern bleibt weiterhin portabel:
Notizen, Kontakte, Tags, Beziehungen und Exporte laufen ueber Prisma und das
eigene PostgreSQL-Schema.

## Umsetzung

- Anmeldung ueber Supabase Auth
- Google OAuth als erster Login-Weg
- keine Humanbase-eigene Passwort-Hashing- oder Session-Tabelle
- keine Google People API oder Google Contacts Scopes in Phase 5
- App-level Allowlist ueber `HUMANBASE_ALLOWED_EMAILS`
- explizite Zuordnung von Supabase Auth User zu Humanbase `User` ueber
  `User.supabaseAuthUserId`
- Datenzugriff, CRUD und Export bleiben ueber den Humanbase `userId` begrenzt

## Umgebungsvariablen

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
HUMANBASE_ALLOWED_EMAILS="you@example.com"
```

`HUMANBASE_ALLOWED_EMAILS` ist eine kommaseparierte Liste. Wenn die Liste leer
ist, wird kein angemeldeter Nutzer fuer Humanbase freigeschaltet.

## Supabase Auth einrichten

1. Oeffne das Supabase-Projekt.
2. Aktiviere unter Authentication den Google Provider.
3. Hinterlege die Google OAuth Client ID und das Client Secret.
4. Setze die Site URL auf die App-URL, zum Beispiel `http://localhost:3000`
   lokal oder die Produktions-URL.
5. Ergaenze Redirect URLs fuer lokale Entwicklung und Produktion, zum Beispiel
   `http://localhost:3000/auth/callback` und
   `https://example.com/auth/callback`.
6. Deaktiviere oeffentliche Registrierung, soweit der verwendete Supabase-Flow
   das erlaubt. Humanbase erzwingt zusaetzlich die Allowlist in der App.

Im Google OAuth Consent Screen werden fuer Phase 5 nur die Basis-Scopes fuer
Login/Profil/E-Mail verwendet. Keine Google Contacts oder Google People API
Scopes anfordern; der Kontakte-Import folgt erst in Phase 7.

## Bestehende Daten einem Login zuordnen

Beim ersten erlaubten Login sucht Humanbase den App-User in dieser Reihenfolge:

1. `User.supabaseAuthUserId`
2. `User.email`
3. neuer leerer Humanbase `User`

Fuer die bestehenden Seed-Daten kann `HUMANBASE_ALLOWED_EMAILS` gesetzt und
danach `npx.cmd prisma db seed` ausgefuehrt werden. Der Seed setzt die erste
erlaubte E-Mail auf den Default-Entwicklungsnutzer, ohne Passwortdaten zu
speichern.

## Datenbank aktualisieren

Fuehre die Migration aus `apps/web` aus:

```powershell
npx.cmd prisma validate
npx.cmd prisma migrate deploy
npx.cmd prisma generate
```

Lokal kann statt `migrate deploy` auch `npx.cmd prisma migrate dev` verwendet
werden.

## Verifikation

```powershell
npm.cmd run verify:phase3b
npm.cmd run verify:phase3c
npm.cmd run verify:phase5
```

`verify:phase5` benoetigt keinen echten Browser-OAuth-Login. Es prueft die
Allowlist-Logik, die explizite Supabase-User-zu-Humanbase-User-Zuordnung,
`userId`-Scoping, geschuetzten Export und Cross-User-Schreibschutz.

## Grenzen

Humanbase enthaelt in Phase 5 noch keine Self-Service-Nutzerverwaltung und
keinen Google Contacts Import. Supabase Auth kann E-Mail/Passwort anbieten,
aber Humanbase speichert keine eigenen Passwort-Hashes und keine eigenen
Auth-Sessions mehr.
