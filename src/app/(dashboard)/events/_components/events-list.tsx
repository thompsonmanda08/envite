"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, MapPin, Search } from "lucide-react";

import type { EventRecord } from "@/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<string, string> = {
  draft: "border-hairline bg-surface text-mute",
  published: "border-foreground bg-foreground text-background",
  cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
};

function fmtDate(d?: string) {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return {
    day: date.toLocaleDateString("en-GB", { day: "2-digit" }),
    month: date.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
    year: date.toLocaleDateString("en-GB", { year: "numeric" }),
  };
}

export function EventsList({ events }: { events: EventRecord[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");

  const filtered = events.filter((e) => {
    if (status !== "all" && e.status !== status) return false;
    if (!q) return true;
    const hay = `${e.title} ${e.venue ?? ""} ${e.theme ?? ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-mute" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, venue, theme…"
            className="h-11 rounded-full border-hairline bg-surface/60 pl-11"
          />
        </div>
        <div
          role="tablist"
          className="flex items-center gap-1 rounded-full border border-hairline bg-surface/60 p-1"
        >
          {(["all", "draft", "published"] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={status === s}
              onClick={() => setStatus(s)}
              className={cn(
                "font-brand rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.32em] transition-all",
                status === s
                  ? "bg-foreground text-background"
                  : "text-mute hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-hairline bg-surface/40 p-16 text-center">
          <p className="font-display text-2xl font-medium tracking-tight">
            {events.length === 0
              ? "Your salon is quiet."
              : "No events match this filter."}
          </p>
          <p className="mt-2 text-sm italic text-mute">
            {events.length === 0
              ? "Compose your first event to begin."
              : "Try adjusting search or status."}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline lg:grid-cols-2">
          {filtered.map((e) => {
            const d = fmtDate(e.start_date);
            return (
              <li
                key={e.id}
                className="group relative bg-background p-7 transition-colors duration-500 hover:bg-surface"
              >
                <Link
                  href={`/dashboard/events/${e.id}`}
                  className="absolute inset-0"
                  aria-label={`Open ${e.title}`}
                />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-baseline gap-4">
                    {d && (
                      <div className="text-center">
                        <span className="font-display block text-4xl font-semibold leading-none tabular-nums tracking-tight">
                          {d.day}
                        </span>
                        <span className="font-brand mt-1 block text-[10px] uppercase tracking-[0.32em] text-mute">
                          {d.month} {d.year}
                        </span>
                      </div>
                    )}
                  </div>
                  <span
                    className={cn(
                      "font-brand rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.32em]",
                      STATUS_BADGE[e.status] ?? "border-hairline text-mute",
                    )}
                  >
                    {e.status}
                  </span>
                </div>
                <h3 className="font-display mt-5 text-3xl font-medium leading-tight tracking-tight">
                  {e.title}
                </h3>
                {e.theme && (
                  <p className="mt-1 text-sm italic text-mute">{e.theme}</p>
                )}
                {e.venue && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-mute">
                    <MapPin className="size-3.5" />
                    {e.venue}
                  </p>
                )}
                <div className="mt-6 flex items-center justify-between border-t border-hairline pt-5">
                  <span className="font-brand text-[10px] uppercase tracking-[0.32em] text-mute">
                    {e.requires_rsvp ? "RSVP required" : "No RSVP"}
                  </span>
                  <span className="relative z-10 grid h-9 w-9 place-items-center rounded-full border border-hairline text-foreground/70 transition-all duration-500 group-hover:rotate-[-6deg] group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
