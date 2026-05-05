import { notFound } from "next/navigation";

import { getEvent } from "@/app/_actions/events";
import { getEventSessions } from "@/app/_actions/event-sessions";

import PublicEvent from "./_components/public-event";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function PublicEventPage({ params }: Props) {
  const { id } = await params;
  const [evt, sessions] = await Promise.all([
    getEvent(id),
    getEventSessions(id, { sort_by: "session_order", sort_order: "asc" }),
  ]);
  if (!evt.success || !evt.data) notFound();
  return (
    <PublicEvent
      event={evt.data}
      sessions={sessions.success ? (sessions.data ?? []) : []}
    />
  );
}
