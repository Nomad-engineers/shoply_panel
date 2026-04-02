"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { cn } from "@/lib/theme";
import { useAuth } from "@/components/hooks/useLogin";
import { Spinner } from "@/components/ui";

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { adminData, loading } = useAuth();

  const tabs = [
    {
      name: "Выплаты курьерам",
      href: "/reports/couriers",
      active: pathname.startsWith("/reports/couriers"),
    },
    {
      name: "Расчет с магазинами",
      href: "/reports/shops",
      active: pathname.startsWith("/reports/shops"),
    },
    {
      name: "Промо компаний",
      active: false,
    },
  ];

  const header = (
    <div className="flex flex-col gap-6 mt-22">
      <h1 className="text-[24px] font-bold text-[#111111]">Отчеты</h1>
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const isDisabled = !tab.href;
          const button = (
            <button
              type="button"
              disabled={isDisabled}
              aria-disabled={isDisabled}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                tab.active
                  ? "bg-[#55CB00] text-white shadow-sm"
                  : "text-[#111111] hover:bg-gray-100",
                isDisabled &&
                  "cursor-not-allowed text-[#111111]/40 hover:bg-transparent",
              )}
            >
              {tab.name}
            </button>
          );

          if (isDisabled) {
            return <div key={tab.href ?? tab.name}>{button}</div>;
          }

          return (
            <Link key={tab.href} href={tab.href}>
              {button}
            </Link>
          );
        })}
      </div>
    </div>
  );

  if (loading && !adminData) {
    return (
      <DashboardLayout header={null}>
        <div className="flex items-center justify-center p-20">
          <Spinner size={40} />
        </div>
      </DashboardLayout>
    );
  }

  // Double check admin access if loaded and not loading anymore
  if (!loading && adminData && !adminData.isAdmin) {
    return null; // Let useEffect handle redirect
  }

  return (
    <DashboardLayout header={header}>
      {/* Page Content */}
      <div className="text-left mt-10">{children}</div>
    </DashboardLayout>
  );
}
