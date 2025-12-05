import { DashboardLayout } from "@/components/layout";

export default function CouriersPaymentsPage() {
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
        <h2 className="text-xl font-semibold mb-4">Выплаты курьерам</h2>

        {/* Здесь будет UI для выплат курьерам */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Курьер #1 - Иванов Иван</span>
              <span className="text-green-600 font-semibold">15,000 ₸</span>
            </div>
            <div className="text-sm text-gray-500">
              15 доставок за период
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Курьер #2 - Петров Петр</span>
              <span className="text-green-600 font-semibold">12,500 ₸</span>
            </div>
            <div className="text-sm text-gray-500">
              12 доставок за период
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Курьер #3 - Сидоров Сидор</span>
              <span className="text-green-600 font-semibold">18,750 ₸</span>
            </div>
            <div className="text-sm text-gray-500">
              18 доставок за период
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Итого к выплате:</span>
            <span className="text-xl font-bold text-green-600">46,250 ₸</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}