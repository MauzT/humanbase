import { HumanbaseTimeline } from "@/components/humanbase-timeline";
import { getTimelineDataForDefaultDevelopmentUser } from "@/lib/humanbase-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const timelineData = await getTimelineDataForDefaultDevelopmentUser();

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
        <p className="text-sm text-[var(--muted)]">Web MVP | PostgreSQL</p>
      </header>

      <HumanbaseTimeline {...timelineData} />
    </main>
  );
}
