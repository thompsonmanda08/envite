"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { EventSession, RsvpStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitPublicRsvp } from "@/app/_actions/public";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: RsvpStatus; label: string; copy: string }[] = [
  { value: "going", label: "Going", copy: "I'll be there" },
  { value: "maybe", label: "Maybe", copy: "Tentative" },
  { value: "declined", label: "Declined", copy: "Cannot attend" },
];

export function RsvpForm({
  eventId,
  sessions,
  maxPlusOnes = 4,
}: {
  eventId: string;
  sessions: EventSession[];
  maxPlusOnes?: number;
}) {
  const [isPending, start] = useTransition();
  const [done, setDone] = useState<RsvpStatus | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rsvp, setRsvp] = useState<RsvpStatus | null>(null);
  const [plusOnes, setPlusOnes] = useState(0);
  const [sessionId, setSessionId] = useState<string>("");
  const [message, setMessage] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rsvp) {
      toast.error("Please choose a response.");
      return;
    }
    if (!name || !email) {
      toast.error("Name and email required.");
      return;
    }
    start(async () => {
      const res = await submitPublicRsvp({
        event_id: eventId,
        name,
        email,
        phone: phone || undefined,
        rsvp,
        plus_ones: rsvp === "going" ? plusOnes : undefined,
        session_id: sessionId || undefined,
        message: message || undefined,
      });
      if (res.success) {
        setDone(rsvp);
        toast.success("Response received. Thank you.");
      } else {
        toast.error(res.message || "Could not submit. Please try again.");
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-hairline bg-surface/60 p-12 text-center">
        <CheckCircle2 className="mx-auto size-10 text-foreground/80" />
        <h3 className="font-display mt-6 text-3xl font-medium tracking-tight">
          {done === "going"
            ? "We look forward to your company."
            : done === "maybe"
              ? "Noted with a maybe."
              : "Sent with regrets."}
        </h3>
        <p className="mt-3 text-sm italic text-mute">
          A confirmation will arrive at <span className="not-italic">{email}</span>.
        </p>
        <button
          onClick={() => setDone(null)}
          className="font-brand mt-6 text-xs uppercase tracking-[0.32em] text-mute hover:text-foreground"
        >
          Amend response
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-8 rounded-3xl border border-hairline bg-surface/60 p-8 md:p-10"
    >
      <header className="text-center">
        <p className="font-brand text-xs uppercase tracking-[0.42em] text-mute">
          Kindly respond
        </p>
        <h2 className="font-display mt-3 text-3xl font-medium tracking-tight md:text-4xl">
          Will you join us?
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setRsvp(opt.value)}
            className={cn(
              "group flex flex-col items-center gap-1 rounded-2xl border px-5 py-6 transition-all",
              rsvp === opt.value
                ? "border-foreground bg-foreground text-background"
                : "border-hairline bg-background hover:border-foreground/40",
            )}
          >
            <span className="font-display text-2xl font-medium tracking-tight">
              {opt.label}
            </span>
            <span
              className={cn(
                "font-brand text-xs uppercase tracking-[0.32em]",
                rsvp === opt.value ? "text-background/70" : "text-mute",
              )}
            >
              {opt.copy}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Full name" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="h-12 rounded-none border-0 border-b border-hairline bg-transparent px-0 text-base focus-visible:border-foreground focus-visible:ring-0 placeholder:text-mute/60"
            required
          />
        </Field>
        <Field label="Email" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className="h-12 rounded-none border-0 border-b border-hairline bg-transparent px-0 text-base focus-visible:border-foreground focus-visible:ring-0 placeholder:text-mute/60"
            required
          />
        </Field>
        <Field label="Phone (optional)">
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 0100"
            className="h-12 rounded-none border-0 border-b border-hairline bg-transparent px-0 text-base focus-visible:border-foreground focus-visible:ring-0 placeholder:text-mute/60"
          />
        </Field>
        {rsvp === "going" && maxPlusOnes > 0 && (
          <Field label="Plus ones">
            <div className="flex items-center gap-1 pt-2">
              {Array.from({ length: maxPlusOnes + 1 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPlusOnes(i)}
                  className={cn(
                    "font-display h-11 w-11 rounded-full border tabular-nums transition-all",
                    plusOnes === i
                      ? "border-foreground bg-foreground text-background"
                      : "border-hairline text-mute hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </Field>
        )}
      </div>

      {sessions.length > 1 && (
        <Field label="Which session(s) will you attend?">
          <div className="grid gap-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-hairline bg-background px-4 py-3">
              <input
                type="radio"
                name="session"
                value=""
                checked={sessionId === ""}
                onChange={() => setSessionId("")}
                className="size-4 accent-foreground"
              />
              <span className="font-display text-base">All sessions</span>
            </label>
            {sessions.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-hairline bg-background px-4 py-3"
              >
                <input
                  type="radio"
                  name="session"
                  value={s.id}
                  checked={sessionId === s.id}
                  onChange={() => setSessionId(s.id)}
                  className="size-4 accent-foreground"
                />
                <span className="font-display text-base">{s.session_name}</span>
                <span className="ml-auto text-xs text-mute">
                  {s.start_time}
                </span>
              </label>
            ))}
          </div>
        </Field>
      )}

      <Field label="A note for the host (optional)">
        <Textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Dietary needs, well-wishes, anything you'd like us to know…"
          className="rounded-2xl border-hairline bg-background focus-visible:border-foreground focus-visible:ring-0"
        />
      </Field>

      <div className="flex flex-col items-stretch gap-3 border-t border-hairline pt-6 md:flex-row md:items-center md:justify-between">
        <p className="font-brand text-xs uppercase tracking-[0.42em] text-mute">
          Your response is private to the host
        </p>
        <Button
          type="submit"
          size="lg"
          className="rounded-full px-8"
          disabled={isPending}
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Send response
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="font-brand block text-xs uppercase tracking-[0.32em] text-mute">
        {label}
        {required && <span className="ml-1 text-foreground">*</span>}
      </label>
      {children}
    </div>
  );
}
