"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PillButton({
  children,
  href,
  variant = "solid",
  className,
  icon = true,
  ...props
}: {
  children: ReactNode;
  href?: string;
  variant?: "solid" | "outline" | "ghost";
  className?: string;
  icon?: boolean;
} & Omit<ComponentProps<"button">, "ref">) {
  const base =
    "group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-tight transition-all duration-300 ease-out will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const variants = {
    solid:
      "bg-foreground text-background hover:bg-foreground/90 hover:-translate-y-0.5 shadow-[0_8px_24px_-12px_color-mix(in_oklch,var(--foreground)_50%,transparent)] hover:shadow-[0_14px_30px_-12px_color-mix(in_oklch,var(--foreground)_60%,transparent)]",
    outline:
      "border border-foreground/15 bg-surface/40 text-foreground backdrop-blur hover:border-foreground/40 hover:bg-surface",
    ghost: "text-foreground hover:bg-foreground/5",
  } as const;

  const content = (
    <>
      <span className="relative z-10">{children}</span>
      {icon && (
        <ArrowRight
          className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5"
          size={14}
        />
      )}
    </>
  );

  if (href) {
    return (
      <Link className={cn(base, variants[variant], className)} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {content}
    </button>
  );
}

export function Card({
  children,
  className,
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-hairline bg-surface p-6 transition-all duration-500",
        hover &&
          "hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_24px_60px_-30px_color-mix(in_oklch,var(--foreground)_30%,transparent)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface/60 px-3 py-1 text-xs font-medium text-mute backdrop-blur",
        className,
      )}
    >
      {children}
    </span>
  );
}
