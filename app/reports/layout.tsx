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
    <div className="flex w-full items-center gap-8">
      <h1 className="text-[28px] font-bold leading-none text-[#111322]">
        Отчеты
      </h1>
      <div className="flex items-center gap-5">
        {tabs.map((tab) => {
          const isDisabled = !tab.href;
          const button = (
            <button
              type="button"
              disabled={isDisabled}
              aria-disabled={isDisabled}
              className={cn(
                "inline-flex items-center px-0 text-[20px] font-semibold leading-none transition-colors",
                tab.active
                  ? "text-text-primary"
                  : "text-[#23263a] hover:text-text-primary",
                isDisabled &&
                  "cursor-not-allowed text-[#23263a]/40 hover:text-[#23263a]/40",
              )}
            >
              <span
                className={cn(
                  "relative inline-flex items-center",
                  tab.active &&
                    "after:absolute after:inset-x-0 after:-bottom-[8px] after:h-[2px] after:rounded-full after:bg-[#55CB00] after:content-['']",
                )}
              >
                {tab.name}
              </span>
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
    <DashboardLayout
      header={header}
      headerClassName="pl-4 pr-8"
      contentClassName="min-h-0 p-0"
    >
      {/* Page Content */}
      <div className="min-h-0 flex-1 text-left">{children}</div>
    </DashboardLayout>
  );
}
