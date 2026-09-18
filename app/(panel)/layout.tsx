"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppShell, Sidebar, SidebarNav } from "@/components/layout";
import { cn } from "@/lib/theme";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <AppShell className="max-lg:h-dvh max-lg:pt-[64px]">
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#09091D]/30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <header className="fixed inset-x-0 top-0 z-20 flex h-[64px] shrink-0 items-center justify-between border-b border-[#ECECF3] bg-white px-4 lg:hidden">
        <Link href="/categories" className="flex items-center gap-3">
          <Image
            src="/v2-files/v2-logo.svg"
            height={40}
            width={40}
            alt="Shoply Panel"
          />
          <span className="flex flex-col leading-none">
            <span className="text-[10px] font-extrabold tracking-tight text-[#0E0F27]">
              SHOPLY
            </span>
            <span className="text-[18px] font-extrabold tracking-tight text-[#0E0F27]">
              PANEL
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Открыть меню"
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-[8px] transition-colors hover:bg-[#F5F6F6] active:bg-[#ECECF3]"
        >
          <Image
            src="/panel-icons/sidebar-toggle.png"
            width={20}
            height={20}
            alt=""
          />
        </button>
      </header>

      <Sidebar
        isCollapsed={isCollapsed}
        className={cn(
          "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-40 max-lg:shadow-[0_20px_60px_rgba(15,23,42,0.25)]",
          isMobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
        )}
      >
        <SidebarNav
          isCollapsed={isCollapsed}
          className="flex-1 min-h-0"
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        />
      </Sidebar>
      {children}
    </AppShell>
  );
}
