"use client";

import { useRouter} from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { useAuth } from "@/components/hooks/useLogin";
import { Spinner } from "@/components/ui";
import { useEffect } from "react";
import { Link } from "lucide-react";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { adminData, loading } = useAuth(process.env.NEXT_PUBLIC_DIRECTUS_URL);

  useEffect(() => {
    if (!loading && adminData && !adminData.isAdmin) {
      router.replace("/products");
    }
  }, [adminData, loading, router]);

  const header = (
    <div className="flex flex-col">
      <div className="mb-4 mt-10 text-left">
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
         Импорт данных из Excel
        </h1>
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

  

  return (
    <DashboardLayout header={header}>
      {/* Page Content */}
      <div className="text-left mt-10">{children}</div>
    </DashboardLayout>
  );
}
