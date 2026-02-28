import { Barcode } from "lucide-react";
import { Shop } from "./shop";

export enum ProductMeasure {
  LITER = "liter",
  ML = "ml",
  KG = "kg",
  GRAM = "gram",
  PIECE = "pc", // Штука (ШТ)
  UNIT = "unit", // Единица (ЕД)
  PACK = "pack", // Пачка (ПАЧ)
  BOTTLE = "bottle",
  METER = "m",
  COND_UNIT = "cu", // Условная единица (УСЛ ЕД)
}
export const measureLabels: Record<ProductMeasure, string> = {
  [ProductMeasure.LITER]: "л",
  [ProductMeasure.ML]: "мл",
  [ProductMeasure.KG]: "кг",
  [ProductMeasure.GRAM]: "г",
  [ProductMeasure.PIECE]: "шт",
  [ProductMeasure.UNIT]: "ед",
  [ProductMeasure.PACK]: "пач",
  [ProductMeasure.BOTTLE]: "бут",
  [ProductMeasure.METER]: "м",
  [ProductMeasure.COND_UNIT]: "усл ед",
};

export interface Product {
  id: number;
  name: string;
  weight: number;
  createdAt: string;
  measure: ProductMeasure;
  article: string;
  barcodes: string[];
  subCategory: SubCategory;
  photos?: ProductPhoto[];
  shopProduct: ShopProduct[];
}
export interface ProductPhoto {
  id: number;
  cretedAt: string;
  file: PhotoFile;
}
interface PhotoFile {
  id: number;
  url: string;
}

export interface SubCategory {
  id: number;
  name: string;
  category: Category;
  products?: Product[];
  photo?: {
    id: string;
    url: string;
    filename_download: string;
  } | null;
  customOrderId: number;
}

export interface Category {
  id: number;
  name: string;
  photo?: {
    id: string;
    url: string;
    filename_download: string;
  } | null;
  subCategory?: SubCategory[];
  customOrderId: number;
}

export interface ShopProduct {
  id: number;
  shop: Shop;
  purchasePrice: number;
  inStock: boolean;
  product: Product;
  archivedAt: string;
  price: number;
}
