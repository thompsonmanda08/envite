"use client";

import { format } from "date-fns";
import { motion, useReducedMotion } from "framer-motion";
import { Asterisk, Calendar, MapPin } from "lucide-react";

import type { EventRecord, EventSession } from "@/types";

const ease = [0.22, 1, 0.36, 1] as const;

export default function PublicEvent({
  event,
  sessions,
}: {
  event: EventRecord;
  sessions: EventSession[];
}) {
  const reduce = useReducedMotion();

  const acceptingRsvp =
    event.requires_rsvp !== false &&
    event.status !== "cancelled" &&
    (!event.rsvp_deadline ||
      new Date(event.rsvp_deadline).getTime() > Date.now());

  return (
    <main className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="halo pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2 opacity-90"
      />
      <div
        aria-hidden
        className="halo-cool pointer-events-none absolute -bottom-32 right-[-160px] h-[420px] w-[520px] opacity-60"
      />

      <div className="relative mx-auto max-w-3xl px-6 py-24 md:py-32">
        <Ornament />

        <motion.header
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="text-center"
        >
          <p className="font-brand text-xs uppercase tracking-[0.42em] text-mute">
            <Asterisk size={11} className="mr-2 inline-block text-secondary" />
            You are invited
          </p>
          <h1 className="mt-6 font-display text-[clamp(2.75rem,8vw,5.5rem)] font-medium leading-[1.02] tracking-[-0.035em] text-foreground">
            <WordMask text={event.title} />
          </h1>
          {event.theme ? (
            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, ease, delay: 0.6 }}
              className="mt-4 font-display text-lg italic text-foreground/70 md:text-xl"
            >
              {event.theme}
            </motion.p>
          ) : null}
        </motion.header>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease, delay: 0.45 }}
          className="relative mx-auto mt-16 max-w-md"
        >
          <div
            aria-hidden
            className="absolute inset-0 -z-10 translate-x-3 translate-y-3 rounded-[160px] border border-hairline"
          />
          <div className="relative overflow-hidden rounded-[160px] border border-hairline bg-surface-2 shadow-[0_40px_100px_-40px_color-mix(in_oklch,var(--foreground)_45%,transparent)]">
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-[oklch(0.95_0.04_90)] via-[oklch(0.92_0.06_85)] to-[oklch(0.86_0.07_80)] dark:from-[oklch(0.28_0.03_248)] dark:via-[oklch(0.24_0.025_248)] dark:to-[oklch(0.2_0.02_248)]"
            />
            <div aria-hidden className="absolute inset-0 grain" />
            <div className="relative flex flex-col items-center px-10 py-14 text-center">
              <span className="font-brand text-xs uppercase tracking-[0.4em] text-foreground/55">
                Save the date
              </span>
              <span className="mt-6 font-display text-3xl font-medium leading-tight text-foreground">
                {format(new Date(event.start_date), "MMMM d, yyyy")}
              </span>
              <span className="mt-3 h-px w-12 bg-foreground/30" />
              <span className="mt-3 font-display text-base italic text-foreground/70">
                {format(new Date(event.start_date), "EEEE")}
              </span>
              {event.venue ? (
                <span className="mt-6 text-xs uppercase tracking-[0.3em] text-foreground/55">
                  {event.venue}
                </span>
              ) : null}
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
        </motion.div>

        {event.description ? (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mx-auto mt-16 max-w-2xl text-center text-base leading-relaxed text-foreground/85 md:text-lg"
          >
            {event.description}
          </motion.p>
        ) : null}

        <div className="mx-auto mt-14 grid max-w-xl gap-3">
          <Row
            icon={<Calendar size={14} />}
            label="Date"
            value={format(new Date(event.start_date), "EEEE, MMMM d, yyyy")}
            delay={0.05}
          />
          <Row
            icon={<MapPin size={14} />}
            label="Venue"
            value={event.venue ?? "—"}
            delay={0.1}
          />
          {event.dress_code ? (
            <Row
              icon={<span aria-hidden className="text-xs">✦</span>}
              label="Dress code"
              value={event.dress_code}
              delay={0.15}
            />
          ) : null}
        </div>

        {sessions.length > 0 ? (
          <section className="mt-24">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease }}
              className="text-center"
            >
              <p className="font-brand text-xs uppercase tracking-[0.42em] text-mute">
                The order of things
              </p>
              <h2 className="mt-3 font-display text-3xl font-medium tracking-tight md:text-4xl">
                Programme
              </h2>
              <span className="mx-auto mt-4 block h-px w-12 bg-hairline" />
            </motion.div>

            <ol className="mt-12 flex flex-col gap-4">
              {sessions.map((s, i) => (
                <motion.li
                  key={s.id}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, ease, delay: i * 0.06 }}
                  className="group relative overflow-hidden rounded-3xl border border-hairline bg-surface p-6 transition-all duration-500 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_24px_60px_-30px_color-mix(in_oklch,var(--foreground)_25%,transparent)]"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-brand text-xs uppercase tracking-[0.32em] text-mute">
                      #{String(s.session_order).padStart(2, "0")}
                    </span>
                    <span className="font-display text-xs italic text-foreground/55">
                      {format(new Date(s.session_date), "MMM d")}
                    </span>
                  </div>
                  <div className="mt-4 font-display text-xl font-medium leading-tight">
                    {s.session_name}
                  </div>
                  <div className="mt-2 text-xs text-mute">
                    {s.start_time}
                    {s.end_time ? `–${s.end_time}` : ""}
                    {s.venue ? ` · ${s.venue}` : ""}
                  </div>
                  {s.dress_code ? (
                    <div className="mt-3 inline-flex rounded-full border border-hairline px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70">
                      {s.dress_code}
                    </div>
                  ) : null}
                  {s.description ? (
                    <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                      {s.description}
                    </p>
                  ) : null}
                </motion.li>
              ))}
            </ol>
          </section>
        ) : null}

        <motion.section
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="mt-24"
        >
          <div className="rounded-3xl border border-hairline bg-surface/60 p-12 text-center">
            {event.status === "cancelled" ? (
              <p className="font-display text-2xl italic text-foreground/70">
                This event has been cancelled.
              </p>
            ) : !acceptingRsvp ? (
              <>
                <p className="font-display text-2xl italic text-foreground/70">
                  RSVP is closed.
                </p>
                {event.rsvp_deadline && (
                  <p className="font-brand mt-3 text-xs uppercase tracking-[0.32em] text-mute">
                    Deadline passed{" "}
                    {format(new Date(event.rsvp_deadline), "MMMM d, yyyy")}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="font-brand text-xs uppercase tracking-[0.42em] text-mute">
                  Kindly respond
                </p>
                <p className="font-display mt-4 text-2xl italic text-foreground/80">
                  Look out for your invitation by email, SMS, or WhatsApp.
                </p>
                <p className="mt-3 text-sm italic text-mute">
                  Replies are recorded once you receive your personal link.
                </p>
              </>
            )}
          </div>
        </motion.section>

        <Ornament className="mt-20" />
      </div>
    </main>
  );
}

function Ornament({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center gap-3 text-foreground/30 ${className}`}
    >
      <span className="h-px w-10 bg-current" />
      <span className="font-display text-base italic">e</span>
      <span className="text-xs">✦</span>
      <span className="font-display text-base italic">n</span>
      <span className="h-px w-10 bg-current" />
    </div>
  );
}

function WordMask({ text }: { text: string }) {
  const reduce = useReducedMotion();
  return (
    <span aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          aria-hidden
          className="mr-[0.25em] inline-block overflow-hidden align-baseline last:mr-0"
        >
          <motion.span
            initial={reduce ? false : { y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.85, ease, delay: 0.1 + i * 0.06 }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function Row({
  icon,
  label,
  value,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease, delay }}
      className="flex items-center justify-between rounded-2xl border border-hairline bg-surface px-5 py-4"
    >
      <div className="flex items-center gap-3 text-mute">
        {icon}
        <span className="font-brand text-xs uppercase tracking-[0.28em]">
          {label}
        </span>
      </div>
      <span className="font-display text-base">{value}</span>
    </motion.div>
  );
}
