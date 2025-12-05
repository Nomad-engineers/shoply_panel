"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
      active: pathname === "/reports/couriers",
    },
    {
      name: "Расчет с магазинами",
      href: "/reports/shops",
      value: "shops",
      active: pathname === "/reports/shops",
    },
    {
      name: "Статистика",
      href: "/reports/statistics",
      value: "statistics",
      active: pathname === "/reports/statistics",
    },
  ];

  
  return (
    <div className="container mx-auto">
      {/* Header Section */}
      <div className="mb-6 ml-6 mt-6 text-left">
        <h1
          style={{
            fontFamily: 'Inter Tight',
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
      <div className="mb-[18px] text-left ml-6">
        <div className="inline-flex h-12 items-left justify-start rounded-lg bg-surface-light p-1 gap-2">
          {tabs.map((tab) => (
            <Link key={tab.href} href={tab.href}>
              <button
                className={`inline-flex items-left justify-start whitespace-nowrap rounded-md px-4 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-left ${
                  tab.active
                    ? "text-white bg-primary shadow-sm hover:bg-primary/90"
                    : "text-muted hover:text-foreground hover:bg-surface"
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
      {/* Page Content */}
      <div className="text-left ml-6">{children}</div>
    </div>
  );
}