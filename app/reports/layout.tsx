"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/layout";

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Выплаты курьерам",
      href: "/reports/couriers",
      value: "couriers",
      active: pathname.startsWith("/reports/couriers"),
    },
    {
      name: "Расчет с магазинами",
      href: "/reports/shops",
      value: "shops",
      active: pathname.startsWith("/reports/shops"),
    },
    {
      name: "Статистика",
      href: "/reports/statistics",
      value: "statistics",
      active: pathname.startsWith("/reports/statistics"),
    },
  ];

  const header = (
    <div className="flex flex-col">
      {/* Header Section */}
      <div className="mb-6 mt-18 text-left">
        <h1
          style={{
            fontFamily: 'Inter',
            fontWeight: 700,
            fontStyle: 'Bold',
            fontSize: '24px',
            lineHeight: '24px',
            letterSpacing: '0%'
          }}
        >
          Отчеты
        </h1>
      </div>
      {/* Tabs Section */}
      <div className="text-left">
        <div className="inline-flex h-12 items-left justify-start  p-1 gap-2 ">
          {tabs.map((tab) => (
            <Link key={tab.href} href={tab.href}>
              <button
                className={`inline-flex items-left justify-start whitespace-nowrap rounded-xl px-4 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-left ${
                  tab.active
                    ? "text-white bg-primary shadow-sm hover:bg-primary/90"
                    : " hover:text-foreground hover:bg-surface"
                }`}
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontStyle: 'Semi Bold',
                  fontSize: '16px',
                  lineHeight: '18px',
                  letterSpacing: '-0.4px',
                  textAlign: 'left'
                }}
              >
                {tab.name}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout header={header}>
      {/* Page Content */}
      <div className="text-left mt-6">{children}</div>
    </DashboardLayout>
  );
}