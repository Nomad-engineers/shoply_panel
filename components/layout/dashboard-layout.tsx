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
      return (
        <AppShell ref={ref} className=" bg-gray-100 flex min-h-screen p-4">
          {!hideSidebar && (
            <Sidebar>
              <Logo />
              <SidebarNav />
            </Sidebar>
          )}
          <Main>
            {header && <Header>{header}</Header>}
            <Content>{children}</Content>
          </Main>
        </AppShell>
      );
    }
  );

  export {DashboardLayout}