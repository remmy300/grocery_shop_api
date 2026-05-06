"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Package, Sparkles, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { ProductView } from "@/types/products";

type Props = {
  product: ProductView;
  related: ProductView[];
};

const stockTone = (status: ProductView["stockStatus"]) => {
  if (status === "In Stock") return "default";
  if (status === "Low Stock") return "secondary";
  return "destructive";
};

export default function ProductDetails({ product, related }: Props) {
  const shortlistHref = `mailto:hello@botanicalarchivist.com?subject=${encodeURIComponent(
    `Shortlist request: ${product.name}`,
  )}&body=${encodeURIComponent(
    `I would like to know more about ${product.name} (${product.sku}).\n\nCategory: ${product.category}\nPrice: $${product.priceValue.toFixed(
      2,
    )}\nAvailability: ${product.stockStatus}`,
  )}`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-screen-2xl px-6 py-10">
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/products"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ← Back to products
          </Link>
        </div>

        {/* PRODUCT MAIN SECTION */}
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* IMAGE */}
          <Card className="overflow-hidden rounded-3xl">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-muted">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Leaf className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* DETAILS */}
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {product.sku}
              </p>

              <h1 className="mt-2 text-4xl font-bold">{product.name}</h1>

              <p className="mt-3 text-muted-foreground">{product.summary}</p>
            </div>

            {/* BADGES */}
            <div className="flex flex-wrap gap-2">
              <Badge>{product.category}</Badge>
              <Badge variant={stockTone(product.stockStatus)}>
                {product.stockStatus}
              </Badge>
            </div>

            {/* PRICE + STOCK */}
            <Card className="rounded-2xl">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-bold text-primary">
                    ${product.priceValue.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock</span>
                  <span className="font-medium">{product.stock}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Origin</span>
                  <span className="font-medium">{product.origin}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sourcing</span>
                  <span className="font-medium text-right">
                    {product.sourcingNote}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* ACTIONS */}
            <div className="flex flex-col gap-3">
              <Button asChild className="rounded-full">
                <Link href={shortlistHref}>Add to shortlist</Link>
              </Button>

              <Button asChild variant="outline" className="rounded-full">
                <Link href="/products">
                  Continue browsing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* INFO BLOCK */}
            <Card className="rounded-2xl">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Archive Notes</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-6">
                  This product is part of a curated regenerative archive. Each
                  item is verified for sourcing quality and seasonal integrity.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Leaf,
              title: "Regenerative sourcing",
              text: "Ethically grown and harvested with soil-first practices.",
            },
            {
              icon: Truck,
              title: "Cold-chain delivery",
              text: "Maintained freshness from farm to delivery.",
            },
            {
              icon: Sparkles,
              title: "Archive standard",
              text: "Only premium verified products are included.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="rounded-2xl">
                <CardContent className="p-5">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.text}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* RELATED */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related products</h2>

          {related.length === 0 ? (
            <p className="text-muted-foreground">No related products found.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <Link key={item.id} href={`/products/${item.id}`}>
                  <Card className="overflow-hidden rounded-2xl hover:shadow-md transition">
                    <CardContent className="p-4">
                      <div className="relative aspect-square bg-muted mb-3">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Leaf className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {item.category}
                      </p>

                      <h3 className="font-semibold">{item.name}</h3>

                      <p className="text-primary font-bold mt-1">
                        ${item.priceValue.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
