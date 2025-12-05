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
          "flex min-h-screen bg-background-main",
          className
        )}
      >
        {children}
      </div>
    );
  }
);
AppShell.displayName = "AppShell";

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed left-0 top-0 h-screen w-[280px] bg-background-surface border-r border-border p-6 pt-8 z-10",
          className
        )}
      >
        {children}
      </div>
    );
  }
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
          "flex-1 ml-[280px] min-h-screen bg-background-main",
          className
        )}
      >
        {children}
      </div>
    );
  }
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
          "sticky top-0 z-20 flex h-[72px] items-center justify-between bg-background-surface border-b border-border px-8",
          className
        )}
      >
        {children}
      </div>
    );
  }
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
        className={cn(
          "p-8",
          className
        )}
      >
        {children}
      </div>
    );
  }
);
Content.displayName = "Content";

export { AppShell, Sidebar, Main, Header, Content };