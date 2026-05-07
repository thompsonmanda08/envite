"use client";

import { RotateCw } from "lucide-react";

export function TryAgainButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_color-mix(in_oklch,var(--foreground)_60%,transparent)]"
    >
      <RotateCw className="size-4" />
      Try again
    </button>
  );
}
