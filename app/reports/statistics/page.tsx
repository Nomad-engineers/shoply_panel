import { DashboardLayout } from "@/components/layout";

export default function StatisticsPage() {
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
      <div className="space-y-6">
        {/* Статистические карточки */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Всего заказов</div>
            <div className="text-2xl font-bold text-gray-900">1,234</div>
            <div className="text-sm text-green-600">+12% vs прошлый период</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Общий доход</div>
            <div className="text-2xl font-bold text-gray-900">2,456,789 ₸</div>
            <div className="text-sm text-green-600">+8% vs прошлый период</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Активные курьеры</div>
            <div className="text-2xl font-bold text-gray-900">45</div>
            <div className="text-sm text-red-600">-3% vs прошлый период</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Активные магазины</div>
            <div className="text-2xl font-bold text-gray-900">128</div>
            <div className="text-sm text-green-600">+5% vs прошлый период</div>
          </div>
        </div>

        {/* График и таблицы */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Заказы по дням</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <div>График заказов</div>
                <div className="text-sm">Здесь будет график</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Топ категории</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Еда и напитки</span>
                <span className="font-semibold">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '45%'}}></div>
              </div>

              <div className="flex justify-between items-center">
                <span>Аптеки</span>
                <span className="font-semibold">23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '23%'}}></div>
              </div>

              <div className="flex justify-between items-center">
                <span>Супермаркеты</span>
                <span className="font-semibold">18%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{width: '18%'}}></div>
              </div>

              <div className="flex justify-between items-center">
                <span>Другое</span>
                <span className="font-semibold">14%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-500 h-2 rounded-full" style={{width: '14%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}