import Link from "next/link";

import { HumanbaseTimeline } from "@/components/humanbase-timeline";
import { SignInForm } from "@/components/sign-in-form";
import { SignOutButton } from "@/components/sign-out-button";
import { getCurrentAuthState } from "@/lib/auth/supabase-user";
import { getTimelineDataForUser } from "@/lib/humanbase-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const authState = await getCurrentAuthState();

  if (authState.status === "unauthenticated") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-8 sm:px-8">
        <div className="mb-6">
          <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[var(--accent)] uppercase">
            Personal context, protected
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Humanbase</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-base">
            Melde dich an, um deine persoenliche Timeline zu oeffnen.
          </p>
        </div>
        <SignInForm />
      </main>
    );
  }

  if (authState.status === "denied") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-8 sm:px-8">
        <div className="mb-6">
          <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[var(--accent)] uppercase">
            Personal context, protected
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Humanbase</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-base">
            Dieses Google-Konto ist nicht fuer Humanbase freigeschaltet.
          </p>
          {authState.email ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              Angemeldet als {authState.email}
            </p>
          ) : null}
        </div>
        <SignOutButton />
      </main>
    );
  }

  const { user } = authState;
  const timelineData = await getTimelineDataForUser(user.id);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-8 sm:px-8 lg:px-12">
      <header className="mb-8 flex flex-col gap-4 border-b border-[var(--border)] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[var(--accent)] uppercase">
            Personal context, by date
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Humanbase
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
            Gedanken, Gespräche und Entscheidungen in einer ruhigen Timeline.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
          <span>{user.email}</span>
          <Link
            href="/export/json"
            className="rounded-lg border border-[var(--border)] px-3 py-2 font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)]"
          >
            JSON export
          </Link>
          <SignOutButton />
        </div>
      </header>

      <HumanbaseTimeline {...timelineData} />
    </main>
  );
}
