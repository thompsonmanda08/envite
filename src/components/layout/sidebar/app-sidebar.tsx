"use client";

import type { ComponentType, SVGProps } from "react";
import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { dashboardNavGroups } from "./nav-config";

export type SidebarNavItem = {
  label: string;
  href: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  children?: SidebarNavItem[];
};

export type SidebarNavGroup = {
  label?: string;
  items: SidebarNavItem[];
};

export type SidebarUser = {
  name: string;
  role?: string;
  avatarUrl?: string;
};

export function AppSidebar({
  groups = dashboardNavGroups,
  user,
}: {
  groups?: SidebarNavGroup[];
  user?: SidebarUser;
}) {
  const pathname = usePathname() ?? "";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-hairline bg-surface/40 backdrop-blur-xl"
    >
      <SidebarHeader className="px-3 pt-4 pb-1">
        <SidebarUserHeader user={user} />
      </SidebarHeader>

      <div
        aria-hidden
        className="mx-4 my-2 h-px bg-gradient-to-r from-transparent via-hairline to-transparent group-data-[collapsible=icon]:mx-3"
      />

      <SidebarContent className="px-1.5">
        {groups.map((group, i) => (
          <SidebarGroup key={group.label ?? i} className="px-2 pt-3">
            {group.label && (
              <SidebarGroupLabel className="font-brand mb-1 px-1 text-[10px] font-normal uppercase tracking-[0.36em] text-mute/70 group-data-[collapsible=icon]:invisible">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.href} item={item} pathname={pathname} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SalonCard />
      </SidebarFooter>
    </Sidebar>
  );
}

function NavItem({
  item,
  pathname,
}: {
  item: SidebarNavItem;
  pathname: string;
}) {
  const { state } = useSidebar();
  const Icon = item.icon;
  const active =
    pathname === item.href || pathname.startsWith(item.href + "/");
  const hasChildren = !!item.children?.length;
  const collapsed = state === "collapsed";
  const [open, setOpen] = useState(active);

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={active}
          tooltip={item.label}
          className={cn(
            "group/nav h-9 rounded-xl px-2.5 font-medium text-foreground/65 transition-colors hover:bg-foreground/[0.04] hover:text-foreground",
            "data-[active=true]:bg-foreground data-[active=true]:text-background data-[active=true]:shadow-[0_10px_24px_-14px_color-mix(in_oklch,var(--foreground)_55%,transparent)] data-[active=true]:hover:bg-foreground data-[active=true]:hover:text-background",
            "[&>svg]:size-[18px] [&>svg]:stroke-[1.5] data-[active=true]:[&>svg]:stroke-[1.75]",
          )}
        >
          <Link
            href={item.href}
            onClick={(e) => {
              if (hasChildren && !collapsed) {
                e.preventDefault();
                setOpen((o) => !o);
              }
            }}
          >
            {Icon && <Icon />}
            <span className="truncate tracking-[0.005em]">{item.label}</span>
            {hasChildren && !collapsed && (
              <ChevronRight
                aria-hidden
                className={cn(
                  "ml-auto size-3.5 opacity-50 transition-transform duration-300",
                  open && "rotate-90 opacity-90",
                )}
              />
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {hasChildren && open && !collapsed && (
        <li className="relative ml-[22px] mt-0.5 mb-1 list-none pl-4">
          <span
            aria-hidden
            className="absolute left-0 top-0 bottom-3 w-px bg-hairline"
          />
          <ul className="flex flex-col gap-px">
            {item.children!.map((child) => {
              const cActive =
                pathname === child.href ||
                pathname.startsWith(child.href + "/");
              return (
                <li key={child.href} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-4 top-1/2 h-px w-3 bg-hairline"
                  />
                  <Link
                    href={child.href}
                    className={cn(
                      "block rounded-md px-3 py-1.5 text-[13px] tracking-[0.005em] transition-colors",
                      cActive
                        ? "bg-foreground/[0.06] font-medium text-foreground"
                        : "text-mute hover:text-foreground",
                    )}
                  >
                    {child.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </li>
      )}
    </>
  );
}

function SidebarUserHeader({ user }: { user?: SidebarUser }) {
  const initials = (user?.name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex items-center gap-3 rounded-2xl px-1 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
      <div className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-hairline bg-foreground/[0.04]">
        {user?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={user.name}
            className="size-full object-cover"
            src={user.avatarUrl}
          />
        ) : (
          <span className="font-display text-sm font-medium tracking-tight text-foreground">
            {initials || "·"}
          </span>
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-foreground/[0.05]"
        />
      </div>
      <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
        <span className="font-brand text-[9px] uppercase tracking-[0.36em] text-mute/70">
          {user?.role || "Curator"}
        </span>
        <span className="font-display mt-0.5 truncate text-[15px] font-medium tracking-tight text-foreground">
          {user?.name || "Welcome"}
        </span>
      </div>
    </div>
  );
}

function SalonCard() {
  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-hairline bg-foreground/[0.03] p-4 group-data-[collapsible=icon]:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-10 h-32 w-32 rounded-full bg-foreground/[0.05] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-foreground/[0.04] blur-2xl"
        />

        <div className="relative flex items-baseline gap-2 text-foreground">
          <span className="font-display text-[17px] italic leading-none">
            Let's
          </span>
          <span aria-hidden className="text-mute/70">
            ✦
          </span>
          <span className="font-display text-[17px] italic leading-none">
            begin.
          </span>
        </div>

        <p className="relative mt-2 text-[12px] leading-relaxed text-mute">
          A new invitation, quietly composed in a few moments.
        </p>

        <Button
          asChild
          className="relative mt-3.5 w-full rounded-full"
          size="sm"
          variant="solid"
        >
          <Link href="/dashboard/events/new">
            <Plus className="size-3.5" />
            Create event
          </Link>
        </Button>
      </div>

      <div className="hidden justify-center group-data-[collapsible=icon]:flex">
        <Button
          asChild
          aria-label="Create event"
          className="rounded-full"
          size="icon"
          variant="solid"
        >
          <Link href="/dashboard/events/new">
            <Plus className="size-4" />
          </Link>
        </Button>
      </div>
    </>
  );
}
