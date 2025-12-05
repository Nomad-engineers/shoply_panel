"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Home,
  Package,
  Users,
  MapPin,
  Truck,
  Settings,
  HelpCircle,
} from "lucide-react";

import { cn } from "@/lib/theme";

const navItemVariants = cva(
  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 mb-1",
  {
    variants: {
      active: {
        true: "bg-surface-light text-text-primary font-semibold",
        false: "text-text-secondary hover:bg-surface-light hover:text-text-primary",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

interface NavItemProps
  extends React.HTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof navItemVariants> {
    href: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }

const NavItem = React.forwardRef<HTMLAnchorElement, NavItemProps>(
  ({ href, icon, children, active, className, ...props }, ref) => {
    const pathname = usePathname();
    const isActive = active ?? (pathname === href || pathname.startsWith(href + "/"));

    return (
      <Link
        href={href}
        ref={ref}
        className={cn(navItemVariants({ active: isActive }), className)}
        {...props}
      >
        <span className="h-5 w-5">{icon}</span>
        {children}
      </Link>
    );
  }
);
NavItem.displayName = "NavItem";

const navigationItems = [
  {
    title: "Отчеты",
    href: "/reports",
    icon: <Home className="h-5 w-5" />,
  },
];



interface SidebarNavProps {
  className?: string;
}

const SidebarNav = React.forwardRef<HTMLDivElement, SidebarNavProps>(
  ({ className }, ref) => {
    return (
      <nav ref={ref} className={cn("flex flex-1 flex-col", className)}>
        <div className="flex-1">
          <div className="mb-8">
            <h2 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Main
            </h2>
            <div className="mt-2">
              {navigationItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                >
                  {item.title}
                </NavItem>
              ))}
            </div>
          </div>
        </div>
      </nav>
    );
  }
);
SidebarNav.displayName = "SidebarNav";

export { SidebarNav, NavItem };