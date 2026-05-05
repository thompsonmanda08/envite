"use client";

import { format } from "date-fns";
import { Calendar, MapPin } from "lucide-react";

import type { EventRecord, EventSession } from "@/types";

export default function PublicEvent({
  event,
  sessions,
}: {
  event: EventRecord;
  sessions: EventSession[];
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <header className="text-center">
        <p className="font-brand text-[11px] uppercase tracking-[0.32em] text-mute">
          You are invited
        </p>
        <h1 className="mt-4 font-display text-5xl font-medium leading-tight tracking-tight md:text-6xl">
          {event.title}
        </h1>
        {event.theme ? (
          <p className="mt-2 font-display text-lg italic text-foreground/70">
            {event.theme}
          </p>
        ) : null}
      </header>

      {event.description ? (
        <p className="mx-auto mt-10 max-w-2xl text-center text-base leading-relaxed text-foreground/85">
          {event.description}
        </p>
      ) : null}

      <div className="mx-auto mt-12 grid max-w-xl gap-3">
        <Row
          icon={<Calendar size={14} />}
          label="Date"
          value={format(new Date(event.start_date), "EEEE, MMMM d, yyyy")}
        />
        <Row
          icon={<MapPin size={14} />}
          label="Venue"
          value={event.venue ?? "—"}
        />
        {event.dress_code ? (
          <Row
            icon={<span aria-hidden>—</span>}
            label="Dress code"
            value={event.dress_code}
          />
        ) : null}
      </div>

      {sessions.length > 0 ? (
        <section className="mt-16">
          <h2 className="text-center font-display text-2xl font-medium">
            Programme
          </h2>
          <ol className="mt-6 flex flex-col gap-4">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="rounded-2xl border border-hairline bg-surface p-5"
              >
                <div className="font-brand text-[10px] uppercase tracking-[0.28em] text-mute">
                  #{s.session_order}
                </div>
                <div className="mt-1 font-display text-lg font-medium">
                  {s.session_name}
                </div>
                <div className="mt-1 text-xs text-mute">
                  {format(new Date(s.session_date), "MMM d")} ·{" "}
                  {s.start_time}
                  {s.end_time ? `–${s.end_time}` : ""}
                  {s.venue ? ` · ${s.venue}` : ""}
                </div>
                {s.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                    {s.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="mt-16 text-center">
        <p className="text-sm text-mute">
          RSVP form will appear here once the guest endpoints are live.
        </p>
      </section>
    </main>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-hairline bg-surface px-5 py-4">
      <div className="flex items-center gap-3 text-mute">
        {icon}
        <span className="font-brand text-[10px] uppercase tracking-[0.28em]">
          {label}
        </span>
      </div>
      <span className="font-display text-base">{value}</span>
    </div>
  );
}
