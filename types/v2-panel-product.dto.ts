export interface V2PanelProductDto {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  price: number;
  purchasePrice: number;
  inStock: boolean;
  weight: number;
  measure: string;
  archivedAt: string | null;
  customOrderId: number;
  photoId: string | null;
}

export interface V2PanelProductsMetaDto {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface V2PanelProductsResponseDto {
  timestamp: string;
  data: V2PanelProductDto[];
  meta?: V2PanelProductsMetaDto;
}

export interface V2PanelProductsQueryDto {
  page?: number;
  pageSize?: number;
  shopId?: number;
}

export const measureTranslations: Record<string, string> = {
  liter: "л",
  milliliter: "мл",
  kilogram: "кг",
  gram: "г",
  piece: "шт",
};
