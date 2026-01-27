"use client";
import * as React from "react";

import {
  AppShell,
  Sidebar,
  Main,
  Header,
  Content,
  SidebarNav,
  Logo,
} from "./index";

interface DashboardLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  hideSidebar?: boolean;
}

const DashboardLayout = React.forwardRef<HTMLDivElement, DashboardLayoutProps>(
  ({ children, header, hideSidebar }, ref) => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const toggleCollapse = () => {
      setIsCollapsed(!isCollapsed);
    };

    return (
      <AppShell ref={ref} className=" bg-gray-100 flex min-h-screen">
        {!hideSidebar && (
          <Sidebar isCollapsed={isCollapsed}>
            <Logo isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
            <SidebarNav
              isCollapsed={isCollapsed}
              className="flex-1 min-h-0"
              onToggleCollapse={toggleCollapse}
            />
          </Sidebar>
        )}
        <Main>
          {header && <Header>{header}</Header>}
          <Content>{children}</Content>
        </Main>
      </AppShell>
    );
  },
);

export { DashboardLayout };
