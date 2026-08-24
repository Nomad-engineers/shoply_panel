/**
 * Orders Page - Integrated with Panel API
 *
 * This page uses the new panel orders API with filters and pagination.
 */

import { Suspense } from "react";
import PanelOrdersPage from "./panel-page";

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Загрузка...</div>}>
      <PanelOrdersPage />
    </Suspense>
  );
}

// Legacy implementation (OrdersBoard) is no longer used
// import { OrdersBoard } from "@/components/orders/orders-board";
// export default function OrdersPage() {
//   return <OrdersBoard />;
// }
