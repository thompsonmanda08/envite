export const dynamic = "force-dynamic";

import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { getMyEvents } from "@/app/_actions/events";
import { Button } from "@/components/ui/button";
import { DashboardHero } from "./_components/dashboard-hero";
import { EventsTimeline } from "./_components/events-timeline";
import { StatsRow } from "./_components/stats-row";

export default async function DashboardPage() {
  const [user, eventsRes] = await Promise.all([
    getCurrentUser(),
    getMyEvents().catch(() => ({ success: false, data: [] as any[] })),
  ]);
  const events = (eventsRes.success ? eventsRes.data : []) ?? [];

  const upcoming = events
    .filter(
      (e: any) =>
        e?.start_date && new Date(e.start_date).getTime() >= Date.now(),
    )
    .sort(
      (a: any, b: any) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
    );

  const draftCount = events.filter((e: any) => e?.status === "draft").length;
  const publishedCount = events.filter(
    (e: any) => e?.status === "published",
  ).length;

  return (
    <div className="relative isolate">
      <div
        aria-hidden
        className="halo pointer-events-none absolute -top-24 right-0 h-[420px] w-[520px] opacity-70"
      />
      <div
        aria-hidden
        className="halo-cool pointer-events-none absolute top-40 -left-20 h-[360px] w-[420px] opacity-60"
      />

      <DashboardHero
        userName={
          [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
          user?.email ||
          "there"
        }
        nextEvent={upcoming[0]}
      />

      <div className="hairline my-12" />

      <StatsRow
        total={events.length}
        upcoming={upcoming.length}
        drafts={draftCount}
        published={publishedCount}
      />

      <div className="hairline my-12" />

      <section className="space-y-8">
        <header className="flex items-end justify-between gap-6">
          <div>
            <p className="font-brand text-xs uppercase tracking-[0.32em] text-mute">
              The Programme
            </p>
            <h2 className="font-display mt-2 text-4xl font-medium tracking-tight md:text-5xl">
              Forthcoming events
            </h2>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/events">View all</Link>
          </Button>
        </header>

        <EventsTimeline events={upcoming.slice(0, 6)} />
      </section>
    </div>
  );
}
