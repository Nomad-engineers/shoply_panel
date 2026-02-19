"use client";
import React from "react";
import { DashboardLayout } from "@/components/layout";

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <div>
        {children}
      </div>
    </DashboardLayout>
  );
}