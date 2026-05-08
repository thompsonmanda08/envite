export const dynamic = "force-dynamic";

import Link from "next/link";
import { Mail } from "lucide-react";

import { getInvitations } from "@/app/_actions/invitations";
import { getMyEvents } from "@/app/_actions/events";
import type { Invitation } from "@/types";

import { PageHeading } from "../_components/page-heading";

export default async function InvitationsIndexPage() {
  const eventsRes = await getMyEvents().catch(() => ({
    success: false,
    data: [] as any[],
  }));
  const events = (eventsRes.success ? eventsRes.data : []) ?? [];

  const perEvent = await Promise.all(
    events.map(async (e: any) => {
      const r = await getInvitations(e.id).catch(() => ({
        success: false,
        data: [] as Invitation[],
      }));
      return {
        event: e,
        invitations: (r.success ? r.data : []) ?? [],
      };
    }),
  );

  const total = perEvent.reduce((n, p) => n + p.invitations.length, 0);

  return (
    <div className="space-y-10">
      <PageHeading
        eyebrow="The Despatch"
        title="Invitations"
        subtitle="Every dispatch, every reminder — neatly accounted for."
      />

      {total === 0 ? (
        <div className="rounded-3xl border border-dashed border-hairline bg-surface/40 p-16 text-center">
          <p className="font-display text-2xl font-medium tracking-tight">
            Nothing has gone out yet.
          </p>
          <p className="mt-2 text-sm italic text-mute">
            Open an event to compose the first invitation.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline lg:grid-cols-2">
          {perEvent
            .filter((p) => p.invitations.length > 0)
            .flatMap((p) =>
              p.invitations.map((inv) => (
                <li key={inv.id} className="bg-background p-6">
                  <Link
                    href={`/dashboard/events/${p.event.id}/invitations`}
                    className="block"
                  >
                    <p className="font-brand text-xs uppercase tracking-[0.32em] text-mute">
                      {p.event.title}
                    </p>
                    <p className="font-display mt-3 flex items-center gap-2 text-2xl font-medium tracking-tight">
                      <Mail className="size-5 text-mute" />
                      {inv.invitation_type}
                    </p>
                    <p className="mt-2 text-xs italic text-mute">
                      {inv.sessions?.length ?? 0} session
                      {inv.sessions?.length === 1 ? "" : "s"}
                    </p>
                  </Link>
                </li>
              )),
            )}
        </ul>
      )}
    </div>
  );
}
