import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Beef,
  Coffee,
  Croissant,
  Droplets,
  Leaf,
  Package,
  ShoppingBasket,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/products/productCard";
import NewsletterForm from "@/components/NewsletterForm";
import { fetchProducts } from "@/lib/products";
import { fetchServerSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Corner Store — Fresh Groceries Delivered",
  description: "Shop fresh groceries online. Fast delivery, great prices.",
};

export const dynamic = "force-dynamic";

const CATEGORIES = [
  {
    label: "Fruits & Vegetables",
    icon: Leaf,
    href: "/products?category=Fruits+%26+Vegetables",
    color: "bg-green-50 text-green-700 border-green-200",
  },
  {
    label: "Dairy & Eggs",
    icon: Droplets,
    href: "/products?category=Dairy+%26+Eggs",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    label: "Meat & Poultry",
    icon: Beef,
    href: "/products?category=Meat+%26+Poultry",
    color: "bg-red-50 text-red-700 border-red-200",
  },
];

const HOMEPAGE_PRODUCT_LIMIT = 8;

async function getProducts() {
  try {
    const settings = await fetchServerSettings().catch(() => null);
    const products = await fetchProducts();
    const visible = settings?.hideOutOfStock
      ? products.filter((p) => p.stock > 0)
      : products;
    return visible.slice(0, HOMEPAGE_PRODUCT_LIMIT);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-[#faf9f6]">
      <div className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        {/* ── HERO ──────────────────────────────────────────────── */}
        <section className="relative my-6 overflow-hidden rounded-3xl">
          <Image
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=80"
            alt="Fresh groceries"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/45" />

          <div className="relative z-10 flex flex-col gap-4 px-8 py-16 md:py-24 lg:max-w-[60%]">
            <Badge className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
              Fresh Today
            </Badge>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
              Groceries delivered to your door
            </h1>
            <p className="max-w-md text-base text-white/80">
              Fresh produce, dairy, meat and more — sourced locally and
              delivered fast.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white text-primary hover:bg-white/90"
              >
                <Link href="/products">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/50 bg-white/10 text-white hover:bg-white/20"
              >
                <Link href="/products">Browse Categories</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── CATEGORY QUICKLINKS  */}
        <section className="my-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Shop by Category
            </h2>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              All products <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {CATEGORIES.map(({ label, icon: Icon, href, color }) => (
              <Link
                key={label}
                href={href}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md ${color}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── PRODUCTS GRID  */}
        <section className="my-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Fresh Today
              </h2>
              <p className="text-sm text-muted-foreground">
                In stock and ready to order
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/products">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-background/90 p-12 text-center">
              <ShoppingBasket className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-4 font-semibold text-foreground">
                No products available yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Check back soon.
              </p>
            </div>
          )}
        </section>

        {/* ── NEWSLETTER STRIP  */}
        <section className="my-10 rounded-3xl bg-primary px-6 py-10 text-center text-primary-foreground md:px-12">
          <h2 className="text-2xl font-extrabold tracking-tight">
            Get weekly deals in your inbox
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/80">
            New arrivals, discounts and seasonal picks — straight to you.
          </p>
          <div className="mt-6">
            <div className="flex justify-center">
              <NewsletterForm
                variant="light"
                placeholder="Your email address"
                buttonLabel="Subscribe"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
