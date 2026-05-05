"use client";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { StatusBadge } from "./status-badge";
import { useRouter } from "next/navigation";

interface TStatusBadge {
  status: string;
  type:
    | "document"
    | "action"
    | "execution"
    | "approval"
    | "compliance"
    | "role"
    | "health";
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  /**
   * Optional eyebrow tag rendered above the title.
   * Renders in tracked-out caps. Falls back to none.
   */
  eyebrow?: string;
  badges?: TStatusBadge[];
  onBackClick?: () => void;
  showBackButton?: boolean;
  /**
   * Optional slot for action buttons rendered to the right of the title block.
   * On mobile, stacks below the title.
   */
  actions?: React.ReactNode;
}

/**
 * Editorial page header — display-serif title, optional eyebrow, optional
 * actions slot on the right. Single source of truth for top-of-page chrome
 * across the app. Preserves the existing API (title/subtitle/description/
 * badges/back button) so no caller changes are required.
 */
export function PageHeader({
  title,
  subtitle,
  description,
  eyebrow,
  badges,
  onBackClick,
  showBackButton = false,
  actions,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <header
      data-tour="page-header"
      className="w-full mb-2 pb-3 border-b border-border"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          {showBackButton && (
            <Button
              onClick={() => {
                if (onBackClick !== undefined) {
                  onBackClick?.();
                } else {
                  router.back();
                }
              }}
              variant="outline"
              size="icon"
              className="shrink-0 mt-1 group"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            </Button>
          )}

          <div className="space-y-1.5 min-w-0">
            {eyebrow && (
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.18em]">
                {eyebrow}
              </p>
            )}
            <div className="flex flex-wrap items-end gap-2 md:gap-3">
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-[1.05] text-foreground capitalize">
                {title}
              </h1>
              {badges && badges.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-1">
                  {badges.map((badge, index) => (
                    <StatusBadge
                      key={index}
                      status={badge.status}
                      type={badge.type}
                    />
                  ))}
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                {subtitle}
              </p>
            )}
            {description && (
              <p className="text-muted-foreground text-sm leading-relaxed mt-1 max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="shrink-0 flex items-center gap-2 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
