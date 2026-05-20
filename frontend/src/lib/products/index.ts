import { BackendProduct } from "@/types";
import { ProductView } from "@/types/products";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

const toNumber = (value: number | string | null | undefined) => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const productCategory = (name: string) => {
  const lower = name.toLowerCase();

  if (/(milk|cheese|yogurt|butter|cream|dairy)/.test(lower)) {
    return "Dairy";
  }

  if (/(bread|cake|pastry|deli|bakery)/.test(lower)) {
    return "Bakery & Deli";
  }

  if (
    /(apple|banana|orange|berry|carrot|lettuce|tomato|avocado|fruit|produce|vegetable)/.test(
      lower,
    )
  ) {
    return "Produce";
  }

  return "General Grocery";
};

export const productOrigin = (category: string) => {
  switch (category) {
    case "Produce":
      return "Local (20mi)";
    case "Bakery & Deli":
      return "Heritage";
    case "Dairy":
      return "Regional";
    default:
      return "Regional";
  }
};

export const stockStatus = (stock: number) => {
  if (stock <= 0) {
    return "Out of Stock";
  }

  if (stock <= 20) {
    return "Low Stock";
  }

  return "In Stock";
};

const buildSummary = (category: string, stock: number) => {
  const suffix = stock > 1 ? "units" : "unit";

  switch (category) {
    case "Produce":
      return "Harvested at peak ripeness for bright, crisp flavor.";
    case "Dairy":
      return "Handled in a cool chain to preserve texture and freshness.";
    case "Bakery & Deli":
      return "Prepared in small batches with a soft crumb and warm finish.";
    default:
      return `Curated pantry staple with ${stock} ${suffix} available right now.`;
  }
};

const buildSourcingNote = (category: string) => {
  switch (category) {
    case "Produce":
      return "Picked from regenerative farms and delivered quickly.";
    case "Dairy":
      return "Chilled at source and tracked through the cold chain.";
    case "Bakery & Deli":
      return "Baked and packed for same-day freshness.";
    default:
      return "Selected for quality, value, and dependable shelf life.";
  }
};

export const normalizeProduct = (product: BackendProduct): ProductView => {
  const category = product.category || productCategory(product.name);
  const stock = product.stock;
  const priceValue = toNumber(product.price);
  const id = product.id;

  return {
    id,
    name: product.name,
    slug: `product-${id}`,
    sku: `#PRD-${String(product.id).padStart(4, "0")}`,
    category,
    origin: productOrigin(category),
    priceValue,
    price: priceValue.toFixed(2),
    stock,
    stockStatus: stockStatus(stock),
    summary: buildSummary(category, stock),
    description: buildSummary(category, stock),
    sourcingNote: buildSourcingNote(category),
    imageUrl: product.imageUrl || undefined,
    createdAt: undefined,
    updatedAt: undefined,
  };
};

const fetchJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const fallback = `Request failed with status ${response.status}`;
    try {
      const payload = (await response.json()) as { message?: string };
      throw new Error(payload.message || fallback);
    } catch {
      throw new Error(fallback);
    }
  }

  return (await response.json()) as T;
};

export const fetchProducts = async (): Promise<ProductView[]> => {
  const products = await fetchJson<BackendProduct[]>("/api/products");
  return products.map(normalizeProduct);
};

export const fetchProductById = async (
  id: number,
): Promise<ProductView | null> => {
  try {
    const product = await fetchJson<BackendProduct>(`/api/products/${id}`);
    return normalizeProduct(product);
  } catch {
    return null;
  }
};
