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
  contentClassName?: string;
  headerClassName?: string;
  mainClassName?: string;
}

const DashboardLayout = React.forwardRef<HTMLDivElement, DashboardLayoutProps>(
  ({ children, header, hideSidebar, contentClassName, headerClassName, mainClassName }, ref) => {
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
        <Main className={mainClassName}>
          {header && <Header className={headerClassName}>{header}</Header>}
          <Content className={contentClassName}>{children}</Content>
        </Main>
      </AppShell>
    );
  },
);

export { DashboardLayout };
