import { DashboardLayout } from "@/components/layout";

export default function ShopsSettlementsPage() {
  return (
    <DashboardLayout
      header={
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Отчеты
          </h1>
        </div>
      }
    >
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Расчет с магазинами</h2>

        {/* Здесь будет UI для расчетов с магазинами */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Магазин "Glovo Store"</span>
              <span className="text-blue-600 font-semibold">125,000 ₸</span>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              45 заказов • Комиссия 15%
            </div>
            <div className="flex justify-between text-sm">
              <span>Доход: 147,058 ₸</span>
              <span>Комиссия: 22,058 ₸</span>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Магазин "Food Market"</span>
              <span className="text-blue-600 font-semibold">87,500 ₸</span>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              28 заказов • Комиссия 12%
            </div>
            <div className="flex justify-between text-sm">
              <span>Доход: 99,432 ₸</span>
              <span>Комиссия: 11,932 ₸</span>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Магазин "Pharmacy Plus"</span>
              <span className="text-blue-600 font-semibold">65,000 ₸</span>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              35 заказов • Комиссия 10%
            </div>
            <div className="flex justify-between text-sm">
              <span>Доход: 72,222 ₸</span>
              <span>Комиссия: 7,222 ₸</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Итого к выплате магазинам:</span>
            <span className="text-xl font-bold text-blue-600">277,500 ₸</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}