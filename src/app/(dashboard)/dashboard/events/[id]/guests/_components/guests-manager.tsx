"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  Mail,
  Phone,
  Plus,
  Trash2,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import type { Guest, Invitation, InvitationMethod, RsvpStatus } from "@/types";
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
  useAddGuestsManualMutation,
  useDeleteGuestMutation,
  useGuestsQuery,
  useSetRsvpMutation,
  useUploadGuestsMutation,
} from "@/hooks/use-guests-queries";
import { cn } from "@/lib/utils";

const RSVP_TONE: Record<RsvpStatus, string> = {
  pending: "border-hairline text-mute",
  confirmed: "border-foreground bg-foreground text-background",
  declined: "border-destructive/30 text-destructive bg-destructive/10",
};

const RSVP_LABEL: Record<RsvpStatus, string> = {
  pending: "Awaiting",
  confirmed: "Confirmed",
  declined: "Declined",
};

const METHOD_LABEL: Record<InvitationMethod, string> = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

export function GuestsManager({
  eventId,
  initial,
  invitations,
}: {
  eventId: string;
  initial: Guest[];
  invitations: Invitation[];
}) {
  const { data: guests = [] } = useGuestsQuery(eventId, initial);
  const setRsvpM = useSetRsvpMutation(eventId);
  const deleteM = useDeleteGuestMutation(eventId);

  const [open, setOpen] = useState(false);
  const [invitationId, setInvitationId] = useState<string>(
    invitations[0]?.id ?? "",
  );
  const addM = useAddGuestsManualMutation(invitationId, eventId);
  const uploadM = useUploadGuestsMutation(invitationId, eventId);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [method, setMethod] = useState<InvitationMethod>("email");
  const [tab, setTab] = useState<"manual" | "upload">("manual");
  const [xlsxUrl, setXlsxUrl] = useState("");

  const counts = guests.reduce(
    (acc, g) => {
      const k = g.rsvp_status ?? "pending";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    },
    { pending: 0, confirmed: 0, declined: 0 } as Record<RsvpStatus, number>,
  );

  async function onAdd() {
    if (!invitationId) {
      toast.error("Create an invitation first.");
      return;
    }
    if (!name) {
      toast.error("Name is required.");
      return;
    }
    const res = await addM.mutateAsync([
      {
        name,
        email: email || undefined,
        mobile_number: mobile || undefined,
        invitation_method: method,
      },
    ]);
    if (res.success) {
      toast.success("Guest added.");
      setName("");
      setEmail("");
      setMobile("");
      setOpen(false);
    } else toast.error(res.message);
  }

  async function onUpload() {
    if (!invitationId) {
      toast.error("Create an invitation first.");
      return;
    }
    if (!xlsxUrl) {
      toast.error("Provide a hosted XLSX URL.");
      return;
    }
    const res = await uploadM.mutateAsync(xlsxUrl);
    if (res.success) {
      toast.success("Guests imported.");
      setXlsxUrl("");
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
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline lg:grid-cols-4">
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
            <Button
              className="rounded-full"
              disabled={invitations.length === 0}
            >
              <UserPlus className="size-4" />
              Add guest
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl font-medium tracking-tight">
                Add guests
              </DialogTitle>
            </DialogHeader>

            <div className="flex gap-1 rounded-full border border-hairline bg-surface/60 p-1">
              {(["manual", "upload"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "font-brand flex-1 rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.32em] transition-all",
                    tab === t
                      ? "bg-foreground text-background"
                      : "text-mute hover:text-foreground",
                  )}
                >
                  {t === "manual" ? "Manual" : "XLSX"}
                </button>
              ))}
            </div>

            <div>
              <p className="font-brand mb-2 text-xs uppercase tracking-[0.32em] text-mute">
                Invitation
              </p>
              <select
                value={invitationId}
                onChange={(e) => setInvitationId(e.target.value)}
                className="h-11 w-full cursor-pointer appearance-none rounded-full border border-hairline bg-background px-5 text-sm outline-none focus-visible:border-foreground/40"
              >
                {invitations.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invitation_type}
                  </option>
                ))}
              </select>
            </div>

            {tab === "manual" ? (
              <div className="space-y-4">
                <Input
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  variant="pill"
                />
                <Input
                  type="email"
                  placeholder="Email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="pill"
                />
                <Input
                  type="tel"
                  placeholder="Mobile number (optional)"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  variant="pill"
                />
                <div>
                  <p className="font-brand mb-2 text-xs uppercase tracking-[0.32em] text-mute">
                    Send via
                  </p>
                  <div className="flex gap-2">
                    {(["email", "sms", "whatsapp"] as InvitationMethod[]).map(
                      (m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMethod(m)}
                          className={cn(
                            "font-brand flex-1 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.24em] transition-all",
                            method === m
                              ? "border-foreground bg-foreground text-background"
                              : "border-hairline text-mute hover:border-foreground/40 hover:text-foreground",
                          )}
                        >
                          {METHOD_LABEL[m]}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-dashed border-hairline bg-surface/40 p-6 text-center">
                  <FileSpreadsheet className="mx-auto size-8 text-mute" />
                  <p className="mt-3 font-display text-base">
                    Bulk import from XLSX
                  </p>
                  <p className="mt-1 text-xs italic text-mute">
                    Provide a public URL to a hosted spreadsheet. Required
                    columns: name, email, mobile_number, invitation_method.
                  </p>
                </div>
                <Input
                  type="url"
                  placeholder="https://example.com/guests.xlsx"
                  value={xlsxUrl}
                  onChange={(e) => setXlsxUrl(e.target.value)}
                  variant="pill"
                />
              </div>
            )}

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              {tab === "manual" ? (
                <Button
                  onClick={onAdd}
                  disabled={addM.isPending}
                  className="rounded-full"
                >
                  <Plus className="size-4" />
                  Add
                </Button>
              ) : (
                <Button
                  onClick={onUpload}
                  disabled={uploadM.isPending}
                  className="rounded-full"
                >
                  <Upload className="size-4" />
                  Import
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {invitations.length === 0 && (
        <div className="rounded-3xl border border-dashed border-hairline bg-surface/40 p-6 text-center text-sm italic text-mute">
          Compose an invitation first — guests are tied to invitations.
        </div>
      )}

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
                  {g.invitation_method && (
                    <span className="font-brand uppercase tracking-[0.24em]">
                      &middot; via {METHOD_LABEL[g.invitation_method]}
                    </span>
                  )}
                  {g.invitation_sent === false && (
                    <span className="font-brand uppercase tracking-[0.24em] text-yellow-700">
                      &middot; unsent
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {(["pending", "confirmed", "declined"] as RsvpStatus[]).map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => onSetRsvp(g.id, s)}
                      className={cn(
                        "font-brand rounded-full border px-3 py-1 text-xs uppercase tracking-[0.24em] transition-all",
                        (g.rsvp_status ?? "pending") === s
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
