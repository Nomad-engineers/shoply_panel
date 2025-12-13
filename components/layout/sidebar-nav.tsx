"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/theme";
import { Button } from "../ui";
import { fetchWithSession } from "../utils/fetch.util";
const NavItem = React.forwardRef<HTMLAnchorElement, { href: string; icon: React.ReactNode; children: React.ReactNode; className?: string }>(
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
NavItem.displayName = "NavItem";

export const SidebarNav = React.forwardRef<HTMLDivElement, { className?: string }>(({ className }, ref) => {
  const router = useRouter();
  const [adminData, setAdminData] = React.useState<any>(null);
  const directusUrl=process.env.NEXT_PUBLIC_DIRECTUS_URL

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetchWithSession(`${directusUrl}/users/me`);
        if (!res.ok) throw new Error("Не авторизован");
        const result = await res.json();
        setAdminData(result.data || result);
      } catch {
        setAdminData(null);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout =()=> {
    try {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } catch {}
    setAdminData(null);
    router.push("/");
  };

  const isLoggedIn = !!adminData;

  const navigationItems = [
    { title: "Отчеты", href: "/reports", icon: <Home className="h-5 w-5" /> },
  ];
  console.log(adminData)
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
          <p className="text-sm font-medium text-gray-900">{adminData?.first_name ?? "Админ"} {adminData?.last_name ?? ""}</p>
          <p className="text-xs text-gray-500">{adminData?.email ?? ""}</p>
        </div>
        {isLoggedIn ? (
          <Button onClick={handleLogout} variant="destructive" size="default" className="w-full flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> Выйти
          </Button>
        ) : (
          <Button asChild size="default" className="w-full flex items-center justify-center gap-2">
            <Link href="/login"><Plus className="w-4 h-4" /> Войти</Link>
          </Button>
        )}
      </div>
    </div>
  );
});
SidebarNav.displayName = "SidebarNav";
