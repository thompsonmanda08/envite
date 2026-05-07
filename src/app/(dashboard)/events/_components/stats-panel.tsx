import type { EventStats } from "@/app/_actions/events";

export function StatsPanel({ stats }: { stats: EventStats }) {
  const total = Number(stats.total_guests ?? 0);
  const confirmed = Number(stats.confirmed ?? 0);
  const declined = Number(stats.declined ?? 0);
  const pending = Number(stats.pending ?? 0);
  const checkedIn = Number(stats.checked_in ?? 0);

  const responsePct =
    total > 0 ? Math.round(((confirmed + declined) / total) * 100) : 0;
  const checkInPct =
    confirmed > 0 ? Math.round((checkedIn / confirmed) * 100) : 0;

  return (
    <section className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="font-brand text-xs uppercase tracking-[0.42em] text-mute">
            The Tally
          </p>
          <h2 className="font-display mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            How the room is shaping up
          </h2>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <span className="font-brand text-xs uppercase tracking-[0.32em] text-mute">
            Response rate
          </span>
          <span className="font-display text-3xl font-semibold tabular-nums">
            {responsePct}%
          </span>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline lg:grid-cols-5">
        <Cell label="Invited" value={total} hint="on the list" />
        <Cell
          label="Confirmed"
          value={confirmed}
          hint={total ? `${pct(confirmed, total)}%` : "—"}
          tone="confirm"
        />
        <Cell
          label="Awaiting"
          value={pending}
          hint={total ? `${pct(pending, total)}%` : "—"}
        />
        <Cell
          label="Declined"
          value={declined}
          hint={total ? `${pct(declined, total)}%` : "—"}
          tone="decline"
        />
        <Cell
          label="Checked in"
          value={checkedIn}
          hint={confirmed ? `${checkInPct}% of going` : "—"}
        />
      </div>
    </section>
  );
}

function pct(n: number, total: number) {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}

function Cell({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  tone?: "confirm" | "decline";
}) {
  const toneClass =
    tone === "confirm"
      ? "text-foreground"
      : tone === "decline"
        ? "text-destructive"
        : "text-foreground";
  return (
    <article className="bg-background p-6">
      <p className="font-brand text-xs uppercase tracking-[0.32em] text-mute">
        {label}
      </p>
      <p
        className={`font-display mt-3 text-4xl font-semibold tabular-nums leading-none ${toneClass}`}
      >
        {value}
      </p>
      <p className="mt-2 text-xs italic text-mute">{hint}</p>
    </article>
  );
}
