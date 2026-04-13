import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, formatCurrency } from "@/lib/api";

type AnalyticsResponse = {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    repeatCustomerRate: number;
  };
  retentionData: Array<{
    month: string;
    new: number;
    returning: number;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
  topProducts: Array<{
    name: string;
    revenue: number;
    percentage: number;
  }>;
};

const AnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<AnalyticsResponse>("/api/admin/analytics");
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
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

  const totalCategoryValue = data.categoryData.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-heading font-extrabold tracking-tighter text-foreground">
            Market Analytics
          </h1>
          <p className="text-sm font-medium text-foreground">
            Visualizing harvest trends and archival growth.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="px-6 py-2.5 rounded-full">
            Export Report
          </Button>
          <Button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full flex items-center gap-2 hover:scale-95 transition-transform">
            <span className="material-symbols-outlined text-sm">
              calendar_today
            </span>
            Last 30 Days
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-green-500/10 p-2 text-green-600">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <Badge className="bg-green-500/10 text-green-600 text-xs font-bold px-2 py-1">
                Live
              </Badge>
            </div>
            <h3 className="text-secondary-foreground text-xs font-label uppercase tracking-widest mb-1">
              Total Revenue
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              ${formatCurrency(data.summary.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
                <span className="material-symbols-outlined">shopping_cart</span>
              </div>
              <Badge className="bg-primary/10 text-primary text-xs font-bold px-2 py-1">
                Orders
              </Badge>
            </div>
            <h3 className="text-secondary-foreground text-xs font-label uppercase tracking-widest mb-1">
              Total Orders
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              {data.summary.totalOrders}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-blue-500/10 p-2 text-blue-600">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <Badge className="bg-blue-500/10 text-blue-600 text-xs font-bold px-2 py-1">
                Products
              </Badge>
            </div>
            <h3 className="text-secondary-foreground text-xs font-label uppercase tracking-widest mb-1">
              Total Products
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              {data.summary.totalProducts}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-amber-500/10 p-2 text-amber-600">
                <span className="material-symbols-outlined">repeat</span>
              </div>
              <Badge className="bg-amber-500/10 text-amber-600 text-xs font-bold px-2 py-1">
                Retention
              </Badge>
            </div>
            <h3 className="text-secondary-foreground text-xs font-label uppercase tracking-widest mb-1">
              Repeat Customers
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              {data.summary.repeatCustomerRate}%
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest p-8 rounded-xl">
          <h3 className="text-xl font-bold tracking-tight mb-8">
            Customer Retention Rate
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.retentionData} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  height={20}
                  formatter={(value) => {
                    const labels: Record<string, string> = {
                      new: "New Customers",
                      returning: "Returning Customers",
                    };
                    return labels[String(value)] || String(value);
                  }}
                />
                <Bar dataKey="new" stackId="a" fill="#16a34a" name="New Customers" />
                <Bar
                  dataKey="returning"
                  stackId="a"
                  fill="#0ea5e9"
                  name="Returning Customers"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest p-8 rounded-xl">
          <h3 className="text-xl font-bold tracking-tight mb-8">
            Top Selling Products
          </h3>
          <div className="space-y-6">
            {data.topProducts.map((product) => (
              <div key={product.name} className="flex items-center gap-6 group">
                <div className="flex-grow">
                  <div className="mb-2 flex justify-between items-center">
                    <span className="font-bold text-foreground">
                      {product.name}
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      ${formatCurrency(product.revenue)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${product.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest p-8 rounded-xl flex flex-col">
          <h3 className="text-xl font-bold tracking-tight mb-8">
            Sales by Category
          </h3>
          <div className="flex-grow flex items-center justify-center relative py-8">
            <div className="relative w-56 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 10, bottom: 60, left: 10 }}>
                  <Pie
                    data={data.categoryData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                    label={false}
                    stroke="#fff"
                    strokeWidth={2}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const item = payload[0].payload as { name: string; value: number };
                      const percent = totalCategoryValue
                        ? ((item.value / totalCategoryValue) * 100).toFixed(0)
                        : "0";

                      return (
                        <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg">
                          <div className="text-sm font-semibold text-foreground">
                            {item.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {percent}% of category sales
                          </div>
                        </div>
                      );
                    }}
                  />

                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => (
                      <span
                        style={{
                          color: "#374151",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {value}
                      </span>
                    )}
                    wrapperStyle={{ marginTop: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-16 flex justify-between items-center px-2 w-full">
        <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          © {new Date().getFullYear()} Botanical Archivist System
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-bold text-muted-foreground">
              SYSTEM STABLE
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AnalyticsPage;
