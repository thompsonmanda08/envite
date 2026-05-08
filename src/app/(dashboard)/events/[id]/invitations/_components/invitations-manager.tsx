"use client";

import { useState } from "react";
import {
  Copy,
  Edit,
  Link as LinkIcon,
  Mail,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import type { EventSession, Invitation } from "@/types";
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
  useCreateInvitationMutation,
  useDeleteInvitationMutation,
  useInvitationsQuery,
  useSendInvitationMutation,
  useUpdateInvitationMutation,
} from "@/hooks/use-invitations-queries";
import { cn } from "@/lib/utils";

type DraftState = {
  id?: string;
  invitation_type: string;
  custom_image_url: string;
  sessions: string[];
};

const EMPTY: DraftState = {
  invitation_type: "",
  custom_image_url: "",
  sessions: [],
};

export function InvitationsManager({
  eventId,
  initial,
  sessions,
}: {
  eventId: string;
  initial: Invitation[];
  sessions: EventSession[];
}) {
  const { data: invitations = initial } = useInvitationsQuery(eventId, initial);
  const createM = useCreateInvitationMutation(eventId);
  const updateM = useUpdateInvitationMutation();
  const deleteM = useDeleteInvitationMutation();
  const sendM = useSendInvitationMutation();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DraftState>(EMPTY);

  const sessionMap = new Map(sessions.map((s) => [s.id, s]));

  function startCreate() {
    setDraft(EMPTY);
    setOpen(true);
  }

  function startEdit(inv: Invitation) {
    setDraft({
      id: inv.id,
      invitation_type: inv.invitation_type ?? "",
      custom_image_url: inv.custom_image_url ?? "",
      sessions: inv.sessions ?? [],
    });
    setOpen(true);
  }

  function toggleSession(id: string) {
    setDraft((d) => ({
      ...d,
      sessions: d.sessions.includes(id)
        ? d.sessions.filter((s) => s !== id)
        : [...d.sessions, id],
    }));
  }

  async function onSave() {
    if (!draft.invitation_type) {
      toast.error("Invitation type required.");
      return;
    }
    if (draft.sessions.length === 0) {
      toast.error("Select at least one session.");
      return;
    }
    const payload = {
      invitation_type: draft.invitation_type,
      custom_image_url: draft.custom_image_url || undefined,
      sessions: draft.sessions,
    };
    const res = draft.id
      ? await updateM.mutateAsync({ id: draft.id, data: payload })
      : await createM.mutateAsync(payload as any);
    if (res.success) {
      toast.success(draft.id ? "Invitation updated." : "Invitation created.");
      setOpen(false);
      setDraft(EMPTY);
    } else toast.error(res.message);
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this invitation?")) return;
    const res = await deleteM.mutateAsync(id);
    if (res.success) toast.success("Deleted.");
    else toast.error(res.message);
  }

  async function onCopy(url?: string) {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied.");
  }

  async function onSend(id: string) {
    if (
      !confirm(
        "Queue invitations for all unsent guests? Charges may apply per the event bill.",
      )
    )
      return;
    const res = await sendM.mutateAsync(id);
    if (res.success) {
      const data = res.data as { queued?: number; skipped?: number } | null;
      const q = data?.queued ?? 0;
      const s = data?.skipped ?? 0;
      toast.success(`${q} queued, ${s} skipped.`);
    } else {
      toast.error(res.message || "Could not queue invitations.");
    }
  }

  const submitting = createM.isPending || updateM.isPending;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="font-brand text-xs uppercase tracking-[0.42em] text-mute">
          {invitations.length} invitation{invitations.length === 1 ? "" : "s"}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startCreate} className="rounded-full">
              <Plus className="size-4" />
              New invitation
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl font-medium tracking-tight">
                {draft.id ? "Edit invitation" : "Compose invitation"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <p className="font-brand mb-3 text-xs uppercase tracking-[0.32em] text-mute">
                  Type
                </p>
                <Input
                  value={draft.invitation_type}
                  onChange={(e) =>
                    setDraft({ ...draft, invitation_type: e.target.value })
                  }
                  placeholder="All access pass, Reception only…"
                  variant="pill"
                />
              </div>

              <div>
                <p className="font-brand mb-3 text-xs uppercase tracking-[0.32em] text-mute">
                  Custom image URL (optional)
                </p>
                <Input
                  value={draft.custom_image_url}
                  onChange={(e) =>
                    setDraft({ ...draft, custom_image_url: e.target.value })
                  }
                  placeholder="https://…"
                  variant="pill"
                />
              </div>

              <div>
                <p className="font-brand mb-3 text-xs uppercase tracking-[0.32em] text-mute">
                  Sessions ({draft.sessions.length}/{sessions.length})
                </p>
                {sessions.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-hairline bg-surface/40 p-4 text-sm italic text-mute">
                    Add sessions to this event first.
                  </p>
                ) : (
                  <div className="max-h-56 space-y-1 overflow-y-auto rounded-2xl border border-hairline bg-surface/40 p-2">
                    {sessions.map((s) => (
                      <label
                        key={s.id}
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-background"
                      >
                        <input
                          type="checkbox"
                          checked={draft.sessions.includes(s.id)}
                          onChange={() => toggleSession(s.id)}
                          className="size-4 accent-foreground"
                        />
                        <span className="font-display flex-1 text-sm">
                          #{s.session_order} — {s.session_name}
                        </span>
                        <span className="text-xs text-mute">
                          {s.start_time}
                          {s.end_time ? ` – ${s.end_time}` : ""}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
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
                onClick={onSave}
                disabled={submitting}
                className="rounded-full"
              >
                {draft.id ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {invitations.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-hairline bg-surface/40 p-16 text-center">
          <p className="font-display text-2xl font-medium tracking-tight">
            No invitations composed yet.
          </p>
          <p className="mt-2 text-sm italic text-mute">
            Create the first to define what guests can access.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline lg:grid-cols-2">
          {invitations.map((inv) => (
            <li key={inv.id} className="bg-background p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-display flex items-center gap-2 text-2xl font-medium tracking-tight">
                    <Mail className="size-5 text-mute" />
                    {inv.invitation_type}
                  </p>
                  <p className="font-brand mt-2 text-xs uppercase tracking-[0.32em] text-mute">
                    {inv.sessions?.length ?? 0} session
                    {inv.sessions?.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onSend(inv.id)}
                    aria-label="Send invitations"
                    disabled={sendM.isPending}
                    className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-mute hover:border-foreground hover:bg-foreground hover:text-background disabled:opacity-50"
                  >
                    <Send className="size-3.5" />
                  </button>
                  <button
                    onClick={() => startEdit(inv)}
                    aria-label="Edit"
                    className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-mute hover:border-foreground hover:text-foreground"
                  >
                    <Edit className="size-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(inv.id)}
                    aria-label="Delete"
                    className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-mute hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {inv.sessions && inv.sessions.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {inv.sessions.map((sid) => {
                    const s = sessionMap.get(sid);
                    return (
                      <li
                        key={sid}
                        className={cn(
                          "font-brand rounded-full border px-3 py-1 text-xs uppercase tracking-[0.24em]",
                          s
                            ? "border-hairline text-foreground/70"
                            : "border-destructive/30 text-destructive",
                        )}
                      >
                        {s ? s.session_name : "missing"}
                      </li>
                    );
                  })}
                </ul>
              )}

              {inv.share_url && (
                <button
                  onClick={() => onCopy(inv.share_url)}
                  className="mt-4 flex w-full items-center gap-2 rounded-2xl border border-hairline bg-surface/40 px-4 py-2.5 text-left text-xs text-mute hover:bg-surface"
                >
                  <LinkIcon className="size-3 shrink-0" />
                  <span className="truncate">{inv.share_url}</span>
                  <Copy className="ml-auto size-3 shrink-0" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
