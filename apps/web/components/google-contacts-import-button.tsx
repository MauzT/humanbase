import { startGoogleContactsImport } from "@/app/actions";

export function GoogleContactsImportButton() {
  return (
    <form action={startGoogleContactsImport}>
      <button
        type="submit"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--accent)] sm:w-auto"
      >
        Google-Kontakte importieren
      </button>
    </form>
  );
}
