type Stat = {
  label: string;
  value: number;
  hint: string;
};

export function StatsRow({
  total,
  upcoming,
  drafts,
  published,
}: {
  total: number;
  upcoming: number;
  drafts: number;
  published: number;
}) {
  const stats: Stat[] = [
    { label: "In the calendar", value: total, hint: "events composed to date" },
    { label: "Forthcoming", value: upcoming, hint: "yet to be celebrated" },
    { label: "In draft", value: drafts, hint: "awaiting your final word" },
    { label: "Published", value: published, hint: "out in the world" },
  ];

  return (
    <section
      aria-label="Overview"
      className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline lg:grid-cols-4"
    >
      {stats.map((s) => (
        <article
          key={s.label}
          className="group bg-background p-7 transition-colors duration-500 hover:bg-surface"
        >
          <p className="font-brand text-xs uppercase tracking-[0.32em] text-mute">
            {s.label}
          </p>
          <p className="font-display mt-5 text-5xl font-semibold tabular-nums leading-none tracking-tight">
            {s.value}
          </p>
          <p className="mt-3 text-xs italic text-mute">{s.hint}</p>
        </article>
      ))}
    </section>
  );
}
