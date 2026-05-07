import type { Metadata } from "next";
import Link from "next/link";
import { CloudOff, Home } from "lucide-react";

import { TryAgainButton } from "./try-again-button";

export const metadata: Metadata = {
  title: "You are offline",
  description: "No connection. We'll catch up when you're back.",
};

export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div
        aria-hidden
        className="halo pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2 opacity-60"
      />
      <div
        aria-hidden
        className="halo-cool pointer-events-none absolute -bottom-32 right-[-120px] h-[420px] w-[520px] opacity-40"
      />

      <section className="relative z-10 mx-auto w-full max-w-2xl text-center">
        <span className="inline-grid h-14 w-14 place-items-center rounded-full border border-hairline bg-surface/60 text-foreground/70">
          <CloudOff className="size-6" />
        </span>

        <p className="font-brand mt-8 text-xs uppercase tracking-[0.42em] text-mute">
          A pause in transmission
        </p>

        <h1 className="font-display mt-4 text-balance text-5xl font-medium leading-[1.02] tracking-tight md:text-6xl">
          You are <span className="italic">offline.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-md text-base italic text-mute">
          Some pages may not load until your connection returns. Anything you
          submit will quietly send itself the moment you are back.
        </p>

        <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
          <TryAgainButton />
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-hairline px-6 py-3 text-sm text-foreground/85 transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            <Home className="size-4" />
            Return home
          </Link>
        </div>

        <div className="mt-14 flex items-center justify-center gap-3 text-foreground/30">
          <span className="h-px w-10 bg-current" />
          <span className="font-display text-sm italic">e</span>
          <span className="text-xs">✦</span>
          <span className="font-display text-sm italic">n</span>
          <span className="h-px w-10 bg-current" />
        </div>
      </section>
    </main>
  );
}
