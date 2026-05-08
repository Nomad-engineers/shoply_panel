"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/theme";
import { Button } from "../ui";
import { useAuth } from "../hooks/useLogin";
import { ProductIcon } from "./icons";
import { useMemo } from "react";
import { ShopSwitcher } from "../ui/shops.dropdown";
import type { AuthProfileBusiness } from "@/types/auth";

type NavIcon = React.ElementType | string;

type NavigationItem = {
  title: string;
  href?: string;
  icon: NavIcon;
  disabled?: boolean;
};

interface NavItemProps {
  href?: string;
  icon: NavIcon;
  children: React.ReactNode;
  className?: string;
  isCollapsed?: boolean;
  disabled?: boolean;
}

export const NavItem = React.forwardRef<HTMLAnchorElement, NavItemProps>(
  ({ href, icon: Icon, children, className, isCollapsed, disabled }, ref) => {
    const pathname = usePathname();
    const isDisabled = disabled || !href;
    const isActive =
      !!href && !isDisabled && (pathname === href || pathname.startsWith(href + "/"));

    const content = (
      <>
        {typeof Icon === "string" ? (
          <Image
            src={Icon}
            alt=""
            aria-hidden="true"
            width={24}
            height={24}
            className={cn(
              "shrink-0",
              isDisabled && "opacity-50",
              !isDisabled && !isActive && "opacity-90"
            )}
          />
        ) : (
          <Icon
            className={cn(
              "shrink-0",
              isDisabled
                ? "text-text-secondary/50"
                : isActive
                  ? "text-primary"
                  : "text-text-secondary"
            )}
          />
        )}
        <span
          className={cn(
            "whitespace-nowrap",
            isCollapsed &&
              "max-w-[70px] truncate text-center text-[10px] leading-tight"
          )}
        >
          {children}
        </span>
      </>
    );

    const commonClassName = cn(
      "mb-0.5 flex items-center gap-3 rounded-xl px-[18px] py-3 text-[14px] font-semibold tracking-[-0.02em] transition-all duration-150",
      isDisabled
        ? "cursor-not-allowed text-text-secondary/50 opacity-60"
        : isActive
          ? "bg-[#eeeef4] text-text-primary"
          : "text-text-primary hover:bg-[#f7f7fa]",
      isCollapsed &&
        "flex-col items-center justify-center gap-1 px-2 py-2 text-[11px]",
      className
    );

    if (isDisabled) {
      return (
        <div
          className={commonClassName}
          aria-disabled="true"
          title={isCollapsed ? children?.toString() : undefined}
        >
          {content}
        </div>
      );
    }

    return (
      <Link
        href={href}
        ref={ref}
        className={commonClassName}
        title={isCollapsed ? children?.toString() : undefined}
      >
        {content}
      </Link>
    );
  }
);

