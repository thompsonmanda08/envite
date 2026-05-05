import {
  ChartColumnIcon,
  LayoutDashboardIcon,
  MessageCircleQuestionMarkIcon,
  SettingsIcon,
  ShoppingBasketIcon,
  FolderIcon,
} from "lucide-react";

export const dashboard_navigation = [
  { name: "Overview", href: "/(dashboard)", icon: LayoutDashboardIcon },
  { name: "Events", href: "/(dashboard)/events", icon: ShoppingBasketIcon },
  { name: "Invites", href: "/(dashboard)/categories", icon: FolderIcon },
  { name: "Analytics", href: "/(dashboard)/analytics", icon: ChartColumnIcon },
  { name: "Settings", href: "/(dashboard)/settings", icon: SettingsIcon },
  {
    name: "Support",
    href: "#",
    external: true,
    icon: MessageCircleQuestionMarkIcon,
  },
];
