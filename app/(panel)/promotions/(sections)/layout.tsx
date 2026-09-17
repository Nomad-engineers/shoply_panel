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
  href: string;
}[] = [
  { key: "promocodes", label: "Промокоды", href: "/promotions/promocodes" },
  { key: "push", label: "Push уведомления", href: "/promotions/push" },
  { key: "banners", label: "Баннеры", href: "/promotions/banners" },
];

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const marketingMenu = (
    <aside className="w-[248px] shrink-0 rounded-[20px] bg-white p-[8px] shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
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
                {item.key === "banners" ? (
                  <MarketingBannerIcon
                    className={cn(
                      "h-[22px] w-[22px]",
                      active ? "text-white" : "text-[#09091D]"
                    )}
                  />
                ) : item.key === "push" ? (
                  <Bell
                    className={cn(
                      "h-[20px] w-[20px]",
                      active ? "text-white" : "text-[#09091D]"
                    )}
                  />
                ) : (
                  <MarketingTicketIcon
                    className={cn(
                      "h-[20px] w-[20px]",
                      active ? "text-white" : "text-[#09091D]"
                    )}
                  />
                )}
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

  return (
    <DashboardLayout contentClassName="min-h-0 w-full p-0">
      <section className="flex min-h-0 flex-1 items-start gap-6 px-6 pb-6 pt-8">
        {marketingMenu}
        <div className="flex min-h-0 flex-1 flex-col self-stretch overflow-hidden rounded-[24px] border border-border bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          {children}
        </div>
      </section>
    </DashboardLayout>
  );
}
