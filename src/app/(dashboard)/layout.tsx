import { CalendarIcon, HomeIcon, MailIcon, UsersIcon } from "lucide-react";
import React, { PropsWithChildren } from "react";

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
    items: [
      { label: "Dashboard", href: "/dashboard", icon: HomeIcon },
      { label: "Events", href: "/events", icon: CalendarIcon },
      { label: "Guests", href: "/guests", icon: UsersIcon },
      { label: "Invitations", href: "/invitations", icon: MailIcon },
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
