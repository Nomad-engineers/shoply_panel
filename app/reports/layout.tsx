"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { cn } from "@/lib/theme";
import { useAuth } from "@/components/hooks/useLogin";
import { Spinner } from "@/components/ui";
import { useEffect } from "react";

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminData, loading } = useAuth(process.env.NEXT_PUBLIC_DIRECTUS_URL);

  useEffect(() => {
    if (!loading && adminData && !adminData.isAdmin) {
      router.replace("/promotions");
    }
  }, [adminData, loading, router]);

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
      href: "/reports/promotions",
      active: pathname.startsWith("/reports/promotions"),
      disabled: true,
    },
  ];

  const header = (
    <div className="flex flex-col gap-6 mt-22">
      <h1 className="text-[24px] font-bold text-[#111111]">Отчеты</h1>
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const button = (
            <button
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                tab.active
                  ? "bg-[#55CB00] text-white shadow-sm"
                  : "text-[#111111] hover:bg-gray-100",
                (tab as any).disabled && "cursor-default",
              )}
            >
              {tab.name}
            </button>
          );

          if ((tab as any).disabled) {
            return <div key={tab.href}>{button}</div>;
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
