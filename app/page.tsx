"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Перенаправляем на страницу выплат курьерам по умолчанию
    router.replace("/reports/couriers");
  }, [router]);

  return (
    <div className="flex items-left justify-left min-h-screen">
      <div className="text-left">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Загрузка...</p>
      </div>
    </div>
  );
}
