import {
  BarChart3Icon,
  CalendarIcon,
  HomeIcon,
  MailIcon,
  SettingsIcon,
  SparklesIcon,
} from "lucide-react";
import React, { PropsWithChildren } from "react";

// TRIGRR

import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardLayout as DashboardShell } from "@/components/layout/dashboard-layout";
import { SiteHeader } from "@/components/layout/header";
import { UserMenuLoader } from "@/components/layout/header/user-menu-loader";
import {
  AppSidebar,
  type SidebarNavGroup,
} from "@/components/layout/sidebar/app-sidebar";

const navGroups: SidebarNavGroup[] = [
  {
    label: "Workspace",
    items: [
      { label: "Atelier", href: "/dashboard", icon: HomeIcon },
      { label: "Events", href: "/dashboard/events", icon: CalendarIcon },
      { label: "Invitations", href: "/dashboard/invitations", icon: MailIcon },
    ],
  },
  {
    label: "Library",
    items: [
      {
        label: "Event Types",
        href: "/dashboard/event-types",
        icon: SparklesIcon,
      },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3Icon },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: SettingsIcon,
      },
    ],
  },
];

export default function DashboardLayoutPage({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <DashboardShell
        header={<SiteHeader userMenu={<UserMenuLoader />} />}
        sidebar={<AppSidebar groups={navGroups} />}
      >
        {children}
      </DashboardShell>
    </SidebarProvider>
  );
}
