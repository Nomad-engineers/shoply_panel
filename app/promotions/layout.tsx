"use client";

import { DashboardLayout } from "@/components/layout";

export default function PromotionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const header = (
    <div className="flex flex-col">
      <div className="mb-6 mt-18 text-left">
        <h1
          style={{
            fontFamily: "Inter",
            fontWeight: 700,
            fontStyle: "Bold",
            fontSize: "24px",
            lineHeight: "24px",
            letterSpacing: "0%",
          }}
        >
          Акции и промокоды
        </h1>
      </div>
    </div>
  );

  return (
    <DashboardLayout header={header}>
      <div className="text-left mt-6">{children}</div>
    </DashboardLayout>
  );
}
