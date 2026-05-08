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
  price?: string;
  stock: number;
  stockStatus: StockStatus;
  summary: string;
  description?: string;
  sourcingNote: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// types/filter.ts

export type ProductFiltersState = {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;

  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;

  origin: string;
  setOrigin: React.Dispatch<React.SetStateAction<string>>;

  maxPrice: number;
  setMaxPrice: React.Dispatch<React.SetStateAction<number>>;

  sort: string;
  setSort: React.Dispatch<React.SetStateAction<string>>;

  reset: () => void;
};
