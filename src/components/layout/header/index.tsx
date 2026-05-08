"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";

import { BellIcon, PanelLeftIcon, SearchIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";

import { ThemeSwitch } from "./theme-switch";
import { UserMenu } from "./user-menu";

const SECTION_TITLES: Record<string, string> = {
  dashboard: "Atelier",
  events: "Events",
  invitations: "Invitations",
  "event-types": "Event Types",
  analytics: "Ledger",
  settings: "Settings",
  guests: "Guests",
  sessions: "Sessions",
  "check-in": "Check In",
  new: "New",
  edit: "Refine",
};

function deriveCrumbs(pathname: string): string[] {
  const segs = pathname.split("/").filter(Boolean);
  const out: string[] = [];
  for (const s of segs) {
    if (/^[0-9a-f-]{8,}$/i.test(s)) continue;
    out.push(SECTION_TITLES[s] ?? s.replace(/-/g, " "));
  }
  return out;
}

export function SiteHeader({
  userMenu,
  leading,
  trailing,
}: {
  userMenu?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
}) {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname() ?? "";
  const crumbs = useMemo(() => deriveCrumbs(pathname), [pathname]);
  const current = crumbs[crumbs.length - 1] ?? "Atelier";
  const trail = crumbs.slice(0, -1);

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center bg-background/55 backdrop-blur-xl">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-hairline to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-foreground/[0.015] to-transparent"
      />

      <div className="relative flex w-full items-center gap-2 px-3 sm:px-5 lg:gap-3">
        <Button
          aria-label="Toggle sidebar"
          className="rounded-lg text-mute hover:text-foreground"
          onClick={toggleSidebar}
          size="icon"
          variant="ghost"
        >
          <PanelLeftIcon className="size-[18px]" strokeWidth={1.5} />
        </Button>

        <Separator
          className="mx-1 hidden data-[orientation=vertical]:h-5 sm:block"
          orientation="vertical"
        />

        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-baseline gap-2"
        >
          <span className="font-brand hidden text-[10px] uppercase tracking-[0.42em] text-mute/70 sm:inline">
            The Salon
          </span>
          <span aria-hidden className="hidden text-mute/40 sm:inline">
            ·
          </span>
          {trail.length > 0 && (
            <span className="font-brand hidden truncate text-[10px] uppercase tracking-[0.32em] text-mute md:inline">
              {trail.join(" / ")}
            </span>
          )}
          {trail.length > 0 && (
            <span aria-hidden className="hidden text-mute/40 md:inline">
              /
            </span>
          )}
          <span className="font-display truncate text-[15px] italic tracking-tight text-foreground">
            {current}
          </span>
        </nav>

        {leading}

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {trailing}

          <button
            aria-label="Search"
            className="group hidden h-9 items-center gap-2 rounded-full border border-hairline bg-foreground/[0.02] px-3 text-mute transition-colors hover:border-foreground/20 hover:bg-foreground/[0.04] hover:text-foreground md:inline-flex"
            type="button"
          >
            <SearchIcon className="size-3.5" strokeWidth={1.75} />
            <span className="text-[12px] tracking-[0.01em]">Search</span>
            <span
              aria-hidden
              className="ml-1 hidden items-center gap-0.5 text-[10px] text-mute/70 lg:inline-flex"
            >
              <kbd className="font-brand rounded border border-hairline bg-background/60 px-1 py-px text-[10px] tracking-[0.08em]">
                ⌘
              </kbd>
              <kbd className="font-brand rounded border border-hairline bg-background/60 px-1 py-px text-[10px] tracking-[0.08em]">
                K
              </kbd>
            </span>
          </button>

          <Button
            aria-label="Notifications"
            className="relative rounded-lg text-mute hover:text-foreground"
            size="icon"
            variant="ghost"
          >
            <BellIcon className="size-[18px]" strokeWidth={1.5} />
            <span
              aria-hidden
              className="absolute right-2 top-2 size-1.5 rounded-full bg-foreground"
            />
          </Button>

          <ThemeSwitch />

          <Separator
            className="mx-1 data-[orientation=vertical]:h-5 sm:mx-2"
            orientation="vertical"
          />

          {userMenu ?? <UserMenu />}
        </div>
      </div>
    </header>
  );
}
