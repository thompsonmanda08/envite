"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import type { Guest, RsvpStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useAddGuestMutation,
  useDeleteGuestMutation,
  useGuestsQuery,
  useSetRsvpMutation,
} from "@/hooks/use-guests-queries";
import { cn } from "@/lib/utils";

const RSVP_TONE: Record<RsvpStatus, string> = {
  pending: "border-hairline text-mute",
  going: "border-foreground bg-foreground text-background",
  maybe: "border-secondary/60 text-secondary-foreground bg-secondary/40",
  declined: "border-destructive/30 text-destructive bg-destructive/10",
};

const RSVP_LABEL: Record<RsvpStatus, string> = {
  pending: "Awaiting",
  going: "Going",
  maybe: "Perhaps",
  declined: "Declined",
};

export function GuestsManager({
  eventId,
  initial,
}: {
  eventId: string;
  initial: Guest[];
}) {
  const { data: guests = [] } = useGuestsQuery(eventId, undefined, initial);
  const addM = useAddGuestMutation(eventId);
  const setRsvpM = useSetRsvpMutation(eventId);
  const deleteM = useDeleteGuestMutation(eventId);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [groupTag, setGroupTag] = useState("");

  const counts = guests.reduce(
    (acc, g) => {
      acc[g.rsvp] = (acc[g.rsvp] ?? 0) + 1;
      return acc;
    },
    { pending: 0, going: 0, maybe: 0, declined: 0 } as Record<
      RsvpStatus,
      number
    >,
  );

  async function onAdd() {
    if (!name) {
      toast.error("Name is required.");
      return;
    }
    const res = await addM.mutateAsync({
      name,
      email: email || undefined,
      phone: phone || undefined,
      group: groupTag || undefined,
    });
    if (res.success) {
      toast.success("Guest added.");
      setName("");
      setEmail("");
      setPhone("");
      setGroupTag("");
      setOpen(false);
    } else toast.error(res.message);
  }

  async function onDelete(guestId: string) {
    if (!confirm("Remove this guest?")) return;
    const res = await deleteM.mutateAsync(guestId);
    if (res.success) toast.success("Guest removed.");
    else toast.error(res.message);
  }

  async function onSetRsvp(guestId: string, status: RsvpStatus) {
    const res = await setRsvpM.mutateAsync({ id: guestId, rsvp: status });
    if (!res.success) toast.error(res.message);
  }

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline lg:grid-cols-5">
        <article className="bg-background p-6">
          <p className="font-brand text-xs uppercase tracking-[0.32em] text-mute">
            Total
          </p>
          <p className="font-display mt-3 text-4xl font-semibold tabular-nums leading-none">
            {guests.length}
          </p>
          <p className="font-brand mt-2 flex items-center gap-1 text-xs uppercase tracking-[0.32em] text-mute">
            <Users className="size-3" /> on the list
          </p>
        </article>
        {(Object.keys(counts) as RsvpStatus[]).map((s) => (
          <article key={s} className="bg-background p-6">
            <p className="font-brand text-xs uppercase tracking-[0.32em] text-mute">
              {RSVP_LABEL[s]}
            </p>
            <p className="font-display mt-3 text-4xl font-semibold tabular-nums leading-none">
              {counts[s]}
            </p>
            <p className="mt-2 text-xs italic text-mute">
              {guests.length === 0
                ? "—"
                : `${Math.round((counts[s] / guests.length) * 100)}%`}
            </p>
          </article>
        ))}
      </section>

      <div className="flex items-center justify-between">
        <p className="font-brand text-xs uppercase tracking-[0.42em] text-mute">
          The Guest Book
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <UserPlus className="size-4" />
              Add guest
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl font-medium tracking-tight">
                Add a guest
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-full px-5"
              />
              <Input
                type="email"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-full px-5"
              />
              <Input
                type="tel"
                placeholder="Phone (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-full px-5"
              />
              <Input
                placeholder="Group / table (optional)"
                value={groupTag}
                onChange={(e) => setGroupTag(e.target.value)}
                className="h-11 rounded-full px-5"
              />
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={onAdd}
                disabled={addM.isPending}
                className="rounded-full"
              >
                <Plus className="size-4" />
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {guests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-hairline bg-surface/40 p-16 text-center">
          <p className="font-display text-2xl font-medium tracking-tight">
            The book is empty.
          </p>
          <p className="mt-2 text-sm italic text-mute">
            Add the first guest to begin gathering responses.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-hairline rounded-3xl border border-hairline bg-background">
          {guests.map((g) => (
            <li
              key={g.id}
              className="grid grid-cols-1 gap-5 p-5 md:grid-cols-[1.4fr_1fr_auto] md:items-center"
            >
              <div className="min-w-0">
                <p className="font-display truncate text-xl font-medium tracking-tight">
                  {g.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-mute">
                  {g.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="size-3" /> {g.email}
                    </span>
                  )}
                  {g.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="size-3" /> {g.phone}
                    </span>
                  )}
                  {g.group && (
                    <span className="font-brand uppercase tracking-[0.24em]">
                      &middot; {g.group}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {(["pending", "going", "maybe", "declined"] as RsvpStatus[]).map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => onSetRsvp(g.id, s)}
                      className={cn(
                        "font-brand rounded-full border px-3 py-1 text-xs uppercase tracking-[0.24em] transition-all",
                        g.rsvp === s
                          ? RSVP_TONE[s]
                          : "border-hairline text-mute hover:border-foreground hover:text-foreground",
                      )}
                    >
                      {RSVP_LABEL[s]}
                    </button>
                  ),
                )}
              </div>
              <button
                onClick={() => onDelete(g.id)}
                aria-label="Remove guest"
                className="grid h-9 w-9 place-items-center justify-self-end rounded-full border border-hairline text-mute hover:border-destructive hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
