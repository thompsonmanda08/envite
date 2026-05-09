"use client";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import {
  submitPublicRsvp,
  type PublicRsvpStatus,
} from "@/app/_actions/public";

export default function RsvpForm({ token }: { token: string }) {
  const [status, setStatus] = useState<PublicRsvpStatus | null>(null);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function submit(next: PublicRsvpStatus) {
    setStatus(next);
    startTransition(async () => {
      const result = await submitPublicRsvp(token, {
        rsvp_status: next,
        guest_count: next === "confirmed" ? guestCount : undefined,
        note: note.trim() || undefined,
      });
      if (result.success) {
        setDone(true);
        toast.success("Reply received", {
          description:
            next === "confirmed"
              ? "Thank you — we'll see you there."
              : "Noted — your absence will be missed.",
        });
      } else {
        toast.error("Could not send your reply", {
          description: result.message ?? "Please try again in a moment.",
        });
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-hairline bg-surface/60 p-12 text-center">
        <p className="font-display text-2xl italic text-foreground/80">
          Reply received.
        </p>
        <p className="mt-3 text-sm italic text-mute">
          Refresh this page if you need to change it.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-hairline bg-surface/60 p-12">
      <p className="font-brand text-center text-xs uppercase tracking-[0.42em] text-mute">
        Kindly respond
      </p>
      <p className="font-display mt-4 text-center text-2xl italic text-foreground/80">
        Will you join us?
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => submit("confirmed")}
          className="rounded-full border border-foreground bg-foreground px-5 py-3 text-sm font-medium text-background transition disabled:opacity-50 hover:opacity-90"
        >
          {pending && status === "confirmed" ? "Sending…" : "Joyfully accept"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => submit("declined")}
          className="rounded-full border border-foreground/30 bg-transparent px-5 py-3 text-sm font-medium text-foreground transition disabled:opacity-50 hover:border-foreground"
        >
          {pending && status === "declined" ? "Sending…" : "Regretfully decline"}
        </button>
      </div>

      <div className="mt-8 grid gap-4">
        <label className="grid gap-2">
          <span className="font-brand text-xs uppercase tracking-[0.32em] text-mute">
            Number attending
          </span>
          <input
            type="number"
            min={1}
            max={10}
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value) || 1)}
            disabled={pending}
            className="rounded-2xl border border-hairline bg-background px-4 py-3 text-base"
          />
        </label>
        <label className="grid gap-2">
          <span className="font-brand text-xs uppercase tracking-[0.32em] text-mute">
            Note to host (optional)
          </span>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={pending}
            placeholder="A line or two…"
            className="rounded-2xl border border-hairline bg-background px-4 py-3 text-base"
          />
        </label>
      </div>
    </div>
  );
}
