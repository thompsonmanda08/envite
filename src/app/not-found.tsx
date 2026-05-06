import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for could not be found.",
};

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background">
      <div
        aria-hidden
        className="halo pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2"
      />
      <div
        aria-hidden
        className="halo-cool pointer-events-none absolute -bottom-32 right-[-120px] h-[420px] w-[520px]"
      />

      <header className="relative z-10 px-6 py-6 sm:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-xl font-medium tracking-tight text-foreground"
        >
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-background"
          >
            <span className="text-base font-medium leading-none">e</span>
          </span>
          e-nvite
        </Link>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="font-brand text-[11px] uppercase tracking-[0.42em] text-mute">
          A page astray
        </p>

        <h1 className="font-display mt-6 text-[clamp(5rem,18vw,11rem)] font-medium leading-none tracking-[-0.04em] text-foreground/15">
          404
        </h1>

        <h2 className="font-display mt-4 text-balance text-3xl font-medium tracking-tight md:text-5xl">
          That page is no longer <span className="italic">at home.</span>
        </h2>

        <p className="mt-5 max-w-md text-base italic text-mute">
          Either the address is mistaken, the moment has passed, or this page
          was never composed.
        </p>

        <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_color-mix(in_oklch,var(--foreground)_60%,transparent)]"
          >
            <Home size={14} />
            Return home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-hairline px-6 py-3 text-sm text-foreground/85 transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Open the atelier
          </Link>
        </div>

        <div className="mt-14 flex items-center gap-3 text-foreground/30">
          <span className="h-px w-10 bg-current" />
          <span className="font-display text-sm italic">e</span>
          <span className="text-[10px]">✦</span>
          <span className="font-display text-sm italic">n</span>
          <span className="h-px w-10 bg-current" />
        </div>
      </section>

      <footer className="relative z-10 px-6 py-6 text-center font-brand text-[10px] uppercase tracking-[0.32em] text-mute">
        © {new Date().getFullYear()} e-nvite — All rights reserved
      </footer>
    </main>
  );
}
