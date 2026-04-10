export type PromocodeType = "fixed" | "percent";

export interface PromocodeShop {
  id: number;
  name: string;
  photoId?: string | null;
}

export interface PromocodeAllowedUser {
  id: number;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
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
  minSum?: number | null;
  payFromShop?: boolean | null;
  onlyOneActivation?: boolean | null;
  allowedUsers?: PromocodeAllowedUser[] | null;
  allowedUserIds?: number[] | null;
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
