"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Search, UserCheck } from "lucide-react";
import { toast } from "sonner";

import type { EventSession, Guest } from "@/types";
import { Input } from "@/components/ui/input";
import {
  useCheckInGuestMutation,
  useGuestsQuery,
} from "@/hooks/use-guests-queries";
import { cn } from "@/lib/utils";

export function CheckInScanner({
  eventId,
  sessions,
  guests: initial,
}: {
  eventId: string;
  sessions: EventSession[];
  guests: Guest[];
}) {
  const { data: guests = [] } = useGuestsQuery(eventId, initial);
  const checkInM = useCheckInGuestMutation(eventId);
  const [sessionId, setSessionId] = useState<string>(sessions[0]?.id ?? "");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q) return guests.slice(0, 50);
    const needle = q.toLowerCase();
    return guests
      .filter((g) =>
        `${g.name} ${g.email ?? ""} ${g.phone ?? ""}`
          .toLowerCase()
          .includes(needle),
      )
      .slice(0, 50);
  }, [guests, q]);

  const eligible = guests.filter((g) => g.rsvp_status === "confirmed");

  async function onCheckIn(g: Guest) {
    if (!sessionId) {
      toast.error("Pick a session first.");
      return;
    }
    const res = await checkInM.mutateAsync({
      id: g.id,
      session_id: sessionId,
    });
    if (res.success) {
      toast.success(`${g.name} checked in.`);
    } else toast.error(res.message);
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-hairline bg-surface/40 p-16 text-center">
        <p className="font-display text-2xl font-medium tracking-tight">
          Add a session first.
        </p>
        <p className="mt-2 text-sm italic text-mute">
          Check-in needs a session to attribute arrivals to.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="font-brand text-xs uppercase tracking-[0.42em] text-mute">
          Active session
        </p>
        <div className="flex flex-wrap gap-2">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setSessionId(s.id)}
              className={cn(
                "font-brand rounded-full border px-4 py-2 text-xs uppercase tracking-[0.24em] transition-all",
                sessionId === s.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-hairline text-mute hover:border-foreground/40 hover:text-foreground",
              )}
            >
              #{s.session_order} — {s.session_name}
            </button>
          ))}
        </div>
      </div>

      <Input
        variant="pill"
        size="lg"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name, email, or phone…"
        startContent={<Search className="size-4" />}
        classNames={{ input: "bg-surface/60" }}
      />

      <p className="font-brand text-xs uppercase tracking-[0.32em] text-mute">
        {eligible.length} confirmed guest{eligible.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-hairline bg-surface/40 p-16 text-center">
          <p className="font-display text-2xl italic text-foreground/70">
            No matches.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-hairline rounded-3xl border border-hairline bg-background">
          {filtered.map((g) => (
            <li
              key={g.id}
              className="flex items-center justify-between gap-4 p-5"
            >
              <div className="min-w-0">
                <p className="font-display truncate text-xl font-medium tracking-tight">
                  {g.name}
                </p>
                <p className="mt-1 text-xs text-mute">
                  {g.email ?? g.phone ?? "—"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {g.rsvp_status === "confirmed" ? (
                  <span className="font-brand flex items-center gap-1 rounded-full border border-hairline px-3 py-1 text-xs uppercase tracking-[0.24em] text-foreground/70">
                    <CheckCircle2 className="size-3" />
                    confirmed
                  </span>
                ) : (
                  <span className="font-brand rounded-full border border-hairline px-3 py-1 text-xs uppercase tracking-[0.24em] text-mute">
                    {g.rsvp_status ?? "pending"}
                  </span>
                )}
                <button
                  onClick={() => onCheckIn(g)}
                  disabled={checkInM.isPending}
                  className="font-brand inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-xs uppercase tracking-[0.24em] text-background hover:opacity-90 disabled:opacity-50"
                >
                  <UserCheck className="size-3.5" />
                  Check in
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
