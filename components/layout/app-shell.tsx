import * as React from "react";

import { cn } from "@/lib/theme";

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-screen w-full gap-4 overflow-hidden bg-background-main p-4",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);
AppShell.displayName = "AppShell";

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  isCollapsed?: boolean;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, isCollapsed }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative z-10 flex h-full flex-col overflow-hidden rounded-[24px] bg-white transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[88px]" : "w-[240px]",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);
Sidebar.displayName = "Sidebar";

interface MainProps {
  children: React.ReactNode;
  className?: string;
}

const Main = React.forwardRef<HTMLDivElement, MainProps>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-full flex-1 flex-col overflow-hidden rounded-[24px] bg-background-surface",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);
Main.displayName = "Main";

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "z-20 flex h-[72px] items-center justify-between bg-background-surface px-8",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);
Header.displayName = "Header";

interface ContentProps {
  children: React.ReactNode;
  className?: string;
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", className)}
      >
        {children}
      </div>
    );
  },
);
export { AppShell, Sidebar, Main, Header, Content };
