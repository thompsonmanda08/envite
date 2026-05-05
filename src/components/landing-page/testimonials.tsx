"use client";

import { Quote } from "lucide-react";
import { Container, Eyebrow, Reveal, Section } from "./section";

const STORIES = [
  {
    quote:
      "e-nvite made our wedding invitation process effortless. The design options were beautiful and our guests loved the digital experience.",
    author: "Maria Rodriguez",
    event: "Wedding · 150 guests",
  },
  {
    quote:
      "As an event planner, I need reliable tools. e-nvite delivers every time, with professional results and exceptional support.",
    author: "James Thompson",
    event: "Corporate Events",
  },
  {
    quote:
      "The RSVP tracking saved us so much time. We could see responses live and follow up with the right tone.",
    author: "Lisa Chen",
    event: "Birthday · 80 guests",
  },
];

export default function Testimonials() {
  return (
    <Section id="stories" className="bg-surface/40">
      <Container>
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <Eyebrow>In their words</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Quietly remarkable moments.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STORIES.map((s, i) => (
            <Reveal key={s.author} delay={i * 0.07}>
              <figure className="group relative flex h-full flex-col rounded-3xl border border-hairline bg-surface p-8 transition-all duration-500 hover:-translate-y-1 hover:border-foreground/25 hover:shadow-[0_24px_60px_-30px_color-mix(in_oklch,var(--foreground)_25%,transparent)]">
                <Quote
                  size={28}
                  className="text-foreground/15 transition-colors group-hover:text-foreground/30"
                />
                <blockquote className="mt-6 flex-1 font-display text-lg font-normal italic leading-snug text-foreground">
                  "{s.quote}"
                </blockquote>
                <figcaption className="mt-8 border-t border-hairline pt-5">
                  <div className="font-medium text-foreground">{s.author}</div>
                  <div className="text-xs uppercase tracking-[0.18em] text-mute">
                    {s.event}
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
