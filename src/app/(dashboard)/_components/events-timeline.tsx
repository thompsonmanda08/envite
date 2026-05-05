import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

import type { EventRecord } from "@/types";
import { cn } from "@/lib/utils";

function fmt(d?: string) {
  if (!d) return { day: "—", month: "" };
  const date = new Date(d);
  if (isNaN(date.getTime())) return { day: "—", month: "" };
  return {
    day: date.toLocaleDateString("en-GB", { day: "2-digit" }),
    month: date.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
    weekday: date.toLocaleDateString("en-GB", { weekday: "long" }),
  };
}

const STATUS_TONE: Record<string, string> = {
  draft: "text-mute",
  published: "text-foreground",
  cancelled: "text-destructive line-through opacity-60",
};

export function EventsTimeline({ events }: { events: EventRecord[] }) {
  if (!events.length) {
    return (
      <div className="rounded-3xl border border-dashed border-hairline bg-surface/40 p-12 text-center">
        <p className="font-display text-2xl font-medium tracking-tight">
          Nothing on the horizon.
        </p>
        <p className="mt-2 text-sm italic text-mute">
          Compose your first event to populate the calendar.
        </p>
      </div>
    );
  }

  return (
    <ol className="divide-y divide-hairline border-y border-hairline">
      {events.map((e, i) => {
        const { day, month, weekday } = fmt(e.start_date);
        return (
          <li
            key={e.id}
            className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-6 py-7 transition-colors duration-500 hover:bg-surface/40 md:gap-10"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex flex-col items-center justify-center px-2 text-center">
              <span className="font-display text-5xl font-semibold leading-none tabular-nums tracking-tight">
                {day}
              </span>
              <span className="font-brand mt-1 text-[10px] uppercase tracking-[0.32em] text-mute">
                {month}
              </span>
            </div>

            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="font-brand text-[10px] uppercase tracking-[0.32em] text-mute">
                  {weekday}
                </span>
                <span
                  className={cn(
                    "font-brand text-[10px] uppercase tracking-[0.32em]",
                    STATUS_TONE[e.status] ?? "text-mute",
                  )}
                >
                  {e.status}
                </span>
              </div>
              <h3 className="font-display truncate text-2xl font-medium tracking-tight md:text-3xl">
                <Link
                  href={`/dashboard/events/${e.id}`}
                  className="decoration-from-font underline-offset-4 hover:underline"
                >
                  {e.title}
                </Link>
              </h3>
              {e.venue && (
                <p className="flex items-center gap-1.5 truncate text-sm text-mute">
                  <MapPin className="size-3.5 shrink-0" />
                  <span className="truncate italic">{e.venue}</span>
                </p>
              )}
            </div>

            <Link
              href={`/dashboard/events/${e.id}`}
              aria-label={`Open ${e.title}`}
              className="grid h-11 w-11 place-items-center rounded-full border border-hairline text-foreground/70 transition-all duration-500 hover:border-foreground hover:bg-foreground hover:text-background hover:rotate-[-6deg]"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
