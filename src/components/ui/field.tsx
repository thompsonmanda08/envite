import * as React from "react";

import { cn } from "@/lib/utils";

export type FieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  full?: boolean;
  children: React.ReactNode;
};

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  className,
  full,
  children,
}: FieldProps) {
  return (
    <div
      className={cn("flex flex-col gap-2", full && "md:col-span-2", className)}
    >
      {label && (
        <label
          htmlFor={htmlFor}
          className={cn(
            "font-brand text-xs uppercase tracking-[0.32em] text-mute",
            error && "text-destructive",
          )}
        >
          {label}
          {required && <span className="ml-1 text-foreground">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs italic text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs italic text-mute">{hint}</p>
      ) : null}
    </div>
  );
}
