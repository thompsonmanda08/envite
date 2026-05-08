"use client";

import {
  BarChart3Icon,
  CalendarIcon,
  HomeIcon,
  MailIcon,
  SettingsIcon,
  ShapesIcon,
} from "lucide-react";

import type { SidebarNavGroup } from "./app-sidebar";

export const dashboardNavGroups: SidebarNavGroup[] = [
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
        icon: ShapesIcon,
      },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3Icon },
      { label: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
    ],
  },
];
