'use client'

type Props = { payoutsData: any };

const PayoutsTable: React.FC<Props> = ({ payoutsData }) => (
  <div className="mt-10">
    <h2 className="text-xl font-semibold mb-4">Результаты</h2>
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-3 border">№</th>
          <th className="p-3 border">ID заказа</th>
          <th className="p-3 border">Дата, время</th>
          <th className="p-3 border">Магазин</th>
          <th className="p-3 border">Оплата</th>
          <th className="p-3 border">Корзина</th>
          <th className="p-3 border">Доставка</th>
          <th className="p-3 border">Ставка</th>
          <th className="p-3 border">Комиссия</th>
        </tr>
      </thead>
      <tbody>
        {payoutsData.orders.map((order: any, index: number) => (
          <tr key={order.id} className="border">
            <td className="p-3 border">{index + 1}</td>
            <td className="p-3 border">{order.id}</td>
            <td className="p-3 border">{new Date(order.createdAt).toLocaleString('ru-RU')}</td>
            <td className="p-3 border">{order.shop || '-'}</td>
            <td className="p-3 border">{order.paymentMethod}</td>
            <td className="p-3 border">{order.subtotalPrice}</td>
            <td className="p-3 border">{order.deliveryCost}</td>
            <td className="p-3 border">{order.deliveryCommission}</td>
            <td className="p-3 border">{order.commissionService}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default PayoutsTable;
