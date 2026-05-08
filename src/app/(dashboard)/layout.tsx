import { PropsWithChildren } from "react";

import { getCurrentUser } from "@/lib/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardLayout as DashboardShell } from "@/components/layout/dashboard-layout";
import { SiteHeader } from "@/components/layout/header";
import { UserMenuLoader } from "@/components/layout/header/user-menu-loader";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";

export default async function DashboardLayoutPage({
  children,
}: PropsWithChildren) {
  const user = await getCurrentUser();
  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.email ||
    "";
  const role = user?.role
    ? String(user.role).replace(/_/g, " ")
    : user?.account_type || "Host";

  return (
    <SidebarProvider>
      <DashboardShell
        header={<SiteHeader userMenu={<UserMenuLoader />} />}
        sidebar={
          <AppSidebar
            user={
              fullName
                ? {
                    name: fullName,
                    role,
                    avatarUrl: user?.avatar_url,
                  }
                : undefined
            }
          />
        }
      >
        {children}
      </DashboardShell>
    </SidebarProvider>
  );
}
