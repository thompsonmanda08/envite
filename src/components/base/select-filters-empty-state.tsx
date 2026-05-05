"use client";

import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface FilterStep {
  label: string;
  hint: string;
}

interface SelectFiltersEmptyStateProps {
  /** Big icon at top of card. Receives className for sizing/colour. */
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  description: string;
  /** Three or four short steps the user must complete (e.g. SELECT YEAR · TERM · GRADE). */
  steps: FilterStep[];
  /** Optional action button or any node rendered below the steps. */
  action?: React.ReactNode;
  className?: string;
}

export function SelectFiltersEmptyState({
  icon,
  title,
  description,
  steps,
  action,
  className,
}: SelectFiltersEmptyStateProps) {
  const sizedIcon = React.cloneElement(icon, {
    className: cn("text-primary h-16 w-16", icon.props.className),
  });

  return (
    <Card
      className={cn(
        "bg-background/50 border-2 border-dashed border-border",
        className,
      )}
    >
      <CardContent className="flex flex-col items-center justify-center px-8 py-10">
        <div className="relative mb-4">
          <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
          <div className="bg-background border-primary/20 relative rounded-2xl border-2 p-6">
            {sizedIcon}
          </div>
        </div>

        <h3 className="text-foreground mb-2 text-2xl font-semibold tracking-tight">
          {title}
        </h3>
        <p className="text-muted-foreground mb-8 max-w-md text-center text-sm">
          {description}
        </p>

        {steps.length > 0 && (
          <div
            className={cn(
              "mb-2 grid w-full max-w-2xl gap-3 text-xs",
              steps.length === 2 && "grid-cols-2",
              steps.length === 3 && "grid-cols-1 sm:grid-cols-3",
              steps.length === 4 && "grid-cols-2 sm:grid-cols-4",
            )}
          >
            {steps.map((step) => (
              <div
                key={step.label}
                className="bg-background border-border rounded-lg border p-4 text-center"
              >
                <div className="text-primary mb-1 font-mono uppercase tracking-wider">
                  {step.label}
                </div>
                <div className="text-muted-foreground">{step.hint}</div>
              </div>
            ))}
          </div>
        )}

        {action && <div className="mt-6">{action}</div>}
      </CardContent>
    </Card>
  );
}

export default SelectFiltersEmptyState;
