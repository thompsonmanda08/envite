export const dynamic = "force-dynamic";

import { BarChart3, Feather, Mail, Users } from "lucide-react";

import { getMyEvents } from "@/app/_actions/events";
import { PageHeading } from "../_components/page-heading";

type Stat = {
  label: string;
  value: string;
  hint: string;
  Icon: typeof BarChart3;
};

export default async function AnalyticsPage() {
  const res = await getMyEvents().catch(() => ({
    success: false,
    data: [] as any[],
  }));
  const events = (res.success ? res.data : []) ?? [];

  const total = events.length;
  const published = events.filter((e: any) => e?.status === "published").length;
  const upcoming = events.filter(
    (e: any) =>
      e?.start_date && new Date(e.start_date).getTime() >= Date.now(),
  ).length;
  const drafts = events.filter((e: any) => e?.status === "draft").length;

  const stats: Stat[] = [
    {
      label: "Events composed",
      value: String(total),
      hint: "Across all time",
      Icon: Feather,
    },
    {
      label: "Published",
      value: String(published),
      hint: "Visible to guests",
      Icon: Mail,
    },
    {
      label: "Forthcoming",
      value: String(upcoming),
      hint: "On the horizon",
      Icon: BarChart3,
    },
    {
      label: "In draft",
      value: String(drafts),
      hint: "Quietly composed",
      Icon: Users,
    },
  ];

  return (
    <div className="relative space-y-12">
      <div
        aria-hidden
        className="halo pointer-events-none absolute -top-24 right-0 h-[420px] w-[520px] opacity-60"
      />

      <PageHeading
        eyebrow="The Ledger"
        title="Analytics"
        subtitle="A quiet read of how your gatherings are unfolding."
      />

      <section className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, hint, Icon }) => (
          <div
            key={label}
            className="flex flex-col gap-3 bg-surface/60 p-6 backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <span className="font-brand text-[10px] uppercase tracking-[0.36em] text-mute">
                {label}
              </span>
              <Icon className="size-4 text-mute" strokeWidth={1.5} />
            </div>
            <div className="font-display text-5xl font-medium tracking-tight tabular-nums">
              {value}
            </div>
            <p className="text-xs italic text-mute">{hint}</p>
          </div>
        ))}
      </section>

      <div className="hairline" />

      <section className="rounded-2xl border border-hairline bg-surface/40 p-10 text-center backdrop-blur">
        <p className="font-brand text-[11px] uppercase tracking-[0.42em] text-mute">
          Soon
        </p>
        <h2 className="font-display mt-3 text-3xl font-medium tracking-tight md:text-4xl">
          Deeper readings, <span className="italic">in time.</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm italic text-mute">
          RSVP curves, invitation reach, and guest sentiment will rest here. We
          are composing them with care.
        </p>
      </section>
    </div>
  );
}