interface SidebarNavProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const SidebarNav = React.forwardRef<HTMLDivElement, SidebarNavProps>(
  ({ className, isCollapsed: externalIsCollapsed }, ref) => {
    const { adminData, currentShopId, logout, setCurrentShopId } = useAuth();
    const pathname = usePathname();

    const allShops = useMemo(
      () =>
        (adminData?.businesses || []).map((business: AuthProfileBusiness) => ({
          id: business.id,
          name: business.name,
          photo: business.photoId ? { id: business.photoId } : null,
          type: business.type,
        })),
      [adminData?.businesses]
    );

    const activeShopId = useMemo(() => {
      const allowedShops = allShops.map((shop) => shop.id);

      if (currentShopId && allowedShops.includes(currentShopId)) {
        return currentShopId;
      }

      return adminData?.shopId ?? allowedShops[0] ?? null;
    }, [adminData?.shopId, allShops, currentShopId]);

    React.useEffect(() => {
      if (!currentShopId && activeShopId) {
        setCurrentShopId(activeShopId);
      }
    }, [activeShopId, currentShopId, setCurrentShopId]);

    const currentShop = useMemo(() => {
      if (!allShops || !Array.isArray(allShops)) return null;
      return allShops.find((s) => s.id === activeShopId) || null;
    }, [allShops, activeShopId]);

    const isCollapsed = externalIsCollapsed ?? false;
    const isLoggedIn = !!adminData;
    const isAdminArea =
      adminData?.isAdmin ||
      pathname.startsWith("/orders") ||
      pathname.startsWith("/users") ||
      pathname.startsWith("/partners") ||
      pathname.startsWith("/reports");

    const handleShopChange = (shopId: number) => {
      setCurrentShopId(shopId);
    };

    const navigationItems: NavigationItem[] = isAdminArea
      ? [
          { title: "Заказы", href: "/orders", icon: "/panel-icons/nav-orders.png" },
          {
            title: "Пользователи",
            href: "/users",
            icon: "/panel-icons/nav-users.png",
          },
          {
            title: "Партнеры",
            href: "/partners",
            icon: "/panel-icons/nav-partners.png",
          },
          {
            title: "Акции и промокоды",
            href: "/promotions",
            icon: "/panel-icons/nav-promotions.png",
          },
          {
            title: "Отчеты",
            href: "/reports/couriers",
            icon: "/panel-icons/nav-reports.png",
          },
        ]
      : [
          {
            title: "Товары",
            href: "/categories",
            icon: ProductIcon,
          },
          {
            title: "Акции и промокоды",
            href: undefined,
            icon: "/panel-icons/nav-promotions.png",
            disabled: true,
          },
        ];

    return (
      <div
        ref={ref}
        className={cn("relative flex h-full min-h-0 flex-col", className)}
      >
        {/* Блок выбора магазина с Dropdown */}
        {isLoggedIn && !adminData?.isAdmin && (
          <div
            className={cn(
              "px-4 py-4 border-b border-gray-100 shrink-0",
              isCollapsed && "px-2"
            )}
          >
            <ShopSwitcher
              currentShop={currentShop}
              allShops={allShops}
              activeShopId={activeShopId}
              onShopSelect={handleShopChange}
              isCollapsed={isCollapsed}
            />
          </div>
        )}

        <nav className="min-h-0 flex-1 overflow-auto px-[6px] pt-2">
          {navigationItems.map((item) => (
            <NavItem
              key={item.href ?? item.title}
              href={item.href}
              icon={item.icon}
              isCollapsed={isCollapsed}
              disabled={item.disabled}
            >
              {item.title}
            </NavItem>
          ))}
        </nav>

        <div
          className={cn(
            "z-10 mt-auto bg-white px-[18px] pb-[18px] pt-[18px]",
            isCollapsed && "px-2"
          )}
        >
          {isLoggedIn && !isCollapsed && (
            <div className="mb-[18px] space-y-1">
              <p className="truncate text-[16px] font-medium leading-[1.125] text-text-primary">
                {adminData?.firstName ?? "Admin"} {adminData?.lastName ?? ""}
              </p>
              <p className="truncate text-[14px] leading-[1.3] text-text-secondary">
                {adminData?.email ?? ""}
              </p>
            </div>
          )}

          {isLoggedIn ? (
            <Button
              onClick={logout}
              variant="destructive"
              size="default"
              className={cn(
                "h-auto w-full justify-start gap-3 rounded-xl border-0 bg-[#ffd9b8] px-3 py-3 text-[#0e0f27] shadow-none hover:bg-[#ffd1aa]",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? "Выйти" : undefined}
            >
              <Image
                src="/panel-icons/action-logout.png"
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
              />
              {!isCollapsed && "Выйти"}
            </Button>
          ) : (
            <Button
              asChild
              size="default"
              className={cn(
                "w-full flex items-center justify-center gap-2",
                isCollapsed && "px-2"
              )}
              title={isCollapsed ? "Войти" : undefined}
            >
              <Link href="/login">
                <Plus className="w-4 h-4" />
                {!isCollapsed && "Войти"}
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }
);
