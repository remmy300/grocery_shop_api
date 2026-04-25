"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, formatCurrency } from "@/lib/api";
import { CsvExportButton } from "@/components/CsvExportButton";
import { AnalyticsResponse } from "@/types";

const AnalyticsCharts = dynamic(
  () => import("@/components/admin/AnalyticsCharts"),
  {
    ssr: false,
    loading: () => <AnalyticsChartsSkeleton />,
  },
);

function AnalyticsChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="bg-surface-container-lowest shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6 space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </CardContent>
      </Card>
      <Card className="bg-surface-container-lowest shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-52" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const AnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<6 | 3 | 1>(6);

  useEffect(() => {
    let active = true;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<AnalyticsResponse>(
          "/api/admin/analytics",
        );
        if (!active) return;
        setData(response);
        setError(null);
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load analytics",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      active = false;
    };
  }, []);

  const visibleRetentionData = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.retentionData.slice(-range);
  }, [data, range]);

  const rangeLabel =
    range === 6 ? "Last 6 Months" : range === 3 ? "Last 3 Months" : "Last Month";

  const cycleRange = () => {
    setRange((current) => (current === 6 ? 3 : current === 3 ? 1 : 6));
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-secondary-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error || "Unable to load analytics"}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-heading font-extrabold tracking-tighter text-foreground">
            Market Analytics
          </h1>
          <p className="text-secondary-foreground font-medium tracking-tight">
            Visualizing harvest trends and growth patterns.
          </p>
        </div>
        <div className="flex gap-3">
          <CsvExportButton
            rows={data.categoryData}
            columns={[
              { header: "Category", value: (row) => row.name },
              { header: "Share", value: (row) => row.value },
            ]}
            filename={`analytics-category-${rangeLabel
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
            className="rounded-full bg-surface-container-high px-6 py-2.5 text-sm font-semibold text-primary transition-transform hover:scale-95"
          >
            Export Report
          </CsvExportButton>
          <Button
            onClick={cycleRange}
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-95"
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {rangeLabel}
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="flex flex-col items-center p-5 text-center">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-green-500/10 p-2 text-green-600">
                <DollarSign className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
            <h3 className="mb-1 text-xs uppercase tracking-widest text-secondary-foreground">
              Total Revenue
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              ${formatCurrency(data.summary.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="flex flex-col items-center p-5 text-center">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
            <h3 className="mb-1 text-xs uppercase tracking-widest text-secondary-foreground">
              Total Orders
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              {data.summary.totalOrders}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="flex flex-col items-center p-5 text-center">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-blue-500/10 p-2 text-blue-600">
                <Package className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
            <h3 className="mb-1 text-xs uppercase tracking-widest text-secondary-foreground">
              Total Products
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              {data.summary.totalProducts}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="flex flex-col items-center p-5 text-center">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-purple-500/10 p-2 text-purple-600">
                <TrendingUp className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
            <h3 className="mb-1 text-xs uppercase tracking-widest text-secondary-foreground">
              Repeat Customer Rate
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              {data.summary.repeatCustomerRate}%
            </p>
          </CardContent>
        </Card>
      </section>

      <AnalyticsCharts
        categoryData={data.categoryData}
        retentionData={visibleRetentionData}
        topProducts={data.topProducts}
      />
    </div>
  );
};

export default AnalyticsPage;
