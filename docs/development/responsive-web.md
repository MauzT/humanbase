# Responsive Web and Mobile Browser Testing

## Scope

Phase 6 keeps Humanbase as a single responsive Next.js application. It does
not add a native app, React Native, Expo, or offline synchronization.

The authenticated timeline keeps note creation, filters, and notes in one short
hierarchy. Data, contact, and account actions live on a separate settings page.
On narrow screens its action controls and the timeline controls expand to the
available width.

## Responsive behavior

- The main layout supports widths from 320 px upward without horizontal
  scrolling.
- Timeline cards use one column on narrow screens and two columns on large
  screens.
- Search, contact filters, tag filters, and reset controls stack on mobile.
- Form controls use at least 16 px text on narrow screens to avoid automatic
  browser zoom on iOS.
- Interactive controls use an approximately 44 px minimum touch target.
- Long note titles, note content, contact names, tags, and account emails wrap.
- The note editor becomes a full-height mobile sheet and remains a centered
  dialog on larger screens.
- The editor keeps its heading and actions reachable while its fields scroll,
  locks background scrolling, and can be closed with Escape on keyboards.
- The authenticated header opens a compact settings menu with a gear button.
- Google Contacts import, JSON export, and sign-out remain easy to reach in
  both the menu and settings.

## Manual breakpoint matrix

Use browser responsive mode and test at least:

| Viewport | Representative device |
| --- | --- |
| 320 x 568 | Small mobile browser |
| 375 x 667 | iPhone-sized browser |
| 390 x 844 | Modern iPhone-sized browser |
| 412 x 915 | Modern Android-sized browser |
| 768 x 1024 | Tablet portrait |
| 1024 x 768 | Tablet landscape |
| 1440 x 900 | Desktop |

At each narrow breakpoint verify:

1. No page-level horizontal scrollbar appears.
2. Login and denied-account screens fit and the primary action is easy to tap.
3. The gear menu opens without overflowing the viewport and closes by outside
   click or Escape.
4. Search accepts text without unwanted page zoom.
5. Contact and tag filters can be selected and reset.
6. Contact and tag chips are easy to tap and update filtering.
7. A note can be created, edited, and deleted.
8. The note editor remains usable with the software keyboard visible.
9. Long titles, content, names, tags, and emails do not overflow.
10. Settings redirect unauthenticated users to login.
11. Google Contacts import feedback returns to settings.
12. JSON export downloads while authenticated and remains denied without an
    allowed session.
13. Login, OAuth callback, logout, and protected timeline access still work.

## Lightweight PWA setup

Humanbase now exposes a web app manifest and scalable app icon through the
Next.js metadata routes. Supported browsers can use the standalone display
metadata and theme color when adding Humanbase to a home screen.

There is deliberately no service worker, cache layer, or offline data support.
An installed shortcut still requires a network connection and a valid
Supabase Auth session.

## Automated verification

Run from `apps/web`:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit --incremental false
npx.cmd prisma validate
npm.cmd run verify:phase3b
npm.cmd run verify:phase3c
npm.cmd run verify:phase5
npm.cmd run build
```

The existing verification scripts cover CRUD, relationships, user scoping,
authentication mapping, access boundaries, and export data. Browser responsive
mode remains necessary for visual layout, touch, software keyboard, download,
and OAuth-provider behavior.
