import Link from "next/link";
import { redirect } from "next/navigation";

import { GoogleContactsImportButton } from "@/components/google-contacts-import-button";
import { SignOutButton } from "@/components/sign-out-button";
import { getCurrentAuthState } from "@/lib/auth/supabase-user";

export const dynamic = "force-dynamic";

type SettingsProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const contactImportErrors: Record<string, string> = {
  authentication_required:
    "Bitte melde dich erneut an, bevor du Kontakte importierst.",
  missing_origin: "Die App-URL fuer den Google-Import fehlt.",
  oauth_start_failed: "Die Google-Freigabe konnte nicht gestartet werden.",
  oauth_callback_failed:
    "Die Google-Freigabe konnte nicht abgeschlossen werden.",
  missing_provider_token:
    "Google hat kein Zugriffstoken fuer Kontakte bereitgestellt.",
  import_failed: "Die Google-Kontakte konnten nicht importiert werden.",
};

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Settings({ searchParams }: SettingsProps) {
  const authState = await getCurrentAuthState();

  if (authState.status !== "allowed") {
    redirect("/");
  }

  const params = await searchParams;
  const importedCount = firstSearchParam(params.contacts_imported);
  const skippedCount = firstSearchParam(params.contacts_skipped);
  const importErrorCode = firstSearchParam(params.contacts_error);
  const importError = importErrorCode
    ? (contactImportErrors[importErrorCode] ??
      "Der Google-Kontakte-Import ist fehlgeschlagen.")
    : null;

  return (
    <main className="mx-auto min-h-[100dvh] max-w-3xl px-4 py-5 sm:px-8 sm:py-8">
      <header className="mb-6 border-b border-[var(--border)] pb-6 sm:mb-8 sm:pb-7">
        <Link
          href="/"
          className="mb-5 inline-flex min-h-11 items-center rounded-full px-1 font-semibold text-[var(--accent)]"
        >
          ← Zur Timeline
        </Link>
        <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[var(--accent)] uppercase">
          Humanbase
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          Einstellungen
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
          Verwalte deine Kontakte, deine Daten und dein Konto.
        </p>
      </header>

      {importedCount !== undefined ? (
        <p
          role="status"
          className="mb-5 rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-3 text-sm"
        >
          {importedCount} Google-Kontakte wurden importiert oder aktualisiert.
          {skippedCount
            ? ` ${skippedCount} Eintraege wurden uebersprungen.`
            : ""}
        </p>
      ) : null}

      {importError ? (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-[#a94442] bg-[#fff1f0] px-4 py-3 text-sm text-[#7d2e2c]"
        >
          {importError}
        </p>
      ) : null}

      <div className="grid gap-5">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight">
            Daten & Kontakte
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Importiere Kontakte aus Google oder sichere alle Humanbase-Daten in
            einem portablen JSON-Export.
          </p>
          <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
            <GoogleContactsImportButton />
            <Link
              href="/export/json"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--accent)] sm:w-auto"
            >
              JSON exportieren
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight">Konto</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Angemeldet als{" "}
            <span className="break-all font-semibold text-[var(--foreground)]">
              {authState.user.email}
            </span>
          </p>
          <div className="mt-5">
            <SignOutButton className="w-full sm:w-auto" />
          </div>
        </section>
      </div>
    </main>
  );
}
