"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  useCreateEventTypeMutation,
  useEventTypesQuery,
} from "@/hooks/use-event-types-queries";
import type { EventType } from "@/types";

const EMPTY = {
  name: "",
  description: "",
  icon_url: "",
  price_per_invitation: 0,
  max_free_invitations: 0,
};

export default function EventTypesList({
  initialData,
}: {
  initialData: EventType[];
}) {
  const { data = initialData } = useEventTypesQuery(initialData);
  const create = useCreateEventTypeMutation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await create.mutateAsync(draft);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success("Template created");
    setOpen(false);
    setDraft(EMPTY);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">
            Event templates
          </h1>
          <p className="mt-1 text-sm text-mute">
            {data.length} {data.length === 1 ? "template" : "templates"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          <Plus size={14} /> New template
        </button>
      </header>

      {data.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-hairline bg-surface/40 p-16 text-center">
          <p className="font-display text-2xl">No templates yet</p>
          <p className="mt-2 text-sm text-mute">
            Templates define how invitations are priced and themed for a class
            of events (Wedding, Birthday, Corporate, etc.).
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((t) => (
            <li
              key={t.id}
              className="rounded-2xl border border-hairline bg-surface p-6"
            >
              <div className="font-display text-xl font-medium">{t.name}</div>
              {t.description ? (
                <p className="mt-2 line-clamp-3 text-sm text-mute">
                  {t.description}
                </p>
              ) : null}
              <div className="mt-4 flex items-center justify-between text-xs text-mute">
                <span>${t.price_per_invitation ?? 0}/invite</span>
                <span>{t.max_free_invitations ?? 0} free</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-hairline bg-background p-8"
          >
            <h2 className="font-display text-2xl font-medium">New template</h2>
            <div className="mt-6 flex flex-col gap-4">
              <input
                placeholder="Name"
                required
                value={draft.name}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, name: e.target.value }))
                }
                className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none"
              />
              <textarea
                placeholder="Description"
                value={draft.description}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, description: e.target.value }))
                }
                rows={3}
                className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none"
              />
              <input
                placeholder="Icon URL"
                value={draft.icon_url}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, icon_url: e.target.value }))
                }
                className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Price/invite"
                  value={draft.price_per_invitation}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      price_per_invitation: Number(e.target.value),
                    }))
                  }
                  className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none"
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Free invites"
                  value={draft.max_free_invitations}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      max_free_invitations: Number(e.target.value),
                    }))
                  }
                  className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-hairline px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={create.isPending}
                className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background disabled:opacity-50"
              >
                {create.isPending ? "Creating…" : "Create"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
