import type { AdminOrder } from "@/types/admin-order";

const now = new Date();

function iso(minutesAgo: number) {
  return new Date(now.getTime() - minutesAgo * 60_000).toISOString();
}

let seq = 100;

function makeOrder(overrides: Partial<AdminOrder>): AdminOrder {
  const id = ++seq;

  return {
    id,
    createdAt: iso(5 + id),
    status: "pending",
    isCancelled: false,
    cancelDescription: null,
    canceledBy: null,
    paymentMethod: "cash",
    currency: "RUB",
    exchangeRate: 1,
    subtotalPrice: 1100,
    totalPrice: 1200,
    deliveryCost: 100,
    serviceFee: 50,
    discountAmount: 0,
    dailyOrderNumber: 60 + (id % 40),
    commissionService: 60,
    code: 1234,
    comment: "",
    items: [
      {
        id,
        createdAt: iso(60),
        productId: 1,
        quantity: 2,
        priceAtOrderTime: 400,
        productName: "Хлеб",
        productWeight: 400,
        productMeasure: "г",
        inStock: true,
        photoId: null,
        categoryId: 1,
        subcategoryId: 1,
      },
      {
        id: id + 1000,
        createdAt: iso(60),
        productId: 2,
        quantity: 1,
        priceAtOrderTime: 300,
        productName: "Молоко",
        productWeight: 1,
        productMeasure: "л",
        inStock: true,
        photoId: null,
        categoryId: 2,
        subcategoryId: 2,
      },
    ],
    addressSnapshot: {
      id,
      fullAddress: "Титова 14, кв 56",
      city: "Байконур",
      streetType: "ул",
      street: "Титова",
      house: "14",
      flat: 56,
      entrance: 2,
      latitude: 45.6,
      longitude: 63.3,
    },
    shop: {
      id: 1,
      name: "Болашак",
      description: "Продукты повседневного спроса",
      type: "grocery",
      supportPhone: "+7 700 000 00 01",
      photoId: null,
      deliveryCost: 100,
      deliveryTime: 40,
      serviceFee: 50,
      freeDeliveryThreshold: 5000,
      workTimeStart: "08:00",
      workTimeEnd: "23:00",
      tempClosedFrom: null,
      tempClosedUntil: null,
    },
    deliveryMan: null,
    promocode: null,
    user: {
      id: 10,
      role: "client",
      firstName: "Айгерим",
      lastName: "Смит",
      phone: "+7 701 111 22 33",
      email: null,
    },
    logs: [],
    shoplyIncome: 160,
    courierIncome: 100,
    ...overrides,
  };
}

const courierIvan = {
  id: 7,
  onShift: true,
  isVerified: true,
  deliveryType: "bike",
  user: {
    id: 70,
    role: "courier",
    firstName: "Иван",
    lastName: "Курьеров",
    phone: "+7 702 333 44 55",
    email: null,
  },
};

const courierAsel = {
  ...courierIvan,
  id: 8,
  user: { ...courierIvan.user, id: 71, firstName: "Асель", lastName: "Быстрая" },
};

export const MOCK_ACTIVE_ORDERS: AdminOrder[] = [
  makeOrder({ status: "pending" }),
  makeOrder({ status: "pending", totalPrice: 2450, subtotalPrice: 2350, dailyOrderNumber: 61 }),
  makeOrder({ status: "pending", totalPrice: 890, subtotalPrice: 790, dailyOrderNumber: 62 }),
  makeOrder({ status: "assembling", deliveryMan: courierIvan }),
  makeOrder({ status: "assembling", totalPrice: 3100, subtotalPrice: 3000, dailyOrderNumber: 63 }),
  makeOrder({ status: "ready", deliveryMan: courierAsel, totalPrice: 1560 }),
  makeOrder({ status: "ready", totalPrice: 640, dailyOrderNumber: 64 }),
  makeOrder({ status: "ready", totalPrice: 2050, subtotalPrice: 1950 }),
  makeOrder({ status: "delivery", deliveryMan: courierIvan, totalPrice: 1780 }),
  makeOrder({ status: "delivery", deliveryMan: courierAsel, totalPrice: 990, dailyOrderNumber: 65 }),
  makeOrder({ status: "completing", totalPrice: 1320, comment: "Позвонить за 10 минут" }),
];

export const MOCK_FINISHED_ORDERS: AdminOrder[] = [
  makeOrder({
    status: "completed",
    totalPrice: 1200,
    comment: "Оставить у двери",
    deliveryMan: courierIvan,
  }),
  makeOrder({
    status: "cancelled",
    isCancelled: true,
    canceledBy: "client",
    cancelDescription: "Передумал",
    totalPrice: 800,
  }),
  makeOrder({
    status: "completed",
    totalPrice: 4300,
    subtotalPrice: 4200,
    deliveryMan: courierAsel,
  }),
  makeOrder({
    status: "cancelled",
    isCancelled: true,
    canceledBy: "shop",
    cancelDescription: "Нет товара в наличии",
    totalPrice: 1500,
  }),
  makeOrder({ status: "completed", totalPrice: 2650, deliveryMan: courierIvan }),
  makeOrder({ status: "completed", totalPrice: 700, deliveryMan: courierAsel }),
];
