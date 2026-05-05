"use client";

import { useState } from "react";
import {
  Copy,
  Link as LinkIcon,
  Mail,
  RefreshCcw,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import type { Invitation } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useCancelInvitationMutation,
  useInvitationsQuery,
  useResendInvitationMutation,
  useSendInvitationsMutation,
} from "@/hooks/use-invitations-queries";
import { useGuestsQuery } from "@/hooks/use-guests-queries";
import { cn } from "@/lib/utils";

const CHANNEL_LABEL = { email: "Email", sms: "SMS", link: "Share link" };

export function InvitationsManager({
  eventId,
  initial,
}: {
  eventId: string;
  initial: Invitation[];
}) {
  const { data: invitations = initial } = useInvitationsQuery(eventId);
  const { data: guests = [] } = useGuestsQuery(eventId);
  const sendM = useSendInvitationsMutation();
  const resendM = useResendInvitationMutation();
  const cancelM = useCancelInvitationMutation();

  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<"email" | "sms" | "link">("email");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onSend() {
    if (selected.size === 0) {
      toast.error("Select at least one guest.");
      return;
    }
    const res = await sendM.mutateAsync({
      eventId,
      guestIds: Array.from(selected),
      channel,
      message: message || undefined,
    });
    if (res.success) {
      toast.success(`Sent ${selected.size} invitation(s).`);
      setSelected(new Set());
      setMessage("");
      setOpen(false);
    } else toast.error(res.message);
  }

  async function onResend(id: string) {
    const res = await resendM.mutateAsync(id);
    if (res.success) toast.success("Resent.");
    else toast.error(res.message);
  }

  async function onCancel(id: string) {
    if (!confirm("Cancel this invitation?")) return;
    const res = await cancelM.mutateAsync(id);
    if (res.success) toast.success("Invitation cancelled.");
    else toast.error(res.message);
  }

  async function onCopy(url?: string) {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied.");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="font-brand text-[11px] uppercase tracking-[0.42em] text-mute">
          {invitations.length} invitation
          {invitations.length === 1 ? "" : "s"} sent
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Send className="size-4" />
              Send invitations
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl font-medium tracking-tight">
                Send invitations
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <p className="font-brand mb-3 text-[11px] uppercase tracking-[0.32em] text-mute">
                  Channel
                </p>
                <div className="flex gap-2">
                  {(["email", "sms", "link"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setChannel(c)}
                      className={cn(
                        "font-brand rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.32em] transition-all",
                        channel === c
                          ? "border-foreground bg-foreground text-background"
                          : "border-hairline text-mute hover:text-foreground",
                      )}
                    >
                      {CHANNEL_LABEL[c]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-brand mb-3 text-[11px] uppercase tracking-[0.32em] text-mute">
                  Recipients ({selected.size}/{guests.length})
                </p>
                <div className="max-h-56 overflow-y-auto rounded-2xl border border-hairline bg-surface/40 p-2">
                  {guests.length === 0 ? (
                    <p className="p-4 text-sm italic text-mute">
                      Add guests first.
                    </p>
                  ) : (
                    guests.map((g) => (
                      <label
                        key={g.id}
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-background"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(g.id)}
                          onChange={() => toggle(g.id)}
                          className="size-4 accent-foreground"
                        />
                        <span className="flex-1 text-sm">{g.name}</span>
                        <span className="text-xs text-mute">{g.email}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="font-brand mb-3 text-[11px] uppercase tracking-[0.32em] text-mute">
                  Personal message (optional)
                </p>
                <Textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="A line or two of warmth…"
                  className="rounded-2xl border-hairline bg-surface/40 focus-visible:border-foreground focus-visible:ring-0"
                />
              </div>
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
                onClick={onSend}
                disabled={sendM.isPending}
                className="rounded-full"
              >
                <Send className="size-4" />
                Send {selected.size > 0 ? `(${selected.size})` : ""}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {invitations.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-hairline bg-surface/40 p-16 text-center">
          <p className="font-display text-2xl font-medium tracking-tight">
            No invitations yet.
          </p>
          <p className="mt-2 text-sm italic text-mute">
            Compose and send the first round when ready.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-hairline rounded-3xl border border-hairline bg-background">
          {invitations.map((inv) => (
            <li
              key={inv.id}
              className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[1fr_auto_auto] md:items-center"
            >
              <div className="min-w-0 space-y-1">
                <p className="font-display flex items-center gap-2 text-lg font-medium tracking-tight">
                  <Mail className="size-4 text-mute" />
                  {inv.invitation_type}
                </p>
                {inv.share_url && (
                  <button
                    onClick={() => onCopy(inv.share_url)}
                    className="flex items-center gap-1.5 text-xs text-mute hover:text-foreground"
                  >
                    <LinkIcon className="size-3" />
                    <span className="truncate">{inv.share_url}</span>
                    <Copy className="size-3" />
                  </button>
                )}
                <p className="font-brand text-[10px] uppercase tracking-[0.32em] text-mute">
                  {inv.sessions?.length ?? 0} session(s)
                </p>
              </div>
              <button
                onClick={() => onResend(inv.id)}
                aria-label="Resend"
                className="grid h-10 w-10 place-items-center rounded-full border border-hairline text-mute hover:border-foreground hover:text-foreground"
              >
                <RefreshCcw className="size-4" />
              </button>
              <button
                onClick={() => onCancel(inv.id)}
                aria-label="Cancel invitation"
                className="grid h-10 w-10 place-items-center rounded-full border border-hairline text-mute hover:border-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
