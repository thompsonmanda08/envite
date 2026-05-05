"use client";

import React from "react";
import { SidebarInset, useSidebar } from "../ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

export function DashboardLayout({
  children,
  sidebar,
  header,
}: DashboardLayoutProps) {
  const { isMobile, open } = useSidebar();

  const gridColumns = isMobile
    ? "1fr"
    : !open
      ? "4rem 1fr"
      : "var(--sidebar-width) 1fr";

  return (
    <div
      className="max-w-[1920px] mx-auto w-full relative"
      style={{
        display: "grid",
        gridTemplateColumns: gridColumns,
        minHeight: "100vh",
        transition: "grid-template-columns 200ms ease-linear",
      }}
    >
      {!isMobile && sidebar && (
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            zIndex: 40,
            overflow: "hidden",
          }}
        >
          {sidebar}
        </div>
      )}
      {isMobile && sidebar}
      <div className="flex flex-col pt-2">
        <SidebarInset className="flex flex-col">
          {header}
          <div className="flex-1">
            <div className="@container/main p-3 sm:p-4 pb-20 sm:pb-24 xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto">
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </div>
  );
}
