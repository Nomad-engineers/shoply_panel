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
}

const DashboardLayout = React.forwardRef<HTMLDivElement, DashboardLayoutProps>(
  ({ children, header }, ref) => {
    return (
      <AppShell ref={ref}>
        <Sidebar>
          <Logo className="mb-12" />
          <SidebarNav />
        </Sidebar>
        <Main>
          {header && (
            <Header>
              {header}
            </Header>
          )}
          <Content>
            {children}
          </Content>
        </Main>
      </AppShell>
    );
  }
);
DashboardLayout.displayName = "DashboardLayout";

export { DashboardLayout };