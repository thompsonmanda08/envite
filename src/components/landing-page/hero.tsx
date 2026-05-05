"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, Calendar, MapPin, Sparkles } from "lucide-react";
import { Container } from "./section";
import { PillButton, Badge } from "./primitives";
import Link from "next/link";

const ease = [0.22, 1, 0.36, 1] as const;

export default function HeroSection() {
  const reduce = useReducedMotion();

  const headline = "Invitations,\ncrafted with intention.";
  const words = headline.split(" ");

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="halo pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2"
      />
      <div
        aria-hidden
        className="halo-cool pointer-events-none absolute -bottom-32 right-[-120px] h-[420px] w-[520px]"
      />

      <Container className="relative pb-20 pt-12 md:pb-28 md:pt-16 lg:pt-20">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-8 flex items-center justify-center"
        >
          <Badge>
            <Sparkles size={12} className="text-secondary" />
            Now with smart RSVP automation
          </Badge>
        </motion.div>

        <h1 className="font-display text-center text-[clamp(2.5rem,7vw,5.5rem)] font-medium leading-[1.02] tracking-[-0.035em] text-foreground">
          <span className="sr-only">{headline.replace(/\n/g, " ")}</span>
          <span aria-hidden className="block">
            {words.slice(0, 1).map((w, i) => (
              <Word key={i} delay={0.05 * i}>
                {w}
              </Word>
            ))}
          </span>
          <span aria-hidden className="block italic text-foreground/85">
            {words.slice(1).map((w, i) => (
              <Word key={i} delay={0.05 * (i + 1)}>
                {w.replace("\n", "")}
              </Word>
            ))}
          </span>
        </h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.45 }}
          className="mx-auto mt-8 max-w-xl text-center text-base leading-relaxed text-mute md:text-lg"
        >
          Design, send, and track digital invitations that feel as considered as
          the event itself. Built for hosts who care about the details.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.55 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <PillButton href="/login?signup=true" variant="solid">
            Start creating
          </PillButton>
          <Link
            href="#designs"
            className="group inline-flex items-center gap-2 px-3 py-3 text-sm text-foreground/80 transition-colors hover:text-foreground"
          >
            Explore designs
            <ArrowDownRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
            />
          </Link>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.7 }}
          className="relative mx-auto mt-20 max-w-4xl"
        >
          <InvitationFrame />
        </motion.div>
      </Container>
    </section>
  );
}

function Word({ children, delay }: { children: string; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <span className="inline-block overflow-hidden align-baseline">
      <motion.span
        initial={reduce ? false : { y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.85, ease, delay }}
        className="inline-block pr-[0.25em]"
      >
        {children}
      </motion.span>
    </span>
  );
}

function InvitationFrame() {
  return (
    <div className="relative grid grid-cols-12 items-center gap-4">
      <FloatingTag
        className="col-span-3 hidden md:block"
        side="left"
        title="June 15"
        subtitle="Saturday, 5pm"
        icon={<Calendar size={14} />}
      />

      <div className="col-span-12 md:col-span-6">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 translate-x-3 translate-y-3 rounded-[160px] border border-hairline"
          />
          <div className="relative h-full w-full overflow-hidden rounded-[160px] border border-hairline bg-surface-2 shadow-[0_40px_100px_-40px_color-mix(in_oklch,var(--foreground)_45%,transparent)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.95_0.04_90)] via-[oklch(0.92_0.06_85)] to-[oklch(0.86_0.07_80)] dark:from-[oklch(0.28_0.03_248)] dark:via-[oklch(0.24_0.025_248)] dark:to-[oklch(0.2_0.02_248)]" />
            <div className="absolute inset-0 grain" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
              <span className="font-brand text-xs uppercase tracking-[0.4em] text-foreground/60">
                Together with their families
              </span>
              <span className="mt-6 font-display text-3xl font-medium leading-tight text-foreground">
                Sarah <span className="italic text-foreground/70">&</span>{" "}
                Michael
              </span>
              <span className="mt-3 h-px w-12 bg-foreground/30" />
              <span className="mt-4 text-[11px] uppercase tracking-[0.3em] text-foreground/55">
                request the pleasure
              </span>
              <span className="mt-10 font-display text-base italic text-foreground/70">
                The Garden Pavilion
              </span>
              <span className="mt-1 text-[11px] uppercase tracking-[0.25em] text-foreground/50">
                Downtown · 06.15.26
              </span>
            </div>
            <div className="absolute left-1/2 top-6 h-2 w-2 -translate-x-1/2 rounded-full bg-foreground/30" />
            <div className="absolute bottom-6 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-foreground/30" />
          </div>
        </div>
      </div>

      <FloatingTag
        className="col-span-3 hidden md:block"
        side="right"
        title="142 going"
        subtitle="38 awaiting"
        icon={<MapPin size={14} />}
      />
    </div>
  );
}

function FloatingTag({
  title,
  subtitle,
  icon,
  side,
  className,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  side: "left" | "right";
  className?: string;
}) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay: side === "right" ? 1.5 : 0,
      }}
      className={`${className ?? ""} ${side === "right" ? "justify-self-start" : "justify-self-end"}`}
    >
      <div className="rounded-2xl border border-hairline bg-surface/85 px-4 py-3 backdrop-blur shadow-sm">
        <div className="flex items-center gap-2 text-mute">
          {icon}
          <span className="text-[10px] uppercase tracking-[0.18em]">
            {side === "left" ? "Save the date" : "RSVP"}
          </span>
        </div>
        <div className="mt-2 font-display text-lg font-medium text-foreground">
          {title}
        </div>
        <div className="text-xs text-mute">{subtitle}</div>
      </div>
    </motion.div>
  );
}
