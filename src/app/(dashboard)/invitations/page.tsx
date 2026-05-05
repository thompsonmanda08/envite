import Link from "next/link";
import { Mail } from "lucide-react";

import { getInvitations } from "@/app/_actions/invitations";
import { getMyEvents } from "@/app/_actions/events";
import { PageHeading } from "../_components/page-heading";

export default async function InvitationsIndexPage() {
  const [invRes, eventsRes] = await Promise.all([
    getInvitations().catch(() => ({ success: false, data: [] as any[] })),
    getMyEvents().catch(() => ({ success: false, data: [] as any[] })),
  ]);
  const invitations = (invRes.success ? invRes.data : []) ?? [];
  const events = (eventsRes.success ? eventsRes.data : []) ?? [];
  const eventById = new Map(events.map((e: any) => [e.id, e]));

  return (
    <div className="space-y-10">
      <PageHeading
        eyebrow="The Despatch"
        title="Invitations"
        subtitle="Every dispatch, every reminder — neatly accounted for."
      />

      {invitations.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-hairline bg-surface/40 p-16 text-center">
          <p className="font-display text-2xl font-medium tracking-tight">
            Nothing has gone out yet.
          </p>
          <p className="mt-2 text-sm italic text-mute">
            Open an event to send the first round.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline lg:grid-cols-2">
          {invitations.map((inv: any) => {
            const event = eventById.get(inv.event_id) as any;
            return (
              <li key={inv.id} className="bg-background p-6">
                <Link
                  href={`/dashboard/events/${inv.event_id}/invitations`}
                  className="block"
                >
                  <p className="font-brand text-[10px] uppercase tracking-[0.32em] text-mute">
                    {event?.title ?? "Event"}
                  </p>
                  <p className="font-display mt-3 flex items-center gap-2 text-2xl font-medium tracking-tight">
                    <Mail className="size-5 text-mute" />
                    {inv.invitation_type}
                  </p>
                  <p className="mt-2 text-xs italic text-mute">
                    {inv.sessions?.length ?? 0} session(s)
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
