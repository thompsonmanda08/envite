"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

interface EmptyStateClassNames {
  container?: string;
  iconBox?: string;
  title?: string;
  description?: string;
  actions?: string;
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  children?: React.ReactNode;
  /**
   * - `default`  — gradient hero card with blur blobs (full-page empty states)
   * - `compact`  — plain bordered card, smaller padding (panels / drawers)
   * - `inline`   — minimal, no card chrome (inside tables / lists)
   */
  variant?: "default" | "compact" | "inline";
  className?: string;
  iconClassName?: string;
  classNames?: EmptyStateClassNames;
}

function ActionButton({ action, defaultVariant, className }: {
  action: EmptyStateAction;
  defaultVariant: "default" | "outline";
  className?: string;
}) {
  const btn = (
    <Button
      variant={action.variant ?? defaultVariant}
      size={action.size}
      isLoading={action.isLoading}
      onClick={action.href ? undefined : action.onClick}
      className={className}
      asChild={!!action.href}
    >
      {action.href ? <Link href={action.href}>{action.label}</Link> : action.label}
    </Button>
  );
  return btn;
}

export default function EmptyState({
  title,
  description,
  icon,
  image,
  primaryAction,
  secondaryAction,
  children,
  variant = "default",
  className,
  iconClassName,
  classNames,
}: EmptyStateProps) {
  const hasActions = !!(primaryAction || secondaryAction);

  // ─── Inline ───────────────────────────────────────────────────────────────
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center px-2 py-4 text-center",
          className,
          classNames?.container,
        )}
        role="status"
        aria-label={title}
      >
        {image ? (
          <div className="mb-3 opacity-50">
            <Image src={image.src} alt={image.alt} width={image.width ?? 80} height={image.height ?? 80} />
          </div>
        ) : icon ? (
          <div className={cn("mb-3 text-muted-foreground [&_svg]:h-8 [&_svg]:w-8", iconClassName, classNames?.iconBox)}>
            {icon}
          </div>
        ) : null}

        <h3 className={cn("w-full font-semibold text-foreground line-clamp-2", classNames?.title)}>
          {title}
        </h3>

        {description && (
          <p className={cn("mt-1 max-w-lg text-xs text-muted-foreground", classNames?.description)}>
            {description}
          </p>
        )}

        {children && <div className="mt-3 w-full max-w-sm">{children}</div>}

        {hasActions && (
          <div className={cn("mt-4 flex flex-col gap-2 sm:flex-row", classNames?.actions)}>
            {primaryAction && <ActionButton action={primaryAction} defaultVariant="default" />}
            {secondaryAction && <ActionButton action={secondaryAction} defaultVariant="outline" />}
          </div>
        )}
      </div>
    );
  }

  // ─── Compact ──────────────────────────────────────────────────────────────
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-border bg-card px-4 py-8 sm:px-6 sm:py-10 text-center",
          className,
          classNames?.container,
        )}
        role="status"
        aria-label={title}
      >
        {image ? (
          <div className="mb-4 opacity-60">
            <Image src={image.src} alt={image.alt} width={image.width ?? 100} height={image.height ?? 100} />
          </div>
        ) : icon ? (
          <div className={cn(
            "mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 [&_svg]:h-6 [&_svg]:w-6 [&_svg]:text-primary",
            iconClassName,
            classNames?.iconBox,
          )}>
            {icon}
          </div>
        ) : null}

        <h3 className={cn("text-lg font-semibold text-foreground", classNames?.title)}>
          {title}
        </h3>

        {description && (
          <p className={cn("mt-2 max-w-md text-sm text-muted-foreground", classNames?.description)}>
            {description}
          </p>
        )}

        {children && <div className="mt-4 w-full max-w-md">{children}</div>}

        {hasActions && (
          <div className={cn("mt-6 flex flex-col gap-3 sm:flex-row", classNames?.actions)}>
            {primaryAction && <ActionButton action={primaryAction} defaultVariant="default" />}
            {secondaryAction && <ActionButton action={secondaryAction} defaultVariant="outline" />}
          </div>
        )}
      </div>
    );
  }

  // ─── Default (gradient hero) ──────────────────────────────────────────────
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/5 via-background to-primary/10 p-6 sm:p-10",
        className,
        classNames?.container,
      )}
      role="status"
      aria-label={title}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/6 blur-2xl" />

      <div className="relative mx-auto flex max-w-sm flex-col items-center text-center">
        {image ? (
          <div className="mb-5 opacity-70">
            <Image src={image.src} alt={image.alt} width={image.width ?? 120} height={image.height ?? 120} />
          </div>
        ) : icon ? (
          <div className={cn(
            "mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 shadow-lg shadow-primary/10 [&_svg]:h-8 [&_svg]:w-8 [&_svg]:text-primary",
            iconClassName,
            classNames?.iconBox,
          )}>
            {icon}
          </div>
        ) : null}

        <h3 className={cn("mb-2 text-2xl font-bold", classNames?.title)}>
          {title}
        </h3>

        {description && (
          <p className={cn(
            "text-sm leading-relaxed text-muted-foreground",
            hasActions || children ? "mb-7" : "mb-0",
            classNames?.description,
          )}>
            {description}
          </p>
        )}

        {children && <div className="mt-4 w-full max-w-md">{children}</div>}

        {hasActions && (
          <div className={cn(
            "flex flex-col gap-3 sm:flex-row",
            children ? "mt-4" : "",
            classNames?.actions,
          )}>
            {primaryAction && (
              <ActionButton action={primaryAction} defaultVariant="default" className="shadow-lg shadow-primary/20" />
            )}
            {secondaryAction && <ActionButton action={secondaryAction} defaultVariant="outline" />}
          </div>
        )}
      </div>
    </div>
  );
}
