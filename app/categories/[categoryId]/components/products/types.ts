import { ProductMeasure, measureLabels } from "@/types/category.types";

export interface FlattenedProduct {
  uniqueKey: string;
  name: string;
  article: string | null | undefined;
  weight: number;
  measure: ProductMeasure | null | undefined;
  photos?: Array<{ file?: { url?: string } }>;
  activeShopProduct: {
    id: number;
    price: number;
    inStock: boolean;
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
}
