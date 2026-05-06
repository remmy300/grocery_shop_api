import { fetchProductById, fetchProducts } from "@/lib/products";
import ProductDetails from "@/components/products/ProductDetails";

export default async function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);

  const [product, products] = await Promise.all([
    fetchProductById(id),
    fetchProducts(),
  ]);

  if (!product) return null;

  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  return <ProductDetails product={product} related={related} />;
}
