import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getEvent } from "@/app/_actions/events";
import { getInvitations } from "@/app/_actions/invitations";
import { InvitationsManager } from "./_components/invitations-manager";

export default async function EventInvitationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [eventRes, invRes] = await Promise.all([
    getEvent(id),
    getInvitations(id).catch(() => ({ success: false, data: [] as any[] })),
  ]);
  if (!eventRes.success || !eventRes.data) notFound();
  const event = eventRes.data;
  const invitations = (invRes.success ? invRes.data : []) ?? [];

  return (
    <div className="space-y-10">
      <Link
        href={`/dashboard/events/${id}`}
        className="font-brand inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.42em] text-mute hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        Back to {event.title}
      </Link>

      <header className="space-y-3">
        <p className="font-brand text-[11px] uppercase tracking-[0.42em] text-mute">
          Invitations &middot; {event.title}
        </p>
        <h1 className="font-display text-balance text-5xl font-medium tracking-tight md:text-6xl">
          Sent into <span className="italic">the world.</span>
        </h1>
      </header>

      <InvitationsManager eventId={id} initial={invitations} />
    </div>
  );
}
