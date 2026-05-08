export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";

import { getMyEvents } from "@/app/_actions/events";
import { Button } from "@/components/ui/button";
import { EventsList } from "./_components/events-list";
import { PageHeading } from "../_components/page-heading";

export default async function EventsPage() {
  const res = await getMyEvents().catch(() => ({
    success: false,
    data: [] as any[],
  }));
  const events = (res.success ? res.data : []) ?? [];

  return (
    <div className="space-y-10">
      <PageHeading
        eyebrow="The Salon"
        title="Events"
        subtitle="Compose, refine, and oversee every gathering you host."
        action={
          <Button asChild className="rounded-full">
            <Link href="/dashboard/events/new">
              <Plus className="size-4" />
              New event
            </Link>
          </Button>
        }
      />
      <EventsList events={events} />
    </div>
  );
}
