import { NextResponse, type NextRequest } from "next/server";

import { requireAllowedHumanbaseUser } from "@/lib/auth/supabase-user";
import { importGoogleContactsForUser } from "@/lib/google-contacts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const redirectUrl = new URL("/settings", request.url);

  try {
    const user = await requireAllowedHumanbaseUser();
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const providerToken = session?.provider_token;

    if (!providerToken) {
      redirectUrl.searchParams.set("contacts_error", "missing_provider_token");
      return NextResponse.redirect(redirectUrl);
    }

    const result = await importGoogleContactsForUser(user.id, providerToken);
    redirectUrl.searchParams.set(
      "contacts_imported",
      String(result.imported),
    );

    if (result.skipped > 0) {
      redirectUrl.searchParams.set("contacts_skipped", String(result.skipped));
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Google Contacts import failed.", error);
    redirectUrl.searchParams.set("contacts_error", "import_failed");
    return NextResponse.redirect(redirectUrl);
  }
}
