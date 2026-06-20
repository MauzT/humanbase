import { AccountMenu } from "@/components/account-menu";
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
      <header className="mb-6 flex items-start justify-between gap-4 border-b border-[var(--border)] pb-6 sm:mb-8 sm:items-end sm:gap-6 sm:pb-7">
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
        <AccountMenu />
      </header>

      <HumanbaseTimeline {...timelineData} />
    </main>
  );
}
