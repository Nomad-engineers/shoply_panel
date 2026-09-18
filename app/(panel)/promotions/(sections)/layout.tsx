"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import { DashboardLayout } from "@/components/layout";
import { cn } from "@/lib/theme";
import {
  MarketingTicketIcon,
  MarketingBannerIcon,
} from "@/components/icons/marketing-icons";

type MarketingSection = "promocodes" | "push" | "banners";

const MARKETING_SECTIONS: {
  key: MarketingSection;
  label: string;
  shortLabel: string;
  href: string;
}[] = [
  { key: "promocodes", label: "Промокоды", shortLabel: "Промокоды", href: "/promotions/promocodes" },
  { key: "push", label: "Push уведомления", shortLabel: "Push", href: "/promotions/push" },
  { key: "banners", label: "Баннеры", shortLabel: "Баннеры", href: "/promotions/banners" },
];

function SectionIcon({
  sectionKey,
  active,
}: {
  sectionKey: MarketingSection;
  active: boolean;
}) {
  if (sectionKey === "banners") {
    return (
      <MarketingBannerIcon
        className={cn(
          "h-[22px] w-[22px]",
          active ? "text-white" : "text-[#09091D]"
        )}
      />
    );
  }
  if (sectionKey === "push") {
    return (
      <Bell
        className={cn(
          "h-[20px] w-[20px]",
          active ? "text-white" : "text-[#09091D]"
        )}
      />
    );
  }
  return (
    <MarketingTicketIcon
      className={cn(
        "h-[20px] w-[20px]",
        active ? "text-white" : "text-[#09091D]"
      )}
    />
  );
}

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const marketingMenu = (
    <aside className="hidden w-[248px] shrink-0 rounded-[20px] bg-white p-[8px] shadow-[0_20px_60px_rgba(15,23,42,0.06)] lg:block">
      <nav className="flex flex-col gap-[2px]">
        {MARKETING_SECTIONS.map((item) => {
          const active = pathname === item.href;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => router.push(item.href)}
              className={cn(
                "flex h-[48px] w-full items-center gap-[10px] rounded-[14px] px-[8px] text-left transition-colors",
                active ? "bg-[#F6F6FA]" : "hover:bg-[#FAFAFC]"
              )}
            >
              <span
                className={cn(
                  "grid h-[32px] w-[32px] shrink-0 place-items-center rounded-[10px] transition-colors",
                  active ? "bg-[#09091D]" : "bg-transparent"
                )}
              >
                <SectionIcon sectionKey={item.key} active={active} />
              </span>
              <span
                className={cn(
                  "flex-1 truncate text-[14px]",
                  active
                    ? "font-semibold text-[#09091D]"
                    : "font-normal text-[#09091D]/80"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );

  const marketingBottomNav = (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#ECECF3] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.06)] lg:hidden">
      <div className="flex">
        {MARKETING_SECTIONS.map((item) => {
          const active = pathname === item.href;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => router.push(item.href)}
              className="flex flex-1 cursor-pointer flex-col items-center gap-[4px] px-2 pb-[10px] pt-[8px] transition-colors active:bg-[#FAFAFC]"
            >
              <span
                className={cn(
                  "grid h-[32px] w-[32px] place-items-center rounded-[10px] transition-colors",
                  active ? "bg-[#09091D]" : "bg-transparent"
                )}
              >
                <SectionIcon sectionKey={item.key} active={active} />
              </span>
              <span
                className={cn(
                  "text-[11px] leading-[13px]",
                  active
                    ? "font-semibold text-[#09091D]"
                    : "font-normal text-[#09091D]/60"
                )}
              >
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );

  return (
    <DashboardLayout contentClassName="min-h-0 w-full max-lg:overflow-hidden p-0">
      <section className="flex min-h-0 flex-1 flex-col gap-3 px-3 py-3 pb-[84px] lg:flex-row lg:items-start lg:gap-6 lg:overflow-visible lg:px-6 lg:pb-6 lg:pt-8">
        {marketingMenu}
        <div className="flex min-h-0 flex-1 flex-col self-stretch overflow-hidden rounded-[24px] border border-border bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          {children}
        </div>
      </section>
      {marketingBottomNav}
    </DashboardLayout>
  );
}
