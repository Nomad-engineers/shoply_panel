import { OrderStatus } from "./panel-orders.dto";

export interface V2PanelOrdersQueryDto {
  status?: OrderStatus;
  regionId?: number;
  shopId?: number;
  from?: string | Date;
  to?: string | Date;
  page?: number;
  pageSize?: number;
}

export interface CancelOrderDto {
  cancelDescription: string;
}

export interface AddOrderItemDto {
  productId: number;
  quantity: number;
}

export interface UpdateOrderItemDto {
  quantity: number;
  priceAtOrderTime?: number;
}

export interface V2PanelOrderUserDto {
  id: number;
  role: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
}

export interface V2PanelOrderAddressSnapshotDto {
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

export interface V2PanelOrderShopDto {
  id: number;
  name: string;
  description: string | null;
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

export interface V2PanelOrderItemDto {
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

export interface V2PanelOrderLogDto {
  id: number;
  createdAt: string;
  status: OrderStatus;
  userId: number;
  userName: string | null;
  action: string;
  reason: string | null;
  source: string | null;
}

export interface V2PanelOrderDetailDto {
  id: number;
  createdAt: string;
  status: OrderStatus;
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
  items: V2PanelOrderItemDto[];
  addressSnapshot: V2PanelOrderAddressSnapshotDto;
  shop: V2PanelOrderShopDto;
  promocode: unknown;
  user: V2PanelOrderUserDto;
  logs: V2PanelOrderLogDto[];
}

export interface V2PanelOrderDetailResponse {
  data: V2PanelOrderDetailDto;
}

export interface V2PanelOrderItemOperationResponse {
  data: V2PanelOrderDetailDto;
}
