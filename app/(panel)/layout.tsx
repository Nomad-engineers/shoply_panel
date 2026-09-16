"use client";

import * as React from "react";

import { AppShell, Sidebar, SidebarNav } from "@/components/layout";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <AppShell>
      <Sidebar isCollapsed={isCollapsed}>
        <SidebarNav
          isCollapsed={isCollapsed}
          className="flex-1 min-h-0"
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        />
      </Sidebar>
      {children}
    </AppShell>
  );
}
