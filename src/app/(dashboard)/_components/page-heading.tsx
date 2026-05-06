import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
      <div className="space-y-3">
        {eyebrow && (
          <p className="font-brand text-xs uppercase tracking-[0.42em] text-mute">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-balance text-4xl font-medium tracking-tight md:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-xl text-base italic text-mute md:text-lg">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}
