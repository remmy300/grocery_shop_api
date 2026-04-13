import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, formatCurrency } from "@/lib/api";

type DashboardResponse = {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    lowStockItems: number;
    activeAdmins: number;
    activeCustomers: number;
    ordersToday: number;
  };
  recentActivity: Array<{
    id: number;
    user: string;
    action: string;
    item: string;
    time: string;
    initials: string;
  }>;
  revenueData: Array<{ month: string; revenue: number }>;
};

const DashboardPage = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<DashboardResponse>("/api/admin/dashboard");
        if (!active) return;
        setData(response);
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

  const { metrics, recentActivity, revenueData } = data;

  return (
    <div className="space-y-8">
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
          <Button className="bg-surface-container-high text-primary px-6 py-2.5 rounded-full font-semibold text-sm hover:scale-95 transition-transform">
            Export Report
          </Button>
          <Button className="bg-linear-to-br from-primary to-primary-container text-primary-foreground px-6 py-2.5 rounded-full font-semibold text-sm hover:scale-95 transition-transform">
            Generate Insights
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <Badge className="bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                Live
              </Badge>
            </div>
            <h3 className="mb-1 text-xs uppercase tracking-widest text-secondary-foreground">
              Total Revenue
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              ${formatCurrency(metrics.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-green-500/10 p-2 text-green-600">
                <span className="material-symbols-outlined">shopping_cart</span>
              </div>
              <Badge className="bg-green-500/10 px-2 py-1 text-xs font-bold text-green-600">
                {metrics.ordersToday} today
              </Badge>
            </div>
            <h3 className="mb-1 text-xs uppercase tracking-widest text-secondary-foreground">
              Total Orders
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              {metrics.totalOrders}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-blue-500/10 p-2 text-blue-600">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <Badge className="bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-600">
                {metrics.lowStockItems} low stock
              </Badge>
            </div>
            <h3 className="mb-1 text-xs uppercase tracking-widest text-secondary-foreground">
              Total Products
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              {metrics.totalProducts}
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="bg-surface-container-lowest shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-heading font-bold text-foreground">
                Revenue Overview
              </h3>
              <p className="text-secondary-foreground text-sm">
                Monthly revenue trends from backend orders
              </p>
            </div>
            <Button variant="outline" size="sm">
              <span className="material-symbols-outlined text-sm mr-2">
                download
              </span>
              Export
            </Button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--outline-variant))"
                />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--secondary-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--secondary-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${Number(value) / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--surface-container-lowest))",
                    border: "1px solid hsl(var(--outline-variant))",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [
                    `$${Number(value).toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{
                    r: 6,
                    stroke: "hsl(var(--primary))",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

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
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg p-4 transition-colors hover:bg-surface-container-low"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-container">
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
                    {activity.time}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <span className="material-symbols-outlined text-lg">
                    more_horiz
                  </span>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <footer className="mt-20 flex w-full flex-col items-center justify-between border-t border-outline-variant px-8 py-12 text-xs uppercase tracking-widest opacity-80 transition-opacity hover:opacity-100 md:flex-row">
        <p className="mb-6 text-secondary-foreground md:mb-0">
          © {new Date().getFullYear()} Corner Store. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default DashboardPage;
