export type PromocodeType = "fixed" | "percent";

export interface PromocodeShop {
  id: number;
  name: string;
  photoId?: string | null;
}

export interface Promocode {
  id: number;
  createdAt: string;
  name: string;
  technicalName?: string | null;
  shop?: PromocodeShop | null;
  turnover: number;
  usageLimit?: number | null;
  validUntil?: string | null;
  type: PromocodeType;
  valueForType?: number | null;
  activationCount: number;
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
