"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

import { Container, Eyebrow, Reveal, Section } from "./section";
import { PillButton } from "./primitives";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 9,
    description: "Perfect for intimate gatherings.",
    features: [
      "Up to 50 invitations",
      "3 design templates",
      "Basic RSVP tracking",
      "Email delivery",
      "48-hour support",
    ],
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 29,
    description: "Ideal for larger celebrations.",
    features: [
      "Up to 200 invitations",
      "Unlimited templates",
      "Advanced RSVP management",
      "Email & SMS delivery",
      "Custom branding",
      "Priority support",
      "Analytics dashboard",
    ],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 79,
    description: "For grand celebrations.",
    features: [
      "Unlimited invitations",
      "Custom design consultation",
      "White-label solution",
      "All delivery channels",
      "Dedicated manager",
      "Custom integrations",
      "Advanced analytics",
    ],
    popular: false,
  },
];

export default function Pricing() {
  const [active, setActive] = useState("professional");

  return (
    <Section id="pricing">
      <Container>
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground md:text-5xl">
            One event. One price.
          </h2>
          <p className="mt-4 text-mute md:text-lg">
            No subscriptions. No surprises. Just exactly what your celebration
            needs.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PLANS.map((p, i) => {
            const isActive = active === p.id;

            return (
              <Reveal key={p.id} delay={i * 0.06}>
                <button
                  className={cn(
                    "group relative flex h-full w-full flex-col rounded-3xl border p-8 text-left transition-all duration-500",
                    isActive
                      ? "-translate-y-1 border-foreground/30 bg-surface shadow-[0_30px_70px_-30px_color-mix(in_oklch,var(--foreground)_30%,transparent)]"
                      : "border-hairline bg-surface/60 hover:bg-surface",
                  )}
                  type="button"
                  onClick={() => setActive(p.id)}
                  onFocus={() => setActive(p.id)}
                  onMouseEnter={() => setActive(p.id)}
                >
                  {p.popular && (
                    <span className="absolute right-6 top-6 rounded-full bg-foreground px-3 py-1 text-xs uppercase tracking-[0.18em] text-background">
                      Most loved
                    </span>
                  )}
                  <div>
                    <h3 className="font-display text-2xl font-medium tracking-tight text-foreground">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-sm text-mute">{p.description}</p>
                  </div>
                  <div className="mt-8 flex items-baseline gap-1">
                    <span className="font-display text-5xl font-medium tracking-tight text-foreground">
                      ${p.price}
                    </span>
                    <span className="text-sm text-mute">/event</span>
                  </div>
                  <ul className="mt-8 flex-1 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <span className="mt-0.5 grid h-4 w-4 flex-none place-items-center rounded-full bg-foreground/8">
                          <Check
                            className="text-foreground/70"
                            size={10}
                            strokeWidth={3}
                          />
                        </span>
                        <span className="text-foreground/80">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10">
                    <motion.div
                      animate={{ scale: isActive ? 1 : 0.98 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PillButton
                        className="w-full justify-center"
                        href="/login?signup=true"
                        icon={false}
                        variant={isActive ? "solid" : "outline"}
                      >
                        Choose {p.name}
                      </PillButton>
                    </motion.div>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
