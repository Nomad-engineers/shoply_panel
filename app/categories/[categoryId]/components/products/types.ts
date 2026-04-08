import { ProductMeasure, measureLabels } from "@/types/category.types";

export interface FlattenedProduct {
  uniqueKey: string;
  createdAt: string;
  name: string;
  barcodes: string[];
  weight: number;
  measure: ProductMeasure | null | undefined;
  photos?: Array<{ file?: { url?: string } }>;
  subCategoryId: number;
  subCategoryName: string;
  activeShopProduct: {
    id: number;
    price: number;
    inStock: boolean;
    archivedAt: string;
    shop: {
      id: number;
      name: string;
    };
  };
}

export interface SubCategoryWithFlattened {
  id: number;
  name: string;
  products: FlattenedProduct[];
  displayCount: number;
  isArchived: boolean;
}
