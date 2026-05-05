"use client";

import { Container, Reveal, Section } from "./section";
import { PillButton } from "./primitives";
import Link from "next/link";

export default function CTA() {
  return (
    <Section className="relative overflow-hidden">
      <div
        aria-hidden
        className="halo pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2"
      />
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[36px] border border-hairline bg-foreground px-8 py-20 text-background md:px-16 md:py-28">
            <div className="grain absolute inset-0 opacity-60" />
            <div className="relative mx-auto max-w-3xl text-center">
              <h2 className="font-display text-4xl font-medium leading-[1.05] tracking-tight md:text-6xl">
                Ready to set the tone?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-background/70 md:text-lg">
                Join thousands of hosts who trust e-nvite to open every
                celebration with intention.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <PillButton
                  href="/login?signup=true"
                  className="bg-background text-foreground hover:bg-background/90"
                >
                  Start your first event
                </PillButton>
                <Link
                  href="#stories"
                  className="px-3 py-3 text-sm text-background/80 transition-colors hover:text-background"
                >
                  Read host stories →
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
