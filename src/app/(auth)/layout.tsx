import type { ReactNode } from "react";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/base/logo";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden
        className="halo pointer-events-none absolute -top-40 left-[-10%] h-[520px] w-[760px] opacity-70"
      />
      <div
        aria-hidden
        className="halo-cool pointer-events-none absolute -bottom-32 right-[-10%] h-[420px] w-[520px] opacity-60"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
        {/* <Link
          href="/"
          className="inline-flex items-center gap-2 text-foreground"
        >
          <span
            aria-hidden
            className="relative grid h-8 w-8 place-items-center rounded-full bg-foreground text-background"
          >
            <span className="font-display text-base font-medium leading-none">
              e
            </span>
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-secondary" />
          </span>
          <span className="font-display text-xl font-medium tracking-tight">
            e-nvite
          </span>
        </Link> */}
        <div className="group inline-flex items-center gap-2">
          <Logo href="/" isIcon />
          <span className="font-display text-xl font-medium tracking-tight text-foreground">
            e-nvite
          </span>
        </div>
        <p className="hidden font-brand text-xs uppercase tracking-[0.32em] text-mute md:block">
          <Sparkles size={11} className="mr-2 inline-block text-secondary" />
          Welcome back
        </p>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 pb-16 sm:px-10 lg:grid-cols-[1fr_minmax(0,0.9fr)] lg:gap-20 lg:pb-24">
        <main className="flex min-h-[60vh] items-center justify-center py-8 lg:py-16">
          {children}
        </main>

        <aside className="hidden lg:flex lg:items-center lg:justify-center">
          <DecorativePanel />
        </aside>
      </div>
    </div>
  );
}

function DecorativePanel() {
  return (
    <div className="relative w-full max-w-md">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 translate-x-3 translate-y-3 rounded-[160px] border border-hairline"
      />
      <div className="relative aspect-[4/5] overflow-hidden rounded-[160px] border border-hairline bg-surface-2 shadow-[0_40px_100px_-40px_color-mix(in_oklch,var(--foreground)_45%,transparent)]">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-[oklch(0.95_0.04_90)] via-[oklch(0.92_0.06_85)] to-[oklch(0.86_0.07_80)] dark:from-[oklch(0.28_0.03_248)] dark:via-[oklch(0.24_0.025_248)] dark:to-[oklch(0.2_0.02_248)]"
        />
        <div aria-hidden className="absolute inset-0 grain" />
        <div className="relative flex h-full flex-col items-center justify-center px-12 text-center">
          <span className="font-brand text-xs uppercase tracking-[0.4em] text-foreground/60">
            Together with their families
          </span>
          <span className="mt-8 font-display text-3xl font-medium leading-tight text-foreground">
            Sarah <span className="italic text-foreground/70">&</span> Michael
          </span>
          <span className="mt-3 h-px w-12 bg-foreground/30" />
          <span className="mt-4 font-brand text-xs uppercase tracking-[0.32em] text-foreground/55">
            request the pleasure
          </span>
          <span className="mt-12 font-display text-base italic text-foreground/70">
            The Garden Pavilion
          </span>
          <span className="mt-1 font-brand text-xs uppercase tracking-[0.28em] text-foreground/50">
            Downtown · 06.15.26
          </span>
        </div>
        <div
          aria-hidden
          className="absolute left-1/2 top-6 h-2 w-2 -translate-x-1/2 rounded-full bg-foreground/30"
        />
        <div
          aria-hidden
          className="absolute bottom-6 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-foreground/30"
        />
      </div>
      <p className="mt-8 text-center font-display text-sm italic text-mute">
        &ldquo;Quietly tended to&rdquo; &mdash; every invitation we send.
      </p>
    </div>
  );
}
