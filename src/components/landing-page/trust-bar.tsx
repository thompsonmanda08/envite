"use client";

import { Container } from "./section";

const MARKS = [
  "Vogue Weddings",
  "Brides",
  "Martha Stewart",
  "The Knot",
  "Junebug",
  "Once Wed",
  "Style Me Pretty",
  "Magnolia Rouge",
];

export default function TrustBar() {
  return (
    <section className="border-y border-hairline bg-surface/40 py-10">
      <Container>
        <p className="mb-6 text-center text-xs uppercase tracking-[0.3em] text-mute">
          Trusted by 12,000+ hosts and planners
        </p>
        <div
          className="relative overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <div className="flex w-max animate-marquee gap-12">
            {[...MARKS, ...MARKS].map((m, i) => (
              <span
                key={i}
                className="font-display text-xl font-medium tracking-tight text-foreground/45 transition-colors hover:text-foreground/80"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
