import React, { PropsWithChildren } from "react";
import DashboardNavigation from "./_components/dashboard-widgets";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* SIDE BAR AND MOBILE TOP NAV BAR */}
      <DashboardNavigation profile={{}} />

      {/* Main content wrapper - provides space for sidebar */}
      <div className="lg:pl-64">
        {/* MAIN PAGE CONTENT - DASHBOARD */}
        <main className="p-4 lg:p-6 pb-20">{children}</main>
      </div>
    </div>
  );
}
