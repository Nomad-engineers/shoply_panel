"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/theme";
import { Button } from "../ui";
import { useAuth } from "../hooks/useLogin";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const NavItem = React.forwardRef<HTMLAnchorElement, NavItemProps>(
  ({ href, icon, children, className }, ref) => {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(href + "/");

    return (
      <Link
        href={href}
        ref={ref}
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all mb-1",
          isActive
            ? "bg-surface-light text-text-primary font-semibold"
            : "text-text-secondary hover:bg-surface-light hover:text-text-primary",
          className
        )}
      >
        <span className="h-5 w-5">{icon}</span>
        {children}
      </Link>
    );
  }
);

interface SidebarNavProps {
  className?: string;
}

export const SidebarNav = React.forwardRef<HTMLDivElement, SidebarNavProps>(
  ({ className }, ref) => {
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    const { adminData, logout } = useAuth(directusUrl);
    const navigationItems = [
      { title: "Отчеты", href: "/reports", icon: <Home className="h-5 w-5" /> },
    ];
    const isLoggedIn = !!adminData;

  return (
  <div ref={ref} className={cn("flex flex-col justify-between min-h-screen", className)}>
    <nav className="flex-1 overflow-auto">
      {navigationItems.map((item) => (
        <NavItem key={item.href} href={item.href} icon={item.icon}>
          {item.title}
        </NavItem>
      ))}
    </nav>

    <div className="absolute bottom-0 w-full mt-auto px-4 pb-4">
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-900">
          {adminData?.first_name ?? "Админ"} {adminData?.last_name ?? ""}
        </p>
        <p className="text-xs text-gray-500">{adminData?.email ?? ""}</p>
      </div>

      {isLoggedIn ? (
        <Button
          onClick={logout}
          variant="destructive"
          size="default"
          className="w-full flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Выйти
        </Button>
      ) : (
        <Button
          asChild
          size="default"
          className="w-full flex items-center justify-center gap-2"
        >
          <Link href="/login">
            <Plus className="w-4 h-4" /> Войти
          </Link>
        </Button>
      )}
  </div>
</div>

)});
