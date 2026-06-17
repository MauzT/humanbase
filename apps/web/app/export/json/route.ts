import { requireAllowedHumanbaseUser } from "@/lib/auth/supabase-user";
import { buildUserJsonExport } from "@/lib/export-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAllowedHumanbaseUser();
    const exportData = await buildUserJsonExport(user.id);
    const exportedAt = exportData.metadata.exportedAt.replace(
      /[:.]/g,
      "-",
    );

    return Response.json(exportData, {
      headers: {
        "Content-Disposition": `attachment; filename="humanbase-export-${exportedAt}.json"`,
      },
    });
  } catch {
    return Response.json(
      { error: "Allowed Supabase authentication is required." },
      { status: 401 },
    );
  }
}
