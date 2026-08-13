import { fetchProductById, fetchProducts } from "@/lib/products";
import ProductDetails from "@/components/products/ProductDetails";
import { fetchServerSettings } from "@/lib/settings";

export default async function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);

  const [product, products, settings] = await Promise.all([
    fetchProductById(id),
    fetchProducts(),
    fetchServerSettings().catch(() => null),
  ]);

  if (!product) return null;

  const visible = settings?.hideOutOfStock
    ? products.filter((p) => p.stock > 0)
    : products;

  const related = visible
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  return <ProductDetails product={product} related={related} />;
}
