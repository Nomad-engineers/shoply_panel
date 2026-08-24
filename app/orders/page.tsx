
import { Suspense } from "react";
import PanelOrdersPage from "./panel-page";

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Загрузка...</div>}>
      <PanelOrdersPage />
    </Suspense>
  );
}
