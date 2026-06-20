import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") ?? "/";
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/";

  if (!code && next === "/contacts/import") {
    return NextResponse.redirect(
      new URL(
        "/settings?contacts_error=oauth_callback_failed",
        requestUrl.origin,
      ),
    );
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const errorParam =
        next === "/contacts/import"
          ? "contacts_error=oauth_callback_failed"
          : "auth_error=oauth_callback_failed";

      return NextResponse.redirect(
        new URL(
          next === "/contacts/import"
            ? `/settings?${errorParam}`
            : `/?${errorParam}`,
          requestUrl.origin,
        ),
      );
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
