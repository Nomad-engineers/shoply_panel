"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui";

export default function ReportsPage() {
  const router = useRouter();

  useEffect(() => {
    // Перенаправляем на страницу выплат курьерам по умолчанию
    router.replace("/reports/couriers");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size={40} />
    </div>
  );
}
