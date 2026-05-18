import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  ArrowRight,
  Handshake,
  Leaf,
  Quote,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import ArchiveSubscribeForm from "@/components/home/archiveSubscribeForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchProducts } from "@/lib/products";
import { cn } from "@/lib/utils";

const displayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Botanical Archivist",
  description:
    "An editorial grocery landing page for fresh seasonal harvests and regenerative sourcing.",
};

export const dynamic = "force-dynamic";

const storyCards = [
  {
    title: "Zero-Plastic Logistics",
    description: "Compostable packaging for every delicate harvest.",
    icon: Leaf,
  },
  {
    title: "Direct Equity Sourcing",
    description: "Farmers receive a fair share of the market value.",
    icon: Handshake,
  },
  {
    title: "Quality First",
    description: "Every crate is reviewed for ripeness and texture.",
    icon: ShieldCheck,
  },
];

async function getHomeProducts() {
  try {
    return await fetchProducts();
  } catch (error) {
    console.error("Failed to load homepage products:", error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getHomeProducts();
  const featuredProduct = products[0];
  const harvestProducts = products.slice(1, 5);
  const currentArchiveTitle = featuredProduct?.name ?? "Seasonal Arrivals";
  const currentArchiveDescription = featuredProduct
    ? featuredProduct.sourcingNote
    : "Browse the latest harvest once the archive is refreshed.";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(13,99,27,0.10),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(255,219,207,0.75),_transparent_22%),linear-gradient(180deg,_#faf9f6_0%,_#f7f5ef_100%)] text-foreground">
      <div className="absolute inset-x-0 top-0 h-[28rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(255,255,255,0))]" />

      <div className="relative mx-auto flex max-w-screen-2xl flex-col gap-24 px-6 pb-20 pt-28 md:px-8 lg:pt-32">
        <section className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="relative z-10">
            <Badge
              variant="secondary"
              className="mb-6 rounded-full border-border/60 bg-secondary/70 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.28em]"
            >
              Est. 2024
            </Badge>
            <h1
              className={cn(
                "max-w-3xl text-5xl font-extrabold leading-[0.9] tracking-tighter text-foreground md:text-7xl lg:text-8xl",
                displayFont.className,
              )}
            >
              The Fine Art of{" "}
              <span className="italic text-primary">Freshness.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground md:text-xl">
              Curating organic produce as a living archive of taste, heritage,
              and soil health. Direct from regenerative farms to your table.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link href="/products">
                  Browse Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8"
              >
                <Link href="#journal">View Journal</Link>
              </Button>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                { value: "48", label: "Farm partners" },
                { value: "96%", label: "Seasonal fulfillment" },
                { value: "24h", label: "Fresh delivery" },
              ].map((item) => (
                <Card
                  key={item.label}
                  className="border-border/60 bg-background/80 shadow-sm"
                >
                  <CardContent className="p-4">
                    <p className="font-heading text-2xl font-extrabold tracking-tight">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      {item.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

            <Card className="relative overflow-hidden rounded-[2rem] border-border/50 bg-background/80 shadow-[0_30px_80px_rgba(26,28,28,0.12)]">
              <CardContent className="p-0">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcJ4qFalRgY8IgJA1HMyLfXjpeLKnP2T4Kt3hkb7al6nzKSEGEEG4-PGGi8qfbjzn6p2psYLmUVtwAAYdtsWV8RS6iqguGkLfDwpozi5urJ1LX9oZ11oruZim21z-AUSQoX4QcCdiAZ0_LkEBPCE92eObB1pzW-xr12tlNrtrPyaD_mwkPXP8jp9HKRNj00YBJpGlXU1f72JLZjhCb-QhD6ioFbtovE3SXa_aeio4s7pocqK1DG4gc78L-Dls_5snD6nfb-4tzunY"
                    alt="Editorial arrangement of heirloom tomatoes and greens"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover scale-105 transition-transform duration-700 hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                </div>
              </CardContent>
            </Card>
            <Card className="absolute -bottom-8 left-0 max-w-xs border-border/60 bg-background/95 shadow-xl">
              <CardContent className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-muted-foreground">
                  Current Archive
                </p>
                <p
                  className={cn(
                    "mt-2 text-2xl font-extrabold tracking-tight",
                    displayFont.className,
                  )}
                >
                  {currentArchiveTitle}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {currentArchiveDescription}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="harvest" className="scroll-mt-28">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2
                className={cn(
                  "text-4xl font-extrabold tracking-tighter md:text-5xl",
                  displayFont.className,
                )}
              >
                Seasonal Harvest
              </h2>
              <p className="mt-2 text-muted-foreground">
                Peak maturity. Peak flavor.
              </p>
            </div>
            <Button asChild variant="ghost" className="w-fit px-0 text-primary">
              <Link href="/products">
                Explore Full Library
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {featuredProduct ? (
            <div className="grid gap-6 md:grid-cols-4">
              <Link
                href={`/products/${featuredProduct.id}`}
                className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 md:col-span-2 md:row-span-2"
              >
                <Card className="relative min-h-[32rem] overflow-hidden rounded-[1.75rem] border-border/60">
                  <CardContent className="h-full p-0">
                    <div className="relative h-full min-h-[32rem]">
                      {featuredProduct.imageUrl ? (
                        <Image
                          src={featuredProduct.imageUrl}
                          alt={featuredProduct.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full min-h-[32rem] items-center justify-center bg-muted">
                          <Leaf className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent opacity-90" />
                      <div className="absolute bottom-0 left-0 p-8 text-white">
                        <Badge className="mb-4 rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-secondary-foreground">
                          {featuredProduct.category}
                        </Badge>
                        <h3
                          className={cn(
                            "text-3xl font-extrabold tracking-tight md:text-4xl",
                            displayFont.className,
                          )}
                        >
                          {featuredProduct.name}
                        </h3>
                        <p className="mt-3 max-w-md text-sm leading-6 text-white/85">
                          {featuredProduct.summary}
                        </p>
                        <div className="mt-6 flex items-center justify-between gap-4">
                          <span className="font-heading text-2xl font-bold">
                            ${featuredProduct.priceValue.toFixed(2)}
                          </span>
                          <span className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-primary transition group-hover:bg-secondary group-hover:text-secondary-foreground">
                            View details
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {harvestProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
                >
                  <Card className="overflow-hidden rounded-[1.5rem] border-border/60 bg-background/90 shadow-sm transition-all hover:shadow-lg">
                    <CardContent className="p-4">
                      <div className="mb-4 aspect-square overflow-hidden rounded-[1rem] bg-muted">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={640}
                            height={640}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Leaf className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-heading text-lg font-bold tracking-tight">
                            {product.name}
                          </h3>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                            {product.category}
                          </p>
                        </div>
                        <span className="font-heading text-lg font-bold text-primary">
                          ${product.priceValue.toFixed(2)}
                        </span>
                      </div>
                      <span className="mt-5 inline-flex h-9 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition group-hover:bg-primary/90">
                        View details
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="rounded-[1.5rem] border-border/60 bg-background/90">
              <CardContent className="p-8 text-center">
                <Leaf className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 font-heading text-xl font-bold tracking-tight">
                  No products available
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Check back soon for the next seasonal harvest.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        <section className="grid gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="relative">
            <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
            <Card className="overflow-hidden rounded-[1.75rem] border-border/60 bg-background/90 shadow-[0_24px_70px_rgba(26,28,28,0.08)]">
              <CardContent className="p-0">
                <div className="relative aspect-[4/5]">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAC4IlUAQ0K7CdByLOUk7YjB1zPp9NEwS1y6gxWAK6la2wWkQdX9OQUvNvfeiznf3jHh3VYAaL6ChxSWENRzGwW_za5VM07oc0K5h40wBsCcOr5V5mKGA-JtD0SqFk0gLBIcfLi49ea6TD3km4NesBbExl2mhPlCMAknJyduF6j9r3ObAnuh-KlCS1FLWtt7Aq-jaMWBqDbOBplGwkbMPz-JyUyjB5jPsaF725fjKInWN_hlOKFw0DaVVWzyQAbuFvhXoXAKr8MoE0"
                    alt="Lush regenerative farm at sunrise"
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover grayscale transition-all duration-700 hover:grayscale-0"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div id="philosophy" className="space-y-8 scroll-mt-28">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-muted-foreground">
                Philosophy
              </p>
              <h2
                className={cn(
                  "mt-3 text-4xl font-extrabold tracking-tighter md:text-5xl",
                  displayFont.className,
                )}
              >
                Beyond Organic. <br />
                Regenerative.
              </h2>
            </div>

            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              We do not just shop; we archive. Every provider in our network is
              hand-selected for their commitment to soil restoration and
              biodiversity. The best flavor comes from an ecosystem that is
              balanced and respected.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {storyCards.map((item) => {
                const Icon = item.icon;

                return (
                  <Card
                    key={item.title}
                    className="rounded-[1.25rem] border-border/60 bg-background/90 shadow-sm"
                  >
                    <CardContent className="p-5">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-heading text-lg font-bold tracking-tight">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 rounded-[1.25rem] border border-border/60 bg-background/90 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sprout className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold tracking-tight">
                    Zero-Plastic Logistics
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Compostable mycelium packaging for every delicate harvest.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-[1.25rem] border border-border/60 bg-background/90 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Handshake className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold tracking-tight">
                    Direct Equity Sourcing
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Farmers receive a fair share of the market value of every
                    crop.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="journal"
          className="scroll-mt-28 rounded-[2rem] border border-border/60 bg-background/90 px-6 py-14 shadow-sm md:px-10"
        >
          <div className="mx-auto max-w-4xl text-center">
            <Quote className="mx-auto h-10 w-10 text-primary" />
            <blockquote
              className={cn(
                "mt-8 text-2xl font-extrabold leading-tight italic md:text-4xl",
                displayFont.className,
              )}
            >
              The quality of the Swiss Chard from the mid-August archive was
              unlike anything I have experienced in twenty years of culinary
              practice. It is not food; it is a statement.
            </blockquote>

            <div className="mt-10 flex flex-col items-center">
              <div className="mb-4 h-16 w-16 overflow-hidden rounded-full border-2 border-primary/40 bg-muted">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKNHtLc2IC54zM9MiXF0lzTpJXCTMZLklJrENizKg4uLXrBKPpQEePXSY98YDiYZ-VVhspe0LLeAj5NrY34_9LUy7G3xLsGquaYAjzIvGNCpyZMOM9wYuBqkcXZoTAoSasnGaGLBiNaiPIyGA0bocMRU9OKAHUEAqoGmPh-yLIS_96QQ4PfCuUeqhX7yERnHng0IJ7o50oNfmOhKGJG2vRKTMgEOQIHkTVUhJlApqdnxVpTMX2d1x0BRm5ovrLpHM7mMk7Jjfctlw"
                  alt="Marcus Aurelius Greene"
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="font-heading text-lg font-bold tracking-tight">
                Marcus Aurelius Greene
              </p>
              <p className="mt-1 text-sm uppercase tracking-[0.24em] text-muted-foreground">
                Michelin-Starred Archivist
              </p>
            </div>
          </div>
        </section>

        <section
          id="join"
          className="rounded-[2rem] bg-primary px-6 py-14 text-center text-primary-foreground shadow-[0_24px_70px_rgba(13,99,27,0.24)] md:px-12 md:py-20"
        >
          <div className="mx-auto max-w-3xl">
            <h2
              className={cn(
                "text-4xl font-extrabold tracking-tighter md:text-6xl",
                displayFont.className,
              )}
            >
              Join the Archive.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-primary-foreground/85 md:text-xl">
              Subscribe to our weekly curated harvests and taste the difference
              of true botanical dedication.
            </p>
            <ArchiveSubscribeForm />
          </div>
        </section>
      </div>
    </main>
  );
}
