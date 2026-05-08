export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getEvent } from "@/app/_actions/events";
import { EventForm } from "../../_components/event-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getEvent(id);
  if (!res.success || !res.data) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <Link
        href={`/dashboard/events/${id}`}
        className="font-brand inline-flex items-center gap-2 text-xs uppercase tracking-[0.42em] text-mute hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        Back to event
      </Link>

      <header className="space-y-3">
        <p className="font-brand text-xs uppercase tracking-[0.42em] text-mute">
          Refining
        </p>
        <h1 className="font-display text-balance text-5xl font-medium tracking-tight md:text-6xl">
          {res.data.title}
        </h1>
      </header>

      <EventForm mode="edit" initial={res.data} />
    </div>
  );
}
