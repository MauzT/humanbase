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
      <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-6">
          <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[var(--accent)] uppercase">
            Personal context, protected
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Humanbase
          </h1>
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
      <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-6">
          <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[var(--accent)] uppercase">
            Personal context, protected
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Humanbase
          </h1>
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
    <main className="mx-auto min-h-[100dvh] max-w-6xl px-4 py-5 sm:px-8 sm:py-8 lg:px-12">
      <header className="mb-6 flex flex-col gap-5 border-b border-[var(--border)] pb-6 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:pb-7">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold tracking-[0.22em] text-[var(--accent)] uppercase">
            Personal context, by date
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Humanbase
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
            Gedanken, Gespräche und Entscheidungen in einer ruhigen Timeline.
          </p>
        </div>
        <div className="grid w-full min-w-0 gap-3 text-sm text-[var(--muted)] sm:w-auto sm:justify-items-end">
          <span className="max-w-full break-all">{user.email}</span>
          <nav
            aria-label="Konto und Daten"
            className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end"
          >
            <Link
              href="/export/json"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--accent)]"
            >
              JSON export
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>

      <HumanbaseTimeline {...timelineData} />
    </main>
  );
}
