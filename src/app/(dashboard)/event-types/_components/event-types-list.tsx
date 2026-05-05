"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { EventType } from "@/types";
import {
  useCreateEventTypeMutation,
  useDeleteEventTypeMutation,
  useEventTypesQuery,
  useUpdateEventTypeMutation,
} from "@/hooks/use-event-types-queries";

type Draft = {
  id?: string;
  name: string;
  description: string;
  icon_url: string;
  price_per_invitation: number;
  max_free_invitations: number;
};

const EMPTY: Draft = {
  name: "",
  description: "",
  icon_url: "",
  price_per_invitation: 0,
  max_free_invitations: 0,
};

const inputCls =
  "rounded-lg border border-hairline bg-surface px-4 py-3 text-sm focus:border-foreground/40 focus:outline-none";

export default function EventTypesList({
  initialData,
}: {
  initialData: EventType[];
}) {
  const { data = initialData } = useEventTypesQuery(initialData);
  const create = useCreateEventTypeMutation();
  const update = useUpdateEventTypeMutation();
  const remove = useDeleteEventTypeMutation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const submitting = create.isPending || update.isPending;
  const isEdit = !!draft.id;

  useEffect(() => {
    if (!open) return;
    firstFieldRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function setNum<K extends "price_per_invitation" | "max_free_invitations">(
    k: K,
    v: string,
  ) {
    const n = v === "" ? 0 : Number(v);
    setDraft((d) => ({ ...d, [k]: Number.isFinite(n) ? n : 0 }));
  }

  function startCreate() {
    setDraft(EMPTY);
    setOpen(true);
  }

  function startEdit(t: EventType) {
    setDraft({
      id: t.id,
      name: t.name ?? "",
      description: t.description ?? "",
      icon_url: t.icon_url ?? "",
      price_per_invitation: t.price_per_invitation ?? 0,
      max_free_invitations: t.max_free_invitations ?? 0,
    });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { id: draftId, ...payload } = draft;
    const res = draftId
      ? await update.mutateAsync({ id: draftId, data: payload })
      : await create.mutateAsync(payload);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success(draftId ? "Template updated" : "Template created");
    setOpen(false);
    setDraft(EMPTY);
  }

  async function onDelete(t: EventType) {
    if (!confirm(`Delete "${t.name}"? This cannot be undone.`)) return;
    const res = await remove.mutateAsync(t.id);
    if (!res.success) toast.error(res.message);
    else toast.success("Template removed");
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
          onClick={startCreate}
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
              className="group relative rounded-2xl border border-hairline bg-surface p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="font-display text-xl font-medium">{t.name}</div>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => startEdit(t)}
                    aria-label="Edit"
                    className="grid h-8 w-8 place-items-center rounded-full border border-hairline text-mute hover:border-foreground hover:text-foreground"
                  >
                    <Edit size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(t)}
                    aria-label="Delete"
                    className="grid h-8 w-8 place-items-center rounded-full border border-hairline text-mute hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
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
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-lg rounded-3xl border border-hairline bg-background p-8"
          >
            <h2 id={titleId} className="font-display text-2xl font-medium">
              {isEdit ? "Edit template" : "New template"}
            </h2>
            <div className="mt-6 flex flex-col gap-4">
              <input
                ref={firstFieldRef}
                placeholder="Name"
                required
                value={draft.name}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, name: e.target.value }))
                }
                className={inputCls}
              />
              <textarea
                placeholder="Description"
                value={draft.description}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, description: e.target.value }))
                }
                rows={3}
                className={inputCls}
              />
              <input
                placeholder="Icon URL"
                type="url"
                value={draft.icon_url}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, icon_url: e.target.value }))
                }
                className={inputCls}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Price/invite"
                  value={draft.price_per_invitation}
                  onChange={(e) =>
                    setNum("price_per_invitation", e.target.value)
                  }
                  className={inputCls}
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Free invites"
                  value={draft.max_free_invitations}
                  onChange={(e) =>
                    setNum("max_free_invitations", e.target.value)
                  }
                  className={inputCls}
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
                disabled={submitting}
                className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background disabled:opacity-50"
              >
                {submitting
                  ? isEdit
                    ? "Saving…"
                    : "Creating…"
                  : isEdit
                    ? "Save"
                    : "Create"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
