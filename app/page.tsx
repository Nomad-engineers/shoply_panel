'use client'

import LoginPage from "./login/page";
import { OrdersBoard } from "@/components/orders/orders-board";
import { Spinner } from "@/components/ui";
import { useAuth } from "@/components/hooks/useLogin";

export default function Home() {
  const { adminData, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-main">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!adminData) {
    return <LoginPage />;
  }

  return <OrdersBoard />;
}
