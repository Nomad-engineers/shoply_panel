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
import { useShops } from "../hooks/useShops";
import { useState } from "react";
import { Shop } from "@/types/shop";
import { getImageUrl } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
  isCollapsed?: boolean;
  disabled?: boolean;
}

export const NavItem = React.forwardRef<HTMLAnchorElement, NavItemProps>(
  ({ href, icon: Icon, children, className, isCollapsed, disabled }, ref) => {
    const pathname = usePathname();
    const isActive =
      !disabled && (pathname === href || pathname.startsWith(href + "/"));

    const content = (
      <>
        <Icon
          className={cn(
            "shrink-0",
            isActive ? "text-primary-main" : "text-text-secondary"
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
      isActive
        ? "bg-surface-light text-text-primary font-semibold"
        : "text-text-secondary hover:bg-surface-light hover:text-text-primary",
      isCollapsed &&
        "flex-col justify-center items-center px-2 py-2 gap-1 text-xs",
      className
    );

    if (disabled) {
      return (
        <div
          className={commonClassName}
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
  ({ className, isCollapsed: externalIsCollapsed, onToggleCollapse }, ref) => {
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    const { adminData, logout } = useAuth(directusUrl);
    const [userShop, setUserShop] = useState<Shop | undefined>();
    const { shops } = useShops();
    const [internalIsCollapsed, setInternalIsCollapsed] = React.useState(false);
    const isCollapsed = externalIsCollapsed ?? internalIsCollapsed;
    const isLoggedIn = !!adminData;

    React.useEffect(() => {
      if (isLoggedIn && !adminData?.isAdmin) {
        const shopIdFromCookie = Cookies.get("user_shop_id");
        if (shopIdFromCookie && shops.length > 0) {
          const shop = shops.find(
            (s) => String(s.id) === String(shopIdFromCookie)
          );
          setUserShop(shop);
        }
      }
    }, [isLoggedIn, adminData, shops]);

    const navigationItems = [
      {
        title: "Товары",
        href: "/categories",
        icon: ProductIcon,
      },
      { title: "Заказы", href: "/orders", icon: OrderIcon, disabled: true },
    ];

    if (adminData?.isAdmin) {
      navigationItems.push(
        {
          title: "Акции и промокоды",
          href: "/promotions",
          icon: PromotionIcon,
        },
        { title: "Магазины", href: "/shops", icon: ShopIcon, disabled: true },
        {
          title: "Отчеты",
          href: "/reports/couriers",
          icon: ReportIcon,
        },

        {
          title: "Пользователи",
          href: "/users",
          icon: UserIcon,
          disabled: true,
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
        {isLoggedIn && !adminData?.isAdmin && userShop && (
          <div
            className={cn(
              "px-4 py-4 border-b border-gray-100 shrink-0",
              isCollapsed && "px-2"
            )}
          >
            <div className="flex items-center gap-3 justify-center">
              <div className="relative shrink-0">
                <img
                  src={getImageUrl(userShop?.photo, {
                    width: 40,
                    height: 40,
                    fit: "cover",
                  })}
                  alt={userShop.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-100"
                />
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0 ">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-text-primary truncate">
                      {userShop.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#55CB00] font-medium">
                    Открыто до {userShop.workTimeEnd.slice(0, -3)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <nav className="flex-1 min-h-0 overflow-auto pt-4">
          {navigationItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              isCollapsed={isCollapsed}
              disabled={(item as any).disabled}
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
                {adminData?.first_name ?? "Админ"} {adminData?.last_name ?? ""}
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

