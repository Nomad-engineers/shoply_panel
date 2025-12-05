"use client";

import { Calendar, Download, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input";

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
      active: pathname === "/reports/couriers",
    },
    {
      name: "Расчет с магазинами",
      href: "/reports/shops",
      active: pathname === "/reports/shops",
    },
    {
      name: "Статистика",
      href: "/reports/statistics",
      active: pathname === "/reports/statistics",
    },
  ];

  return (
    <div className="container mx-auto">
      {/* Tabs Section */}
      <div className="mb-[18px]">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <Link key={tab.href} href={tab.href}>
              <button
                className={`font-medium pb-1 transition-colors ${
                  tab.active
                    ? "text-[#5AC800] border-b-2 border-[#5AC800]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.name}
              </button>
            </Link>
          ))}
        </div>
      </div>
      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
}