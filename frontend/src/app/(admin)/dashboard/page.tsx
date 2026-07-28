"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  DollarSign,
  MoreHorizontal,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { apiRequest } from "@/lib/api";
import { formatCurrency } from "@/utils/formatters";
import { relativeTime } from "@/lib/relativeTime";
import { CsvExportButton } from "@/components/CsvExportButton";
import { DashboardMetrics, DashboardOverviewResponse } from "@/types";

const RevenueChartCard = dynamic(
  () => import("@/components/admin/DashboardRevenueChart"),
  {
    ssr: false,
    loading: () => <RevenueChartCardSkeleton />,
  },
);

type DashboardApiResponse = DashboardMetrics | DashboardOverviewResponse;

const normalizeDashboardResponse = (
  response: DashboardApiResponse,
): DashboardMetrics => {
  if ("metrics" in response) {
    const {
      metrics,
      recentActivity,
      revenueData,
      lowStockProducts,
      outOfStockProducts,
      topSellingProducts,
    } = response;

    return {
      ...metrics,
      recentActivity,
      revenueData,
      lowStockProducts,
      outOfStockProducts,
      topSellingProducts,
    };
  }

  return response;
};

function RevenueChartCardSkeleton() {
  return (
    <Card className="bg-surface-container-lowest shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

const DashboardPage = () => {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<DashboardApiResponse>(
          "/api/admin/dashboard",
        );
        if (!active) return;
        setData(normalizeDashboardResponse(response));
        setError(null);
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load dashboard",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const insights = useMemo(() => {
    if (!data) {
      return [];
    }

    const {
      revenueData,
      totalOrders,
      totalRevenue,
      totalProducts,
      lowStockItems,
      activeCustomers,
    } = data;
    const bestRevenueMonth = revenueData.reduce(
      (best, current) => (current.revenue > best.revenue ? current : best),
      revenueData[0] ?? { month: "N/A", revenue: 0 },
    ) ?? { month: "N/A", revenue: 0 };
    const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
    const lowStockRatio = totalProducts
      ? Math.round((lowStockItems / totalProducts) * 100)
      : 0;
    const customerLoad = totalOrders
      ? Math.round((activeCustomers / totalOrders) * 100)
      : 0;

    return [
      {
        label: "Best revenue month",
        value: bestRevenueMonth.month,
        detail: `KES${formatCurrency(bestRevenueMonth.revenue)} generated`,
      },
      {
        label: "Average order value",
        value: `KES${formatCurrency(averageOrderValue)}`,
        detail: "Revenue divided by total orders.",
      },
      {
        label: "Low stock pressure",
        value: `${lowStockRatio}%`,
        detail: "Share of products currently at low stock.",
      },
      {
        label: "Customer diversity",
        value: `${customerLoad}%`,
        detail: "Active customers relative to total orders.",
      },
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-secondary-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error || "Unable to load dashboard"}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const {
    recentActivity,
    revenueData,
    lowStockProducts,
    outOfStockProducts,
    topSellingProducts,
  } = data;

  return (
    <div className="space-y-8 w-full px-5 md:px-7">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-heading font-extrabold tracking-tighter text-foreground">
            Archive Collection
          </h1>
          <p className="text-secondary-foreground font-medium tracking-tight">
            Managing the seasonal harvest transitions.
          </p>
        </div>
        <div className="flex gap-3">
          <CsvExportButton
            rows={data.revenueData}
            columns={[
              { header: "Month", value: (row) => row.month },
              { header: "Revenue", value: (row) => row.revenue },
            ]}
            filename="dashboard-revenue"
            className="rounded-full bg-surface-container-high px-6 py-2.5 text-sm font-semibold text-primary transition-transform hover:scale-95"
          >
            Export Report
          </CsvExportButton>
          <Button
            onClick={() => setInsightsOpen(true)}
            className="rounded-full bg-linear-to-br from-primary to-primary-container px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-95"
          >
            Generate Insights
          </Button>
        </div>
      </header>

      <section className="grid w-full grid-cols-1 gap-7 md:grid-cols-4">
        <Card className="w-full bg-surface-container-lowest shadow-sm">
          <CardContent className="p-7">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
                <DollarSign className="h-5 w-5" aria-hidden="true" />
              </div>
              <Badge className="bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                Live
              </Badge>
            </div>
            <h3 className="mb-1 text-xs uppercase tracking-widest text-secondary-foreground">
              Total Revenue
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              KES {formatCurrency(data.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card className="w-full bg-surface-container-lowest shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-green-500/10 p-2 text-green-600">
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              </div>
              <Badge className="bg-green-500/10 px-2 py-1 text-xs font-bold text-green-600">
                {data.ordersToday} today
              </Badge>
            </div>
            <h3 className="mb-1 text-xs uppercase tracking-widest text-secondary-foreground">
              Total Orders
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              {data.totalOrders}
            </p>
          </CardContent>
        </Card>
        <Card className="w-full bg-surface-container-lowest shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-green-500/10 p-2 text-green-600">
                <Package className="h-5 w-5" aria-hidden="true" />
              </div>
              <Badge className="bg-green-500/10 px-2 py-1 text-xs font-bold text-green-600">
                {data.lowStockItems} low stock
              </Badge>
            </div>
            <h3 className="mb-1 text-xs uppercase tracking-widest text-secondary-foreground">
              Total Products
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              {data.totalProducts}
            </p>
          </CardContent>
        </Card>

        <Card className="w-full bg-surface-container-lowest shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-green-500/10 p-2 textgreen-600">
                <TrendingUp className="h-5 w-5" aria-hidden="true" />
              </div>
              <Badge className="bg-green-500/10 px-2 py-1 text-xs font-bold text-green-600">
                {data.topSellingProducts?.length ?? 0} top items
              </Badge>
            </div>
            <h3 className="mb-1 text-xs uppercase tracking-widest text-secondary-foreground">
              Best Sellers
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              {data.topSellingProducts?.length ?? 0}
            </p>
          </CardContent>
        </Card>
      </section>

      <RevenueChartCard revenueData={revenueData} />

      {/* ── Low-stock & out-of-stock alerts ── */}
      {(outOfStockProducts?.length > 0 || lowStockProducts?.length > 0) && (
        <div className="space-y-3">
          {outOfStockProducts?.length > 0 && (
            <Card className="border-red-200 bg-red-50 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <h3 className="font-semibold text-red-800">
                    {outOfStockProducts.length} product
                    {outOfStockProducts.length !== 1 ? "s" : ""} out of stock
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {outOfStockProducts.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {lowStockProducts?.length > 0 && (
            <Card className="border-amber-200 bg-amber-50 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <h3 className="font-semibold text-amber-800">
                    {lowStockProducts.length} product
                    {lowStockProducts.length !== 1 ? "s" : ""} running low
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lowStockProducts.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
                    >
                      {p.name}
                      <span className="font-bold">
                        {p.stock} {p.unit} left
                      </span>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Best-selling products ── */}
      {topSellingProducts?.length > 0 && (
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="text-lg font-heading font-bold text-foreground">
                  Best-Selling Products
                </h3>
                <p className="text-secondary-foreground text-sm">
                  Ranked by units sold across all orders
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {topSellingProducts.map((product, idx) => {
                const maxUnits = topSellingProducts[0].unitsSold;
                const pct = Math.round((product.unitsSold / maxUnits) * 100);
                return (
                  <div key={product.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="font-medium truncate">
                          {product.name}
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:block shrink-0">
                          {product.category}
                        </span>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className="font-semibold">
                          {product.unitsSold} sold
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          KES {product.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-surface-container-lowest shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-heading font-bold text-foreground">
                Recent Activity
              </h3>
              <p className="text-secondary-foreground text-sm">
                Latest customer interactions and system events
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivityOpen(true)}
            >
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg p-4 transition-colors hover:bg-surface-container-low"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container">
                  <span className="text-sm font-bold text-on-surface">
                    {activity.initials}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{activity.user}</span>{" "}
                    {activity.action}{" "}
                    <span className="text-secondary-foreground">
                      {activity.item}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-secondary-foreground">
                    {relativeTime(activity.createdAt)}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Sheet open={insightsOpen} onOpenChange={setInsightsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Operational Insights</SheetTitle>
            <SheetDescription>
              Quick recommendations based on your current dashboard metrics.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-4 pb-4">
            {insights.map((insight) => (
              <Card key={insight.label} className="bg-surface-container-lowest">
                <CardContent className="space-y-2 p-4">
                  <p className="text-xs uppercase tracking-widest text-secondary-foreground">
                    {insight.label}
                  </p>
                  <h4 className="text-xl font-heading font-bold text-foreground">
                    {insight.value}
                  </h4>
                  <p className="text-sm text-secondary-foreground">
                    {insight.detail}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={activityOpen} onOpenChange={setActivityOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Recent Activity</SheetTitle>
            <SheetDescription>
              A fuller view of the latest dashboard events and customer actions.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-4 pb-4">
            {recentActivity.map((activity) => (
              <Card key={activity.id} className="bg-surface-container-lowest">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container">
                    <span className="text-sm font-bold text-on-surface">
                      {activity.initials}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{activity.user}</span>{" "}
                      {activity.action}{" "}
                      <span className="text-secondary-foreground">
                        {activity.item}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-secondary-foreground">
                      {relativeTime(activity.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DashboardPage;
