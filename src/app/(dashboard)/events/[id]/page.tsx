import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarRange,
  Mail,
  MapPin,
  Phone,
  Users,
} from "lucide-react";

import { getEvent } from "@/app/_actions/events";
import { Button } from "@/components/ui/button";
import { EventActions } from "../_components/event-actions";

function fmtLong(d?: string) {
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

function fmtTime(d?: string) {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_TONE: Record<string, string> = {
  draft: "border-hairline text-mute",
  published: "border-foreground bg-foreground text-background",
  cancelled: "border-destructive/30 text-destructive",
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getEvent(id);
  if (!res.success || !res.data) notFound();
  const event = res.data;

  const startDate = fmtLong(event.start_date);
  const startTime = fmtTime(event.start_date);
  const endTime = fmtTime(event.end_date);

  return (
    <div className="space-y-12">
      <Link
        href="/dashboard/events"
        className="font-brand inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.42em] text-mute hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        Back to the salon
      </Link>

      <header className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <span
              className={`font-brand rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.32em] ${
                STATUS_TONE[event.status] ?? "border-hairline text-mute"
              }`}
            >
              {event.status}
            </span>
            {event.theme && (
              <span className="font-brand text-[11px] uppercase tracking-[0.42em] text-mute">
                {event.theme}
              </span>
            )}
          </div>
          <h1 className="font-display text-balance text-5xl font-medium leading-[0.98] tracking-tight md:text-7xl">
            {event.title}
          </h1>
          {event.description && (
            <p className="max-w-2xl text-base italic text-mute md:text-lg">
              {event.description}
            </p>
          )}
        </div>
        <EventActions id={event.id} status={event.status} />
      </header>

      <div className="grid gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline lg:grid-cols-3">
        <article className="bg-background p-7">
          <p className="font-brand text-[11px] uppercase tracking-[0.32em] text-mute">
            When
          </p>
          <p className="font-display mt-4 text-2xl font-medium leading-tight tracking-tight">
            {startDate ?? "—"}
          </p>
          {(startTime || endTime) && (
            <p className="mt-2 flex items-center gap-2 text-sm text-mute">
              <CalendarRange className="size-3.5" />
              {startTime}
              {endTime ? ` – ${endTime}` : ""}
            </p>
          )}
          {event.rsvp_deadline && (
            <p className="mt-4 text-xs italic text-mute">
              RSVP by {fmtLong(event.rsvp_deadline)}
            </p>
          )}
        </article>

        <article className="bg-background p-7">
          <p className="font-brand text-[11px] uppercase tracking-[0.32em] text-mute">
            Where
          </p>
          {event.venue ? (
            <>
              <p className="font-display mt-4 text-2xl font-medium leading-tight tracking-tight">
                {event.venue}
              </p>
              {event.venue_address && (
                <p className="mt-2 flex items-start gap-2 text-sm text-mute">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" />
                  <span>{event.venue_address}</span>
                </p>
              )}
            </>
          ) : (
            <p className="mt-4 italic text-mute">Location yet to be decided.</p>
          )}
        </article>

        <article className="bg-background p-7">
          <p className="font-brand text-[11px] uppercase tracking-[0.32em] text-mute">
            Reach
          </p>
          {(event.contact_email || event.contact_phone) ? (
            <ul className="mt-4 space-y-2 text-sm">
              {event.contact_email && (
                <li className="flex items-center gap-2">
                  <Mail className="size-3.5 text-mute" />
                  <a
                    href={`mailto:${event.contact_email}`}
                    className="hover:underline"
                  >
                    {event.contact_email}
                  </a>
                </li>
              )}
              {event.contact_phone && (
                <li className="flex items-center gap-2">
                  <Phone className="size-3.5 text-mute" />
                  <span>{event.contact_phone}</span>
                </li>
              )}
            </ul>
          ) : (
            <p className="mt-4 italic text-mute">No contact set.</p>
          )}
          {event.max_attendees && (
            <p className="font-brand mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-mute">
              <Users className="size-3.5" />
              Capacity {event.max_attendees}
            </p>
          )}
        </article>
      </div>

      {(event.dress_code || event.special_instructions) && (
        <section className="rounded-3xl border border-hairline bg-surface/40 p-8">
          <h2 className="font-brand text-[11px] uppercase tracking-[0.42em] text-mute">
            Notes for guests
          </h2>
          {event.dress_code && (
            <div className="mt-4">
              <p className="font-display text-lg italic">Dress</p>
              <p className="text-sm text-mute">{event.dress_code}</p>
            </div>
          )}
          {event.special_instructions && (
            <div className="mt-4">
              <p className="font-display text-lg italic">Special instructions</p>
              <p className="text-sm text-mute">{event.special_instructions}</p>
            </div>
          )}
        </section>
      )}

      <nav className="flex flex-wrap gap-3 border-t border-hairline pt-8">
        <Button asChild variant="outline" className="rounded-full">
          <Link href={`/dashboard/events/${event.id}/guests`}>
            <Users className="size-4" />
            Manage guests
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={`/dashboard/events/${event.id}/invitations`}>
            <Mail className="size-4" />
            Invitations
          </Link>
        </Button>
        <Button asChild variant="ghost" className="rounded-full">
          <Link href={`/dashboard/events/${event.id}/edit`}>Edit details</Link>
        </Button>
      </nav>
    </div>
  );
}
