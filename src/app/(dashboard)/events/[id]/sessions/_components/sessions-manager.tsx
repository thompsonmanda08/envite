"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Edit3,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import type { EventSession } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useCreateEventSessionMutation,
  useDeleteEventSessionMutation,
  useEventSessionsQuery,
  useUpdateEventSessionMutation,
} from "@/hooks/use-event-sessions-queries";

type Draft = {
  id?: string;
  session_name: string;
  session_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  venue_address: string;
  dress_code: string;
  max_attendees?: number;
  special_notes: string;
  session_order: number;
};

const blank = (order: number): Draft => ({
  session_name: "",
  session_date: "",
  start_time: "",
  end_time: "",
  venue: "",
  venue_address: "",
  dress_code: "",
  special_notes: "",
  session_order: order,
});

export function SessionsManager({
  eventId,
  initial,
}: {
  eventId: string;
  initial: EventSession[];
}) {
  const { data: sessions = [] } = useEventSessionsQuery(
    eventId,
    { sort_by: "session_order", sort_order: "asc" },
    initial,
  );
  const createM = useCreateEventSessionMutation(eventId);
  const updateM = useUpdateEventSessionMutation(eventId);
  const deleteM = useDeleteEventSessionMutation(eventId);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(blank(1));
  const submitting = createM.isPending || updateM.isPending;

  function startCreate() {
    setDraft(blank(sessions.length + 1));
    setOpen(true);
  }

  function startEdit(s: EventSession) {
    setDraft({
      id: s.id,
      session_name: s.session_name,
      session_date: s.session_date?.slice(0, 10) ?? "",
      start_time: s.start_time ?? "",
      end_time: s.end_time ?? "",
      venue: s.venue ?? "",
      venue_address: s.venue_address ?? "",
      dress_code: s.dress_code ?? "",
      max_attendees: s.max_attendees,
      special_notes: s.special_notes ?? "",
      session_order: s.session_order,
    });
    setOpen(true);
  }

  async function onSave() {
    if (!draft.session_name) {
      toast.error("Session name required.");
      return;
    }
    if (!draft.session_date) {
      toast.error("Session date required.");
      return;
    }
    if (!draft.start_time) {
      toast.error("Start time required.");
      return;
    }
    const payload = {
      session_name: draft.session_name,
      session_date: draft.session_date,
      start_time: draft.start_time,
      end_time: draft.end_time || undefined,
      venue: draft.venue || undefined,
      venue_address: draft.venue_address || undefined,
      dress_code: draft.dress_code || undefined,
      max_attendees: draft.max_attendees,
      special_notes: draft.special_notes || undefined,
      session_order: draft.session_order,
    };
    const res = draft.id
      ? await updateM.mutateAsync({ id: draft.id, data: payload })
      : await createM.mutateAsync(payload as any);
    if (res.success) {
      toast.success(draft.id ? "Session updated." : "Session added.");
      setOpen(false);
    } else toast.error(res.message);
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this session? Invitations referencing it must be re-saved."))
      return;
    const res = await deleteM.mutateAsync({ id });
    if (res.success) toast.success("Session removed.");
    else toast.error(res.message);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="font-brand text-xs uppercase tracking-[0.42em] text-mute">
          {sessions.length} session{sessions.length === 1 ? "" : "s"}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startCreate} className="rounded-full">
              <Plus className="size-4" />
              Add session
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl font-medium tracking-tight">
                {draft.id ? "Edit session" : "Add session"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Name" required full>
                <Input
                  value={draft.session_name}
                  onChange={(e) =>
                    setDraft({ ...draft, session_name: e.target.value })
                  }
                  placeholder="Ceremony / Reception / After-party"
                  className="h-11 rounded-full px-5"
                />
              </Field>

              <Field label="Date" required>
                <Input
                  type="date"
                  value={draft.session_date}
                  onChange={(e) =>
                    setDraft({ ...draft, session_date: e.target.value })
                  }
                  className="h-11 rounded-full px-5"
                />
              </Field>

              <Field label="Order">
                <Input
                  type="number"
                  min={1}
                  value={draft.session_order}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      session_order: Number(e.target.value) || 1,
                    })
                  }
                  className="h-11 rounded-full px-5"
                />
              </Field>

              <Field label="Start time" required>
                <Input
                  type="time"
                  value={draft.start_time}
                  onChange={(e) =>
                    setDraft({ ...draft, start_time: e.target.value })
                  }
                  className="h-11 rounded-full px-5"
                />
              </Field>

              <Field label="End time">
                <Input
                  type="time"
                  value={draft.end_time}
                  onChange={(e) =>
                    setDraft({ ...draft, end_time: e.target.value })
                  }
                  className="h-11 rounded-full px-5"
                />
              </Field>

              <Field label="Venue" full>
                <Input
                  value={draft.venue}
                  onChange={(e) => setDraft({ ...draft, venue: e.target.value })}
                  placeholder="Garden Pavilion"
                  className="h-11 rounded-full px-5"
                />
              </Field>

              <Field label="Address" full>
                <Input
                  value={draft.venue_address}
                  onChange={(e) =>
                    setDraft({ ...draft, venue_address: e.target.value })
                  }
                  className="h-11 rounded-full px-5"
                />
              </Field>

              <Field label="Dress code">
                <Input
                  value={draft.dress_code}
                  onChange={(e) =>
                    setDraft({ ...draft, dress_code: e.target.value })
                  }
                  className="h-11 rounded-full px-5"
                />
              </Field>

              <Field label="Max attendees">
                <Input
                  type="number"
                  min={0}
                  value={draft.max_attendees ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      max_attendees:
                        e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                  className="h-11 rounded-full px-5"
                />
              </Field>

              <Field label="Special notes" full>
                <Textarea
                  rows={3}
                  value={draft.special_notes}
                  onChange={(e) =>
                    setDraft({ ...draft, special_notes: e.target.value })
                  }
                  className="rounded-2xl border-hairline bg-surface/40 focus-visible:border-foreground focus-visible:ring-0"
                />
              </Field>
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
                {draft.id ? "Save" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-hairline bg-surface/40 p-16 text-center">
          <p className="font-display text-2xl font-medium tracking-tight">
            No sessions yet.
          </p>
          <p className="mt-2 text-sm italic text-mute">
            Compose the order of the day — ceremony, reception, anything else.
          </p>
        </div>
      ) : (
        <ol className="divide-y divide-hairline rounded-3xl border border-hairline bg-background">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-start gap-6 p-6">
              <div className="text-center">
                <span className="font-brand text-xs uppercase tracking-[0.32em] text-mute">
                  Part
                </span>
                <p className="font-display mt-1 text-3xl font-semibold tabular-nums leading-none">
                  {String(s.session_order).padStart(2, "0")}
                </p>
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <h3 className="font-display text-2xl font-medium leading-tight tracking-tight">
                  {s.session_name}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-mute">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {s.session_date
                      ? new Date(s.session_date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {s.start_time}
                    {s.end_time ? ` – ${s.end_time}` : ""}
                  </span>
                  {s.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {s.venue}
                    </span>
                  )}
                </div>
                {(s.dress_code || s.max_attendees) && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {s.dress_code && (
                      <span className="font-brand rounded-full border border-hairline px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70">
                        {s.dress_code}
                      </span>
                    )}
                    {s.max_attendees && (
                      <span className="font-brand rounded-full border border-hairline px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70">
                        capacity {s.max_attendees}
                      </span>
                    )}
                  </div>
                )}
                {s.special_notes && (
                  <p className="pt-2 text-sm italic text-mute">
                    {s.special_notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(s)}
                  aria-label="Edit session"
                  className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-mute hover:border-foreground hover:text-foreground"
                >
                  <Edit3 className="size-3.5" />
                </button>
                <button
                  onClick={() => onDelete(s.id)}
                  aria-label="Delete session"
                  className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-mute hover:border-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Field({
  label,
  required,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${full ? "md:col-span-2" : ""}`}>
      <label className="font-brand block text-xs uppercase tracking-[0.32em] text-mute">
        {label}
        {required && <span className="ml-1 text-foreground">*</span>}
      </label>
      {children}
    </div>
  );
}
