"use client";

import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type SplitPanelLayoutProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  sidebarClasses?: string;
  className?: string;
  /** Extra classes applied to the right-hand content panel */
  contentClassName?: string;
  /**
   * When true, the sidebar becomes sticky below the top nav and scrolls
   * independently while the main content scrolls with the page.
   */
  stickyAside?: boolean;
  /**
   * Whether an item is currently selected. On screens below lg:
   *   - false → sidebar fills full width, main panel is hidden
   *   - true  → main panel is shown, sidebar is hidden
   * Has no effect on lg+ where both panels are always visible.
   * Mobile split is the default behaviour; pass `disableMobileSplit` to opt out.
   */
  hasSelection?: boolean;
  /** Called when the back button is pressed on mobile. Should clear the selection. */
  onBack?: () => void;
  /** Text displayed next to the back arrow (e.g. the selected item's name). */
  backLabel?: string;
  /** Set to true to always show both panels side-by-side at every breakpoint. */
  disableMobileSplit?: boolean;
};

export function SplitPanelLayout({
  sidebar,
  children,
  sidebarClasses = "w-80 lg:w-96",
  className,
  contentClassName,
  stickyAside = false,
  hasSelection,
  onBack,
  backLabel = "Back",
  disableMobileSplit = false,
}: SplitPanelLayoutProps) {
  const mobileSplit = !disableMobileSplit;

  return (
    <div
      className={cn(
        "w-full max-w-full",
        stickyAside
          ? "min-h-[65svh]"
          : "min-h-[65svh] h-full max-h-[calc(100svh-6rem)] overflow-clip",
        className,
      )}
    >
      <div
        className={cn(
          "flex gap-x-4 sm:gap-x-6 lg:w-full",
          stickyAside ? "items-start" : "h-full",
        )}
      >
        {/* Sidebar */}
        <aside
          className={cn(
            "shrink-0 flex-1 max-w-1/3",
            stickyAside
              ? "sticky top-14 self-start max-h-[calc(100svh-3.5rem)] overflow-y-auto"
              : "h-full overflow-y-auto",
            mobileSplit
              ? hasSelection
                ? // item selected → hide on mobile, show normally on lg+
                  cn("hidden lg:block ", sidebarClasses)
                : // no selection → sidebarClasses controls both breakpoints (caller passes responsive class)
                  cn("block", sidebarClasses)
              : // mobile split disabled → original behaviour
                cn("hidden md:block", sidebarClasses),
          )}
        >
          {sidebar}
        </aside>

        {/* Main panel */}
        <div
          className={cn(
            "flex-1 flex flex-col pr-4 w-full relative",
            stickyAside ? "min-h-0" : "min-h-full no-scroll overflow-y-auto",
            // hide on mobile when no selection (mobile split active)
            mobileSplit && !hasSelection && "hidden lg:flex",
            contentClassName,
          )}
        >
          {/* Back button — mobile only, shown when an item is selected */}
          {mobileSplit && hasSelection && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex lg:hidden items-center gap-1.5 text-sm font-medium text-primary mb-4 pb-3 border-b border-default-100 w-full"
            >
              <ChevronLeft className="h-4 w-4" />
              {backLabel}
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
