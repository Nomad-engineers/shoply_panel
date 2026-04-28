export type PromocodeType = "fixed" | "percent";

export interface PromocodeShop {
  id: number;
  name: string;
  photoId?: string | null;
}

export interface PromocodeRegion {
  id: number;
  name: string;
}

export interface PromocodeAllowedUser {
  userId?: number | null;
  id?: number | null;
  firstName: string | null;
  lastName: string | null;
  phone?: string | null;
  email?: string | null;
  photoId?: string | null;
}

export interface V2AdminPromocodeDto {
  id: number;
  createdAt: string;
  name: string;
  technicalName?: string | null;
  shopId?: number | null;
  shop?: PromocodeShop | null;
  regionIds?: number[] | null;
  regions: PromocodeRegion[];
  allowedUsers: PromocodeAllowedUser[];
  turnover: number;
  usageLimit?: number | null;
  validUntil?: string | null;
  type: PromocodeType;
  valueForType?: number | null;
  activationCount: number;
  minSum: number;
  payFromShop: boolean;
  useMultiple: boolean;
  onlyOneActivation: boolean;
  oneActivation?: boolean | null;
  allowedUserIds?: number[] | null;
}

export type Promocode = V2AdminPromocodeDto;

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
