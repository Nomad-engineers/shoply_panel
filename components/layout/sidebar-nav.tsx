"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/theme";
import { Button } from "../ui";
import { useAuth } from "../hooks/useLogin";
import Cookies from "js-cookie";
import {
  OrderIcon,
  UserIcon,
  ShopIcon,
  PromotionIcon,
  ReportIcon,
  ProductIcon,
} from "./icons";
import { useMemo } from "react";
import { ShopSwitcher } from "../ui/shops.dropdown";
import type { AuthProfileBusiness } from "@/types/auth";

interface NavItemProps {
  href?: string;
  icon: React.ElementType;
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
        <Icon
          className={cn(
            "shrink-0",
            isDisabled
              ? "text-text-secondary/50"
              : isActive
                ? "text-primary-main"
                : "text-text-secondary"
          )}
        />
        <span
          className={cn(
            "whitespace-nowrap",
            isCollapsed &&
              "text-center text-[10px] leading-tight max-w-[70px] truncate"
          )}
        >
          {children}
        </span>
      </>
    );

    const commonClassName = cn(
      "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all mb-1 rounded-lg",
      isDisabled
        ? "cursor-not-allowed text-text-secondary/50 opacity-60"
        : isActive
          ? "bg-surface-light text-text-primary font-semibold"
          : "text-text-secondary hover:bg-surface-light hover:text-text-primary",
      isCollapsed &&
        "flex-col justify-center items-center px-2 py-2 gap-1 text-xs",
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
    const { adminData, logout } = useAuth();

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
      const cookieId = Number(Cookies.get("current_shop_id"));
      const allowedShops = allShops.map((shop) => shop.id);

      if (cookieId && allowedShops.includes(cookieId)) {
        return cookieId;
      }

      const fallbackId = adminData?.shopId ?? allowedShops[0];
      if (fallbackId) {
        Cookies.set("current_shop_id", String(fallbackId));
      }
      return fallbackId;
    }, [adminData?.shopId, allShops]);

    const currentShop = useMemo(() => {
      if (!allShops || !Array.isArray(allShops)) return null;
      return allShops.find((s) => s.id === activeShopId) || null;
    }, [allShops, activeShopId]);

    const isCollapsed = externalIsCollapsed ?? false;
    const isLoggedIn = !!adminData;

    const handleShopChange = (shopId: number) => {
      Cookies.set("current_shop_id", String(shopId));
      window.location.reload();
    };

    const navigationItems = [
      {
        title: "Товары",
        href: "/categories",
        icon: ProductIcon,
      },
      { title: "Заказы", icon: OrderIcon },
    ];

    if (adminData?.isAdmin) {
      navigationItems.push(
        {
          title: "Акции и промокоды",
          href: "/promotions",
          icon: PromotionIcon,
        },
        { title: "Магазины", icon: ShopIcon },
        {
          title: "Отчеты",
          href: "/reports/couriers",
          icon: ReportIcon,
        },
        {
          title: "Пользователи",
          icon: UserIcon,
        }
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col h-full relative min-h-0 border-t",
          className
        )}
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

        <nav className="flex-1 min-h-0 overflow-auto pt-4">
          {navigationItems.map((item) => (
            <NavItem
              key={item.href ?? item.title}
              href={item.href}
              icon={item.icon}
              isCollapsed={isCollapsed}
            >
              {item.title}
            </NavItem>
          ))}
        </nav>

        <div
          className={cn(
            "px-4 pb-4 pt-4 mt-auto bg-white z-10 border-gray-50",
            isCollapsed && "px-2"
          )}
        >
          {isLoggedIn && !isCollapsed && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                {adminData?.firstName ?? "Админ"} {adminData?.lastName ?? ""}
              </p>
              <p className="text-xs text-gray-500 truncate">
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
                "w-full justify-start gap-2 rounded-xl",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? "Выйти" : undefined}
            >
              <LogOut className="w-4 h-4" />
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
