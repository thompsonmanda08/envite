"use client";

import type { ReactNode } from "react";

import { PanelLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";

import { ThemeSwitch } from "./theme-switch";
import { UserMenu } from "./user-menu";

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

  return (
    <header className="bg-background/60 sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b backdrop-blur-md py-2">
      <div className="flex w-full items-center gap-1 px-2 sm:px-4 lg:gap-2">
        <Button size="icon" variant="ghost" onClick={toggleSidebar}>
          <PanelLeftIcon />
        </Button>
        {leading}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {trailing}
          <ThemeSwitch />
          <Separator
            className="mx-1 sm:mx-2 data-[orientation=vertical]:h-4"
            orientation="vertical"
          />
          {userMenu ?? <UserMenu />}
        </div>
      </div>
    </header>
  );
}
