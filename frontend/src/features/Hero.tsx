"use client";

import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type HeroProps = {
  localCount?: number;
};

export default function Hero({ localCount = 12 }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-surface-variant/50 bg-stone-100">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none 
        [background-image:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.12)_1px,transparent_0)] 
        [background-size:24px_24px]"
      />
      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />

      <div className="relative z-10 mx-auto max-w-screen-2xl px-6 py-24 md:px-8">
        <div className="max-w-3xl">
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator />

                <BreadcrumbItem>
                  <BreadcrumbPage>The Archive</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Heading */}
            <h1 className="mb-8 text-6xl font-extrabold leading-[0.9] tracking-tight md:text-7xl">
              The Seasonal <br />
              <span className="italic text-primary">Archive</span>
            </h1>
          </div>

          {/* Description */}
          <p className="max-w-xl text-xl font-light leading-relaxed text-on-surface-variant">
            A curated collection of regenerative harvests. Every item is traced
            from seed to shelf, preserving the heritage of the land.
          </p>

          {/* Social Proof */}
          <div className="mt-10 flex items-center gap-6">
            <div className="flex -space-x-3">
              {["AC", "VG", "RH"].map((item, i) => (
                <div
                  key={item}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-surface-container-high text-xs font-bold"
                >
                  {item}
                </div>
              ))}
            </div>

            <span className="text-sm text-on-surface-variant">
              Trusted by {localCount}+ local farm cooperatives
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
