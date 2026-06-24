# Google Contacts Import

## Ziel

Phase 7 importiert Google-Kontakte kontrolliert und ausschliesslich lesend.
Humanbase schreibt keine Daten zu Google zurueck und speichert weder
Google-Access- noch Refresh-Tokens.

## Ablauf

1. Ein bereits freigeschalteter Humanbase-Nutzer startet den Import.
2. Supabase Auth fordert zusaetzlich nur den Google-Scope
   `https://www.googleapis.com/auth/contacts.readonly` an.
3. Der Callback liefert ein kurzlebiges Provider-Token in der Supabase-Session.
4. Humanbase liest alle Seiten von `people/me/connections` aus der People API.
5. Kontakte werden anhand von `userId`, `externalProvider` und `externalId`
   lokal erstellt oder aktualisiert.
6. Die Mitgliedschaft in der Google-Systemgruppe `starred` wird als
   Favoritenmerkmal übernommen.

Ein erneuter Import ist idempotent. Lokal angelegte Kontakte werden nicht mit
Google-Kontakten anhand von Name, E-Mail oder Telefonnummer zusammengefuehrt.
Damit vermeidet Humanbase unsichere automatische Zuordnungen. Humanbase bietet
keine manuelle Kontaktanlage mehr an; vorhandene historische oder
wiederhergestellte Datensaetze bleiben aus Kompatibilitaetsgruenden erhalten.

Phase 8.8 ergaenzt davon getrennt Humanbase-eigene Kontaktbeziehungen. Diese
Beziehungen koennen zunaechst nur als Platzhalter mit optionalem Namen oder
Notiz existieren und spaeter manuell mit einem importierten Google-Kontakt
verknuepft werden. Das aendert die Google-Kontakte selbst nicht und schreibt
nichts zu Google zurueck.

Beim erneuten Import bleibt die bestehende Humanbase-`Contact.id` stabil.
Mutable Google-Felder werden aktualisiert, vorhandene `NoteContact`-Beziehungen
bleiben erhalten und lokal gespeicherte Kontakte werden nicht geloescht, wenn
sie in einem spaeteren Google-Import fehlen.

Google-Profilbilder werden ueber `photos` importiert. Die UI zeigt das Bild,
wenn es geladen werden kann, und verwendet andernfalls den bisherigen
Buchstaben-Avatar.

## Google Cloud und Supabase einrichten

1. Aktiviere im Google-Cloud-Projekt des Supabase-Google-Providers die
   **Google People API**.
2. Fuege dem OAuth Consent Screen den Scope
   `.../auth/contacts.readonly` hinzu.
3. Halte die bestehenden Supabase Redirect URLs aktuell. Humanbase verwendet
   weiterhin `/auth/callback`; es ist keine zweite Google Client ID noetig.
4. Fuehre in `apps/web` die Migration und Client-Generierung aus:

```powershell
npx.cmd prisma migrate deploy
npx.cmd prisma generate
```

## Verifikation

```powershell
npm.cmd run verify:phase7
```

Das Skript prueft Feldabbildung, People-API-Paginierung, idempotente Upserts,
Google-Herkunftsfelder und die Begrenzung auf den Humanbase-Nutzer. Der echte
OAuth-Dialog muss zusaetzlich einmal im Browser durchlaufen werden.

Phase 8.6 prueft die erweiterten Bestandsgarantien:

```powershell
npm.cmd run verify:phase8.6
```

## Grenzen

- kein Zwei-Wege-Sync
- keine Schreib-Scopes
- keine Loeschung lokaler Kontakte, wenn sie bei Google verschwinden
- keine dauerhaft gespeicherten Google-Tokens
- Google-Favoriten werden beim nächsten manuellen Import aktualisiert
