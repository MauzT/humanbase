"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useRef,
  useState,
} from "react";

import {
  HUMANBASE_JSON_EXPORT_FORMAT,
  HUMANBASE_JSON_EXPORT_VERSION,
  MAXIMUM_JSON_RESTORE_FILE_SIZE,
} from "@/lib/json-export-format";

const confirmationText = "WIEDERHERSTELLEN";

type RestorePreview = {
  exportedAt: string;
  notes: number;
  contacts: number;
  tags: number;
  noteContacts: number;
  noteTags: number;
};

type RestoreResponse = {
  error?: string;
  ok?: boolean;
  result?: RestorePreview;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getPreview(value: unknown): RestorePreview | null {
  if (!isRecord(value) || !isRecord(value.metadata)) {
    return null;
  }

  if (
    value.metadata.format !== HUMANBASE_JSON_EXPORT_FORMAT ||
    value.metadata.version !== HUMANBASE_JSON_EXPORT_VERSION ||
    typeof value.metadata.exportedAt !== "string" ||
    Number.isNaN(new Date(value.metadata.exportedAt).getTime()) ||
    !Array.isArray(value.notes) ||
    !Array.isArray(value.contacts) ||
    !Array.isArray(value.tags) ||
    !Array.isArray(value.noteContacts) ||
    !Array.isArray(value.noteTags)
  ) {
    return null;
  }

  return {
    exportedAt: value.metadata.exportedAt,
    notes: value.notes.length,
    contacts: value.contacts.length,
    tags: value.tags.length,
    noteContacts: value.noteContacts.length,
    noteTags: value.noteTags.length,
  };
}

function formatExportedAt(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function JsonRestoreForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<RestorePreview | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<RestorePreview | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;

    setFile(null);
    setPreview(null);
    setConfirmation("");
    setError(null);
    setSuccess(null);

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".json")) {
      setError("Bitte wähle eine Datei mit der Endung .json aus.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size === 0) {
      setError("Die ausgewählte Datei ist leer.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAXIMUM_JSON_RESTORE_FILE_SIZE) {
      setError("Die JSON-Datei darf höchstens 10 MB groß sein.");
      event.target.value = "";
      return;
    }

    try {
      const parsedJson: unknown = JSON.parse(await selectedFile.text());
      const nextPreview = getPreview(parsedJson);

      if (!nextPreview) {
        throw new Error("invalid-preview");
      }

      setFile(selectedFile);
      setPreview(nextPreview);
    } catch {
      setError(
        "Die Datei ist kein lesbarer Humanbase-JSON-Export der Version 1.",
      );
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file || !preview || confirmation !== confirmationText) {
      return;
    }

    setIsRestoring(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch("/import/json", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as RestoreResponse;

      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(
          payload.error ?? "Die Wiederherstellung ist fehlgeschlagen.",
        );
      }

      setSuccess(payload.result);
      setFile(null);
      setPreview(null);
      setConfirmation("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (restoreError) {
      setError(
        restoreError instanceof Error
          ? restoreError.message
          : "Die Wiederherstellung ist fehlgeschlagen.",
      );
    } finally {
      setIsRestoring(false);
    }
  }

  const isConfirmed =
    file !== null &&
    preview !== null &&
    confirmation === confirmationText &&
    !isRestoring;

  return (
    <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
      <div
        role="note"
        className="rounded-xl border border-[#c97a30] bg-[#fff7ed] px-4 py-3 text-sm leading-6 text-[#7c3f12]"
      >
        <strong>Achtung: vollständige Überschreibung.</strong> Die Datei ersetzt
        alle aktuellen Notizen, Kontakte, Tags und deren Verknüpfungen. Dein
        Konto und deine Anmeldung bleiben erhalten. Erstelle vorher über
        „JSON exportieren“ eine aktuelle Sicherheitskopie.
      </div>

      <div>
        <label
          htmlFor="json-restore-file"
          className="mb-2 block text-sm font-semibold"
        >
          Humanbase-JSON auswählen
        </label>
        <input
          ref={fileInputRef}
          id="json-restore-file"
          name="file"
          type="file"
          accept=".json,application/json"
          disabled={isRestoring}
          onChange={handleFileChange}
          className="block min-h-11 w-full cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-3 file:py-2 file:font-semibold file:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
        />
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
          Akzeptiert wird ein Humanbase-JSON-Export der Version 1 bis 10 MB.
        </p>
      </div>

      {preview ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm">
          <p className="font-semibold">Ausgewählte Sicherung</p>
          <p className="mt-1 text-[var(--muted)]">
            Exportiert am {formatExportedAt(preview.exportedAt)}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-[var(--muted)]">Notizen</dt>
              <dd className="font-semibold">{preview.notes}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)]">Kontakte</dt>
              <dd className="font-semibold">{preview.contacts}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)]">Tags</dt>
              <dd className="font-semibold">{preview.tags}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)]">
                Kontakt-Verknüpfungen
              </dt>
              <dd className="font-semibold">{preview.noteContacts}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)]">
                Tag-Verknüpfungen
              </dt>
              <dd className="font-semibold">{preview.noteTags}</dd>
            </div>
          </dl>
        </div>
      ) : null}

      {preview ? (
        <div>
          <label
            htmlFor="json-restore-confirmation"
            className="mb-2 block text-sm font-semibold"
          >
            Tippe zur Bestätigung{" "}
            <span className="font-mono">{confirmationText}</span>
          </label>
          <input
            id="json-restore-confirmation"
            type="text"
            value={confirmation}
            disabled={isRestoring}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-60"
          />
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-[#a94442] bg-[#fff1f0] px-4 py-3 text-sm text-[#7d2e2c]"
        >
          {error} Bei einem fehlgeschlagenen Import bleiben die aktuellen Daten
          unverändert.
        </p>
      ) : null}

      {success ? (
        <p
          role="status"
          className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-3 text-sm leading-6"
        >
          Wiederherstellung abgeschlossen: {success.notes} Notizen,{" "}
          {success.contacts} Kontakte und {success.tags} Tags wurden
          wiederhergestellt.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!isConfirmed}
        className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-[#9f2f2c] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#842724] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-self-start"
      >
        {isRestoring
          ? "Daten werden wiederhergestellt …"
          : "Aktuelle Daten ersetzen"}
      </button>
    </form>
  );
}
