"use client";

import { Send, Upload, Users } from "lucide-react";

import { Container, Eyebrow, Reveal, Section } from "./section";

const STEPS = [
  {
    n: "01",
    icon: Upload,
    title: "Design or upload",
    body: "Start from a curated template, or bring your own artwork. Every detail stays editable.",
  },
  {
    n: "02",
    icon: Users,
    title: "Curate the guest list",
    body: "Import contacts from anywhere. Group, segment, and personalise messages with ease.",
  },
  {
    n: "03",
    icon: Send,
    title: "Send and track",
    body: "Deliver via email, SMS, or link. Watch RSVPs land in real-time, beautifully organised.",
  },
];

export default function HowItWorks() {
  return (
    <Section id="how-it-works">
      <Container>
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <Eyebrow>The flow</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Three steps. Zero friction.
          </h2>
          <p className="mt-4 text-mute md:text-lg">
            From first sketch to final RSVP, the process stays effortless.
          </p>
        </Reveal>

        <div className="relative grid gap-6 md:grid-cols-3">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-hairline to-transparent md:block"
          />
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="group relative h-full rounded-3xl border border-hairline bg-surface p-8 transition-all duration-500 hover:-translate-y-1 hover:border-foreground/25 hover:shadow-[0_30px_60px_-30px_color-mix(in_oklch,var(--foreground)_28%,transparent)]">
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-full border border-hairline bg-background text-foreground transition-transform duration-500 group-hover:rotate-[8deg]">
                    <s.icon size={18} />
                  </div>
                  <span className="font-display text-3xl text-foreground/15">
                    {s.n}
                  </span>
                </div>
                <h3 className="mt-8 font-display text-2xl font-medium tracking-tight text-foreground">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-mute">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
