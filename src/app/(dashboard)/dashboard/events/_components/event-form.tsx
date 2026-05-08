"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { EventRecord } from "@/types";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateEventMutation,
  useUpdateEventMutation,
} from "@/hooks/use-events-queries";
import { useEventTypesQuery } from "@/hooks/use-event-types-queries";
import { cn } from "@/lib/utils";

type Mode = "create" | "edit";

const bareSelectCls =
  "h-12 w-full appearance-none cursor-pointer rounded-none border-0 border-b border-hairline bg-transparent px-0 text-base outline-none focus-visible:border-foreground";

const textareaCls =
  "rounded-2xl border-hairline bg-surface/40 focus-visible:border-foreground focus-visible:ring-0";

function SectionHeading({
  numeral,
  label,
}: {
  numeral: string;
  label: string;
}) {
  return (
    <h2 className="font-brand border-b border-hairline pb-3 text-xs uppercase tracking-[0.42em] text-mute">
      {numeral} &middot; {label}
    </h2>
  );
}

export function EventForm({
  mode,
  initial,
}: {
  mode: Mode;
  initial?: EventRecord;
}) {
  const router = useRouter();
  const createM = useCreateEventMutation();
  const updateM = useUpdateEventMutation();
  const { data: eventTypes = [] } = useEventTypesQuery();
  const submitting = createM.isPending || updateM.isPending;

  const [form, setForm] = useState<Partial<EventRecord>>({
    event_type_id: initial?.event_type_id ?? "",
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    theme: initial?.theme ?? "",
    dress_code: initial?.dress_code ?? "",
    venue: initial?.venue ?? "",
    venue_address: initial?.venue_address ?? "",
    start_date: initial?.start_date?.slice(0, 16) ?? "",
    end_date: initial?.end_date?.slice(0, 16) ?? "",
    rsvp_deadline: initial?.rsvp_deadline?.slice(0, 16) ?? "",
    max_attendees: initial?.max_attendees,
    requires_rsvp: initial?.requires_rsvp ?? true,
    contact_email: initial?.contact_email ?? "",
    contact_phone: initial?.contact_phone ?? "",
    special_instructions: initial?.special_instructions ?? "",
    status: initial?.status ?? "draft",
  });

  function set<K extends keyof EventRecord>(k: K, v: EventRecord[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.start_date || !form.event_type_id) {
      toast.error("Event type, title, and start date are required.");
      return;
    }

    try {
      if (mode === "create") {
        const res = await createM.mutateAsync(form as any);
        if (!res.success) throw new Error(res.message);
        toast.success("Event composed.");
        router.push(`/dashboard/events/${(res.data as any)?.id ?? ""}`);
      } else if (initial?.id) {
        const res = await updateM.mutateAsync({ id: initial.id, data: form });
        if (!res.success) throw new Error(res.message);
        toast.success("Event refined.");
        router.push(`/dashboard/events/${initial.id}`);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-12">
      <section className="space-y-8">
        <SectionHeading numeral="I" label="The Particulars" />

        <Field label="Type of occasion" required htmlFor="event_type_id">
          <select
            id="event_type_id"
            value={form.event_type_id ?? ""}
            onChange={(e) => set("event_type_id", e.target.value)}
            className={bareSelectCls}
          >
            <option value="">Select a type…</option>
            {eventTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>

        <Input
          variant="bare"
          size="lg"
          label="Title"
          required
          id="title"
          name="title"
          value={form.title ?? ""}
          onChange={(e) => set("title", e.target.value)}
          placeholder="An Evening at the Conservatory"
          className={cn("font-display text-2xl md:text-3xl")}
        />

        <Field label="Description">
          <Textarea
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            placeholder="A few words on the occasion…"
            rows={3}
            className={textareaCls}
          />
        </Field>

        <div className="grid gap-8 md:grid-cols-2">
          <Input
            variant="bare"
            size="lg"
            label="Theme"
            id="theme"
            name="theme"
            value={form.theme ?? ""}
            onChange={(e) => set("theme", e.target.value)}
            placeholder="Garden romantic"
          />
          <Input
            variant="bare"
            size="lg"
            label="Dress code"
            id="dress_code"
            name="dress_code"
            value={form.dress_code ?? ""}
            onChange={(e) => set("dress_code", e.target.value)}
            placeholder="Black tie"
          />
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading numeral="II" label="The Hour" />
        <div className="grid gap-8 md:grid-cols-3">
          <Input
            variant="bare"
            size="lg"
            label="Start"
            required
            id="start_date"
            name="start_date"
            type="datetime-local"
            value={form.start_date ?? ""}
            onChange={(e) => set("start_date", e.target.value)}
          />
          <Input
            variant="bare"
            size="lg"
            label="End"
            id="end_date"
            name="end_date"
            type="datetime-local"
            value={form.end_date ?? ""}
            onChange={(e) => set("end_date", e.target.value)}
          />
          <Input
            variant="bare"
            size="lg"
            label="RSVP by"
            id="rsvp_deadline"
            name="rsvp_deadline"
            type="datetime-local"
            value={form.rsvp_deadline ?? ""}
            onChange={(e) => set("rsvp_deadline", e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading numeral="III" label="The Setting" />
        <div className="grid gap-8 md:grid-cols-2">
          <Input
            variant="bare"
            size="lg"
            label="Venue"
            id="venue"
            name="venue"
            value={form.venue ?? ""}
            onChange={(e) => set("venue", e.target.value)}
            placeholder="The Royal Hall"
          />
          <Input
            variant="bare"
            size="lg"
            label="Address"
            id="venue_address"
            name="venue_address"
            value={form.venue_address ?? ""}
            onChange={(e) => set("venue_address", e.target.value)}
            placeholder="12 Park Lane, City"
          />
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading numeral="IV" label="The Guests" />
        <div className="flex items-center justify-between rounded-2xl border border-hairline bg-surface/40 p-5">
          <div>
            <p className="font-display text-lg">Require an RSVP</p>
            <p className="text-sm italic text-mute">
              Guests will be asked to confirm their attendance.
            </p>
          </div>
          <Switch
            checked={!!form.requires_rsvp}
            onCheckedChange={(v) => set("requires_rsvp", v)}
          />
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <Input
            variant="bare"
            size="lg"
            label="Max attendees"
            id="max_attendees"
            name="max_attendees"
            type="number"
            min={0}
            value={form.max_attendees ?? ""}
            onChange={(e) =>
              set(
                "max_attendees",
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
          />
          <Input
            variant="bare"
            size="lg"
            label="Contact email"
            id="contact_email"
            name="contact_email"
            type="email"
            value={form.contact_email ?? ""}
            onChange={(e) => set("contact_email", e.target.value)}
          />
          <Input
            variant="bare"
            size="lg"
            label="Contact phone"
            id="contact_phone"
            name="contact_phone"
            type="tel"
            value={form.contact_phone ?? ""}
            onChange={(e) => set("contact_phone", e.target.value)}
          />
        </div>
        <Field label="Special instructions">
          <Textarea
            value={form.special_instructions ?? ""}
            onChange={(e) => set("special_instructions", e.target.value)}
            rows={3}
            className={textareaCls}
          />
        </Field>
      </section>

      <div className="flex flex-col-reverse items-stretch gap-3 border-t border-hairline pt-8 md:flex-row md:items-center md:justify-between">
        <p className="font-brand text-xs uppercase tracking-[0.42em] text-mute">
          Saved as <span className="text-foreground">{form.status}</span>
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            onClick={() => router.back()}
          >
            Discard
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            variant="solid"
            size="xl"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {mode === "create" ? "Compose" : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
