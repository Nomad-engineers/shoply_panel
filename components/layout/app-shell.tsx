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
          "flex h-screen w-full overflow-hidden bg-background-main",
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
          "relative bg-background-surface border-r border-border pt-8 z-10 bg-white transition-all duration-300 ease-in-out flex flex-col h-full",
          isCollapsed ? "w-[90px]" : "w-[280px]",
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
          "flex-1 h-full overflow-y-auto bg-background-main relative",
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
          " z-20 flex h-[72px] items-center justify-between bg-background-surface  border-border px-8",
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
      <div ref={ref} className={cn("px-4 pt-8", className)}>
        {children}
      </div>
    );
  },
);
export { AppShell, Sidebar, Main, Header, Content };
