"use client";

import {
  BarChart3,
  Bell,
  Mail,
  PaintbrushVertical,
  Send,
  Users,
} from "lucide-react";

import { Container, Eyebrow, Reveal, Section } from "./section";

const FEATURES = [
  {
    icon: PaintbrushVertical,
    title: "Custom design upload",
    body: "Bring your own artwork or start from refined templates.",
  },
  {
    icon: Users,
    title: "Smart guest management",
    body: "Import, group, and segment your list in seconds.",
  },
  {
    icon: Bell,
    title: "Real-time RSVPs",
    body: "Live updates as guests respond, with thoughtful nudges.",
  },
  {
    icon: Send,
    title: "Multi-channel delivery",
    body: "Email, SMS, or shareable link. Wherever they are.",
  },
  {
    icon: Mail,
    title: "Automated reminders",
    body: "Quiet, well-timed follow-ups that keep attendance high.",
  },
  {
    icon: BarChart3,
    title: "Analytics dashboard",
    body: "Open rates, RSVPs, and engagement at a glance.",
  },
];

export default function Features() {
  return (
    <Section id="features">
      <Container>
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <Eyebrow>Everything you need</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Built for the details.
          </h2>
          <p className="mt-4 text-mute md:text-lg">
            A quietly powerful toolkit, considered down to the last animation.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <div className="group h-full bg-surface p-8 transition-colors duration-500 hover:bg-surface-2">
                <div className="grid h-11 w-11 place-items-center rounded-full border border-hairline bg-background text-foreground transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-105">
                  <f.icon size={18} />
                </div>
                <h3 className="mt-6 font-display text-xl font-medium tracking-tight text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">
                  {f.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
