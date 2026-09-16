"use client";
import * as React from "react";

import { Main, Header, Content } from "./index";

interface DashboardLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  contentClassName?: string;
  headerClassName?: string;
  mainClassName?: string;
}

/**
 * Per-page chrome only. The persistent shell (AppShell + Sidebar)
 * lives in `app/(panel)/layout.tsx`, so this must NOT render a sidebar.
 */
const DashboardLayout = React.forwardRef<HTMLDivElement, DashboardLayoutProps>(
  ({ children, header, contentClassName, headerClassName, mainClassName }, ref) => {
    return (
      <Main ref={ref} className={mainClassName}>
        {header && <Header className={headerClassName}>{header}</Header>}
        <Content className={contentClassName}>{children}</Content>
      </Main>
    );
  },
);

export { DashboardLayout };
