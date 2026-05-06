"use client";

import Link from "next/link";
import { ArrowLeft, Home, RotateCw } from "lucide-react";
import type { PropsWithChildren } from "react";

function ErrorDisplay({
  status = 404,
  title = "Something went amiss",
  message = "The page you sought is unavailable. Try again or return to safer ground.",
  showBackButton = false,
  onRetry,
  children,
}: PropsWithChildren & {
  status?: number | string;
  title?: string;
  message?: string;
  showBackButton?: boolean;
  onRetry?: () => void;
}) {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div
        aria-hidden
        className="halo pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2"
      />
      <div
        aria-hidden
        className="halo-cool pointer-events-none absolute -bottom-32 right-[-120px] h-[420px] w-[520px]"
      />

      <section className="relative z-10 mx-auto w-full max-w-2xl text-center">
        <p className="font-brand text-[11px] uppercase tracking-[0.42em] text-mute">
          A misstep
        </p>

        <h1 className="font-display mt-6 text-[clamp(5rem,18vw,11rem)] font-medium leading-none tracking-[-0.04em] text-foreground/15">
          {status}
        </h1>

        <h2 className="font-display mt-4 text-balance text-3xl font-medium tracking-tight md:text-5xl">
          {title}
        </h2>

        <p className="mt-5 max-w-md mx-auto text-base italic text-mute">
          {message}
        </p>

        {children ? (
          <div className="mt-10">{children}</div>
        ) : (
          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_color-mix(in_oklch,var(--foreground)_60%,transparent)]"
              >
                <RotateCw size={14} />
                Try again
              </button>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_color-mix(in_oklch,var(--foreground)_60%,transparent)]"
              >
                <Home size={14} />
                Return home
              </Link>
            )}
            {showBackButton && (
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-hairline px-6 py-3 text-sm text-foreground/85 transition-colors hover:border-foreground/40 hover:text-foreground"
              >
                <ArrowLeft size={14} />
                Go back
              </button>
            )}
          </div>
        )}

        <div className="mt-14 flex items-center justify-center gap-3 text-foreground/30">
          <span className="h-px w-10 bg-current" />
          <span className="font-display text-sm italic">e</span>
          <span className="text-[10px]">✦</span>
          <span className="font-display text-sm italic">n</span>
          <span className="h-px w-10 bg-current" />
        </div>
      </section>
    </main>
  );
}

export default ErrorDisplay;
