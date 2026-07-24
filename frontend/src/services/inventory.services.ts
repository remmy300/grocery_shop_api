import { Product, InventoryResponse, ApiError } from "@/types";
import { fetchJson } from "@/lib/api";
import { toNumber } from "@/utils/formatters";

const stockStatus = (stock: number) => {
  if (stock <= 0) {
    return "Out of Stock";
  }

  if (stock <= 20) {
    return "Low Stock";
  }

  return "In Stock";
};

export const buildInventoryResponse = async (): Promise<InventoryResponse> => {
  const products = await fetchJson<Product[]>("/api/products");

  if (!products.length) {
    throw new ApiError("Unable to load inventory data", 500);
  }

  const inventoryValue = products.reduce(
    (sum, product) => sum + toNumber(product.price) * product.stock,
    0,
  );

  return {
    stats: {
      totalProducts: products.length,
      lowStockItems: products.filter((product) => product.stock <= 20).length,
      inventoryValue,
    },
    products: products.map((product) => ({
      id: product.id,
      sku: `#PRD-${String(product.id).padStart(4, "0")}`,
      name: product.name,
      category: product.category ?? "General Grocery",
      unit: product.unit ?? "pcs",
      stock: product.stock,
      stockStatus: stockStatus(product.stock),
      lowStockThreshold: product.lowStockThreshold,
      price: toNumber(product.price),
      imageUrl: product.imageUrl ?? null,
    })),
  };
};
