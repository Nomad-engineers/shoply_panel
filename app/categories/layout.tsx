"use client";
import React, { Suspense } from "react";
import { DashboardLayout } from "@/components/layout";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CategoryHeader } from "@/components/category/header";

function CategoryLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isCategoriesRoot = pathname === "/categories";
  const isCategoryFlow = pathname.startsWith("/categories");
  const activeTab =
    (searchParams.get("tab") as "active" | "archived") || "active";

  const setActiveTab = (tab: "active" | "archived") => {
    if (tab === "archived") {
      router.replace(`/categories?tab=archived`);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <DashboardLayout
      header={
        isCategoryFlow ? (
          <CategoryHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        ) : undefined
      }
      headerClassName="z-20 flex h-[72px] items-center justify-between bg-background-surface px-8 pl-4 pr-8"
      contentClassName={isCategoryFlow ? "min-h-0 p-0" : undefined}
    >
      {children}
    </DashboardLayout>
  );
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLayout>{children}</DashboardLayout>}>
      <CategoryLayoutContent>{children}</CategoryLayoutContent>
    </Suspense>
  );
}
