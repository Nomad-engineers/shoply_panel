export type PromocodeType = "fixed" | "percent";

export interface PromocodeShop {
  id: number;
  createdAt: string;
  shop?: {
    id: number;
    name?: string;
    photo?: { url?: string | null } | null;
  } | null;
}

export interface PromocodeOrder {
  id: number;
  subtotalPrice?: number;
  createdAt?: string;
}

export interface Promocode {
  id: number;
  createdAt: string;
  type: PromocodeType;
  valueForType: number;
  usageLimit: number | null;
  validUntil: string | null;
  useMultiple: boolean;
  payFromShop: boolean;
  name: string;
  technicalName: string;
  minSum: number;
  orders: PromocodeOrder[];
  promocodeShop: PromocodeShop[];
}

export interface PaginatedMeta {
  total: number;
  pageCount: number;
  page: number;
}

export interface PromocodesResponse {
  timestamp: string;
  data: Promocode[];
  meta: PaginatedMeta;
}
