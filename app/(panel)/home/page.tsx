"use client";

import { DashboardLayout } from "@/components/layout";
import { ShopHomeDashboard } from "@/components/home/shop-home-dashboard";

export default function HomePage() {
  return (
    <DashboardLayout contentClassName="p-4 lg:p-6">
      <div style={{ fontFamily: "var(--font-inter-tight)" }}>
        <ShopHomeDashboard />
      </div>
    </DashboardLayout>
  );
}
