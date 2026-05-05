"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Container, Eyebrow, Reveal, Section } from "./section";

type Design = {
  name: string;
  category: string;
  title: string;
  occasion: string;
  palette: string;
  ink: string;
  accent: string;
};

const DESIGNS: Design[] = [
  {
    name: "Elegant Florals",
    category: "Wedding",
    title: "Sarah & James",
    occasion: "Wedding Celebration",
    palette: "linear-gradient(140deg,#F5E9D6,#E2C58A)",
    ink: "#3a2a14",
    accent: "Floral",
  },
  {
    name: "Modern Minimalist",
    category: "Birthday",
    title: "Emma's 30th",
    occasion: "Birthday Party",
    palette: "linear-gradient(140deg,#0E1B2C,#1d2e44)",
    ink: "#F5F1E8",
    accent: "Minimal",
  },
  {
    name: "Vintage Charm",
    category: "Anniversary",
    title: "25 Years Together",
    occasion: "Anniversary",
    palette: "linear-gradient(140deg,#6b4226,#3e2415)",
    ink: "#F2E2C1",
    accent: "Vintage",
  },
  {
    name: "Contemporary",
    category: "Corporate",
    title: "Annual Gala",
    occasion: "Company Event",
    palette: "linear-gradient(140deg,#2a2a2a,#0a0a0a)",
    ink: "#E8E8E8",
    accent: "Editorial",
  },
  {
    name: "Rustic Romance",
    category: "Engagement",
    title: "We're Engaged",
    occasion: "Engagement Party",
    palette: "linear-gradient(140deg,#8a5a3b,#5a3621)",
    ink: "#F7E4CF",
    accent: "Rustic",
  },
  {
    name: "Garden Party",
    category: "Social",
    title: "Spring Brunch",
    occasion: "Social Gathering",
    palette: "linear-gradient(140deg,#5e7a4a,#37502a)",
    ink: "#EFF5DF",
    accent: "Botanical",
  },
];

export default function Showcase() {
  return (
    <Section id="designs" className="bg-surface/40">
      <Container>
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <Eyebrow>The collection</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Designs worth keeping.
          </h2>
          <p className="mt-4 text-mute md:text-lg">
            Hand-crafted templates from independent designers. Editable down to
            the last serif.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DESIGNS.map((d, i) => (
            <Reveal key={d.name} delay={i * 0.05}>
              <DesignCard d={d} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function DesignCard({ d }: { d: Design }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="group relative overflow-hidden rounded-3xl border border-hairline bg-surface"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]"
          style={{ background: d.palette }}
        />
        <div className="absolute inset-0 grain opacity-60" />
        <div
          className="absolute inset-6 rounded-[120px] border opacity-50"
          style={{ borderColor: d.ink }}
        />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
          style={{ color: d.ink }}
        >
          <span
            className="text-[10px] uppercase tracking-[0.35em] opacity-70"
            style={{ color: d.ink }}
          >
            {d.accent}
          </span>
          <span className="mt-4 font-display text-2xl font-medium leading-tight">
            {d.title}
          </span>
          <span
            className="mt-3 h-px w-10 opacity-50"
            style={{ background: d.ink }}
          />
          <span className="mt-3 text-[10px] uppercase tracking-[0.3em] opacity-65">
            {d.occasion}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-hairline px-5 py-4">
        <div>
          <div className="font-display text-base font-medium text-foreground">
            {d.name}
          </div>
          <div className="text-xs uppercase tracking-[0.18em] text-mute">
            {d.category}
          </div>
        </div>
        <ArrowUpRight
          size={16}
          className="text-foreground/50 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
        />
      </div>
    </motion.article>
  );
}
