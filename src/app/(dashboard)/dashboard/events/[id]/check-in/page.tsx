export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getEvent } from "@/app/_actions/events";
import { getEventSessions } from "@/app/_actions/event-sessions";
import { getGuests } from "@/app/_actions/guests";
import { CheckInScanner } from "./_components/check-in-scanner";

export default async function CheckInPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [eventRes, sessionsRes, guestsRes] = await Promise.all([
    getEvent(id),
    getEventSessions(id, {
      sort_by: "session_order",
      sort_order: "asc",
    }).catch(() => ({ success: false, data: [] as any[] })),
    getGuests(id).catch(() => ({ success: false, data: [] as any[] })),
  ]);
  if (!eventRes.success || !eventRes.data) notFound();
  const event = eventRes.data;
  const sessions = (sessionsRes.success ? sessionsRes.data : []) ?? [];
  const guests = (guestsRes.success ? guestsRes.data : []) ?? [];

  return (
    <div className="space-y-10">
      <Link
        href={`/dashboard/events/${id}`}
        className="font-brand inline-flex items-center gap-2 text-xs uppercase tracking-[0.42em] text-mute hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        Back to {event.title}
      </Link>

      <header className="space-y-3">
        <p className="font-brand text-xs uppercase tracking-[0.42em] text-mute">
          The Door &middot; {event.title}
        </p>
        <h1 className="font-display text-balance text-5xl font-medium tracking-tight md:text-6xl">
          Welcome them in.
        </h1>
        <p className="max-w-xl italic text-mute">
          Search guests by name to mark arrivals. Switch sessions when the
          programme moves between rooms.
        </p>
      </header>

      <CheckInScanner
        eventId={id}
        sessions={sessions}
        guests={guests}
      />
    </div>
  );
}
