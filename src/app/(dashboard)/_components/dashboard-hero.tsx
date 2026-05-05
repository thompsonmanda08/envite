import Link from "next/link";
import { ArrowUpRight, CalendarRange, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { EventRecord } from "@/types";

function formatLong(d?: string) {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function daysUntil(d?: string) {
  if (!d) return null;
  const target = new Date(d).getTime();
  if (isNaN(target)) return null;
  const diff = Math.ceil((target - Date.now()) / 86_400_000);
  return diff;
}

export function DashboardHero({
  userName,
  nextEvent,
}: {
  userName: string;
  nextEvent?: EventRecord;
}) {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const dn = nextEvent ? daysUntil(nextEvent.start_date) : null;
  const dateLong = nextEvent ? formatLong(nextEvent.start_date) : null;

  return (
    <section className="relative grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
      <div className="space-y-7">
        <div className="flex items-center gap-3">
          <span className="font-brand text-[11px] uppercase tracking-[0.42em] text-mute">
            The Atelier &middot; {today}
          </span>
        </div>

        <h1 className="font-display text-balance text-5xl font-medium leading-[0.95] tracking-tight md:text-7xl">
          Good evening,
          <br />
          <span className="italic text-foreground/95">{userName}.</span>
        </h1>

        <p className="max-w-xl text-base text-mute md:text-lg">
          A quiet workspace for designing distinguished invitations,
          orchestrating the guest list, and watching the RSVPs arrive.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button asChild size="lg" className="rounded-full px-6">
            <Link href="/dashboard/events/new">
              <Plus className="size-4" />
              Compose an event
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="rounded-full px-6"
          >
            <Link href="/dashboard/events">
              Open the salon
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <aside className="relative">
        {nextEvent ? (
          <div className="glass relative overflow-hidden rounded-3xl p-8">
            <div
              aria-hidden
              className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-secondary/30 blur-3xl"
            />
            <p className="font-brand text-[11px] uppercase tracking-[0.42em] text-mute">
              Next on the calendar
            </p>
            <h3 className="font-display mt-4 text-3xl font-medium leading-tight tracking-tight">
              {nextEvent.title}
            </h3>
            {nextEvent.venue && (
              <p className="mt-1 text-sm italic text-mute">
                {nextEvent.venue}
              </p>
            )}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-6xl font-semibold tabular-nums leading-none">
                {dn !== null && dn >= 0 ? dn : "—"}
              </span>
              <span className="font-brand text-xs uppercase tracking-[0.32em] text-mute">
                days
              </span>
            </div>
            {dateLong && (
              <p className="mt-4 flex items-center gap-2 text-sm text-mute">
                <CalendarRange className="size-3.5" />
                {dateLong}
              </p>
            )}
            <Button
              asChild
              variant="ghost"
              className="mt-6 -ml-3 rounded-full"
            >
              <Link href={`/dashboard/events/${nextEvent.id}`}>
                Open event
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-3xl border border-hairline bg-surface/60 p-8">
            <p className="font-brand text-[11px] uppercase tracking-[0.42em] text-mute">
              Calendar empty
            </p>
            <h3 className="font-display mt-4 text-3xl font-medium leading-tight">
              Begin with a single event.
            </h3>
            <p className="mt-3 text-sm text-mute">
              Whether a quiet supper or a state occasion — start by composing
              the first invitation.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link href="/dashboard/events/new">
                <Plus className="size-4" />
                New event
              </Link>
            </Button>
          </div>
        )}
      </aside>
    </section>
  );
}
