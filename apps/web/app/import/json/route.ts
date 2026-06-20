import { type NextRequest } from "next/server";

import { requireAllowedHumanbaseUser } from "@/lib/auth/supabase-user";
import { MAXIMUM_JSON_RESTORE_FILE_SIZE } from "@/lib/json-export-format";
import {
  JsonRestoreValidationError,
  restoreUserJsonExport,
} from "@/lib/json-restore";

export const dynamic = "force-dynamic";

function getAllowedOrigins(request: NextRequest) {
  const origins = new Set([request.nextUrl.origin]);

  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      origins.add(new URL(process.env.NEXT_PUBLIC_APP_URL).origin);
    } catch {
      // Invalid configuration is ignored here and handled by the normal origin.
    }
  }

  return origins;
}

export async function POST(request: NextRequest) {
  let user;

  try {
    user = await requireAllowedHumanbaseUser();
  } catch {
    return Response.json(
      { error: "Bitte melde dich erneut an." },
      { status: 401 },
    );
  }

  const requestOrigin = request.headers.get("origin");

  if (!requestOrigin || !getAllowedOrigins(request).has(requestOrigin)) {
    return Response.json(
      { error: "Die Importanfrage stammt nicht von Humanbase." },
      { status: 403 },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.startsWith("multipart/form-data")) {
    return Response.json(
      { error: "Bitte wähle eine JSON-Datei aus." },
      { status: 415 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".json")) {
      throw new JsonRestoreValidationError(
        "Bitte wähle eine Humanbase-JSON-Datei aus.",
      );
    }

    if (file.size === 0) {
      throw new JsonRestoreValidationError("Die ausgewählte Datei ist leer.");
    }

    if (file.size > MAXIMUM_JSON_RESTORE_FILE_SIZE) {
      return Response.json(
        { error: "Die JSON-Datei darf höchstens 10 MB groß sein." },
        { status: 413 },
      );
    }

    let parsedJson: unknown;

    try {
      parsedJson = JSON.parse(await file.text());
    } catch {
      throw new JsonRestoreValidationError(
        "Die ausgewählte Datei enthält kein gültiges JSON.",
      );
    }

    const result = await restoreUserJsonExport(user.id, parsedJson);

    return Response.json({ ok: true, result });
  } catch (error) {
    if (error instanceof JsonRestoreValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    console.error("Humanbase JSON restore failed.", error);
    return Response.json(
      {
        error:
          "Die Wiederherstellung ist fehlgeschlagen. Die aktuellen Daten wurden nicht verändert.",
      },
      { status: 500 },
    );
  }
}
