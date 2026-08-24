
export enum OrderStatus {
  PENDING = "pending",
  ASSEMBLING = "assembling",
  READY = "ready",
  DELIVERY = "delivery",
  COMPLETING = "completing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export type UserRoles = "admin" | "shop" | "client" | "user";

export interface V2PanelOrdersQueryDto {
  status?: OrderStatus;
  regionId?: number;
  shopId?: number;
  from?: string | Date;
  to?: string | Date;
  page?: number; // default: 1
  pageSize?: number; // default: 20
}

export interface AddressSnapshotDto {
  street: string;
  house: string | null;
  flat: number;
}

export interface PanelOrderDto {
  id: number;
  createdAt: string | Date;
  dailyOrderNumber: number;
  shopName: string;
  totalPrice: number;
  currency: string;
  canceledBy: UserRoles | null;
  isCancelled: boolean;
  status: OrderStatus;
  address: AddressSnapshotDto;
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PanelOrderPaginatedResponseDto {
  data: PanelOrderDto[];
  meta: PaginationMeta;
}
