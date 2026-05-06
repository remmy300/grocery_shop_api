export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type ProductOrigin = "Local (20mi)" | "Regional" | "Heritage" | string;

export type ProductCategory = string;

export interface ProductView {
  id: string;
  name: string;
  slug?: string;
  sku: string;

  category: ProductCategory;
  origin: ProductOrigin;

  priceValue: number;
  priceFormatted?: string;
  stock: number;
  stockStatus: StockStatus;
  summary: string;
  description?: string;
  sourcingNote: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
