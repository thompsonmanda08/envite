import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { EventForm } from "../_components/event-form";

export const dynamic = "force-dynamic";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <Link
        href="/dashboard/events"
        className="font-brand inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.42em] text-mute hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        Back to the salon
      </Link>

      <header className="space-y-3">
        <p className="font-brand text-[11px] uppercase tracking-[0.42em] text-mute">
          Compose an event
        </p>
        <h1 className="font-display text-balance text-5xl font-medium tracking-tight md:text-6xl">
          A new gathering, <span className="italic">arranged.</span>
        </h1>
        <p className="max-w-xl italic text-mute">
          Begin with the essentials — refine the details as the occasion takes
          shape.
        </p>
      </header>

      <EventForm mode="create" />
    </div>
  );
}
