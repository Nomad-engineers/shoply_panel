export type AdminOrderStatus =
  | "pending"
  | "assembling"
  | "ready"
  | "delivery"
  | "completing"
  | "completed"
  | "cancelled";

export interface AdminOrderUser {
  id: number;
  role: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
}

export interface AdminOrderDeliveryMan {
  id: number;
  onShift: boolean;
  isVerified: boolean;
  deliveryType: string;
  user: AdminOrderUser;
}

export interface AdminOrderItem {
  id: number;
  createdAt: string;
  productId: number;
  quantity: number;
  priceAtOrderTime: number;
  productName: string;
  productWeight: number;
  productMeasure: string;
  inStock: boolean;
  photoId: string | null;
  categoryId: number | null;
  subcategoryId: number | null;
}

export interface AdminOrderAddressSnapshot {
  id: number;
  fullAddress: string | null;
  city: string | null;
  streetType: string | null;
  street: string | null;
  house: string | null;
  flat: number | null;
  entrance: number | null;
  latitude: number;
  longitude: number;
}

export interface AdminOrderShop {
  id: number;
  name: string;
  description: string;
  type: string;
  supportPhone: string;
  photoId: string | null;
  deliveryCost: number;
  deliveryTime: number;
  serviceFee: number;
  freeDeliveryThreshold: number;
  workTimeStart: string;
  workTimeEnd: string;
  tempClosedFrom: string | null;
  tempClosedUntil: string | null;
}

export interface AdminOrderLog {
  id: number;
  createdAt: string;
  status: AdminOrderStatus;
  userId: number;
  action: string;
  reason: string | null;
  source: string | null;
}

export interface AdminOrder {
  id: number;
  createdAt: string;
  status: AdminOrderStatus;
  isCancelled: boolean;
  cancelDescription: string | null;
  canceledBy: string | null;
  paymentMethod: string;
  currency: string;
  exchangeRate: number;
  subtotalPrice: number;
  totalPrice: number;
  deliveryCost: number;
  serviceFee: number;
  discountAmount: number;
  dailyOrderNumber: number;
  commissionService: number;
  code: number;
  comment: string;
  items: AdminOrderItem[];
  addressSnapshot: AdminOrderAddressSnapshot;
  shop: AdminOrderShop;
  deliveryMan: AdminOrderDeliveryMan | null;
  promocode: unknown;
  user: AdminOrderUser;
  logs: AdminOrderLog[];
  shoplyIncome: number;
  courierIncome: number;
}

export interface AdminOrdersMeta {
  total: number;
  pageCount: number;
  page: number;
}

export interface AdminOrdersResponse {
  data: AdminOrder[];
  meta: AdminOrdersMeta;
}
