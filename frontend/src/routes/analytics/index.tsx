import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Cell,
} from "recharts";

const AnalyticsPage = () => {
  // Sample data for charts
  const retentionData = [
    { month: "JAN", new: 65, returning: 15 },
    { month: "FEB", new: 70, returning: 20 },
    { month: "MAR", new: 60, returning: 25 },
    { month: "APR", new: 80, returning: 10 },
    { month: "MAY", new: 55, returning: 35 },
    { month: "JUN", new: 85, returning: 10 },
  ];

  const categoryData = [
    { name: "Produce", value: 74, color: "hsl(var(--primary))" },
    { name: "Organic Meat", value: 15, color: "hsl(var(--secondary))" },
    { name: "Bakery & Deli", value: 8, color: "hsl(var(--tertiary))" },
    { name: "Dairy", value: 3, color: "hsl(var(--muted))" },
  ];

  const topProducts = [
    {
      name: "Organic Hass Avocados",
      revenue: 4290,
      percentage: 85,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCMARHTAXlJ80kbOtqufqkVASxuO-HedjVyz-vf-0LW7Fd7YI6cFc35mjSAA1aZ98XmSQVlabZXMVgXrTh3w_9sVx-tHygBIpNUwK_QmhRUoH0w88lhiI_ZzngToek8fDXlr9Gc44p5AoOiwDMQrhgOJXy6K_uYcNSi2_CCfLBgsXbmOuqzZG1mCYLyfLmkTBRJXQAKSBF6jD9IhOAd_pifgzjUniMMzxV54Ny6R5TG845KPiCO5nGfTLsf-VJlTNpnaiC-uhSoRrQ",
    },
    {
      name: "Rainbow Heirloom Carrots",
      revenue: 3842,
      percentage: 72,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA9OnaupyQl5VkN5CAWZr2GxMfy6k105riszWdwRsXpfp3ilcmYCWcmG1fskjhEe9QBJO1ih514mGrZoj92nH07dRMzJkMynG1l4zi3FKF17sZa0MI-DtKeT7Dq0b1hL2hlT9bgPygZRXM9MT_dtKRVir67rMGVyqPXYtR8U9ysMgOwSjrojh4SLgI7qagYEFjGMheHfH1qrPIz-6RYsylGZpWGsmESyZl1oZ2-7L9DyDSKddlAClKB1Dx55JNF5MpBOUARtNvT77A",
    },
    {
      name: "Wild Harvest Shiitake",
      revenue: 2910,
      percentage: 58,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBbcnkRjBEdIuGForOvhR-BAftlS0gly0ZH-MNKJFw72iPO8oAZ5jHUKqQBCmFILjBnSe3G_Oh3_QtO-uV0Y-cWkDvRawUBp5IJziaYJxQktKYM8plRj6qXX76lC6dMaW4MNEl-FXH2GkrMDrg5CfMsyJE7WUrKl1U40ZZVHv4QjUB-ZadqkZsZXUzoa3P7MmrspFl0cjZjYf0uNoanhVyLmBMX_6b_PNRihUztGCH6jIL7yaAHEK5gonlb8ckc9bhtUp8hzt1vGg0",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-heading font-extrabold tracking-tighter text-foreground">
            Market Analytics
          </h1>
          <p className="text-secondary font-medium text-sm">
            Visualizing harvest trends and archival growth.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="px-6 py-2.5 rounded-full">
            Export Report
          </Button>
          <Button className="bg-gradient-to-br from-primary to-primary-container text-primary-foreground px-6 py-2.5 rounded-full flex items-center gap-2 hover:scale-95 transition-transform">
            <span className="material-symbols-outlined text-sm">
              calendar_today
            </span>
            Last 30 Days
          </Button>
        </div>
      </header>

      {/* Analytics Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Key Metric Bento */}
        <div className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-8">
          <Card className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group">
            <CardContent className="p-0">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-secondary-fixed rounded-xl">
                  <span className="material-symbols-outlined text-on-secondary-fixed-variant">
                    trending_up
                  </span>
                </div>
                <Badge className="text-xs font-bold text-green-600 bg-green-50">
                  +14.2%
                </Badge>
              </div>
              <h3 className="text-xs font-label uppercase tracking-widest mb-1 text-muted-foreground">
                Total Revenue
              </h3>
              <p className="text-3xl font-extrabold text-foreground">
                $124,592.00
              </p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/10 group-hover:bg-primary transition-colors"></div>
            </CardContent>
          </Card>
          <Card className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group">
            <CardContent className="p-0">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-tertiary-fixed rounded-xl">
                  <span className="material-symbols-outlined text-on-tertiary-fixed-variant">
                    person_add
                  </span>
                </div>
                <Badge className="text-xs font-bold text-green-600 bg-green-50">
                  +5.1%
                </Badge>
              </div>
              <h3 className="text-xs font-label uppercase tracking-widest mb-1 text-muted-foreground">
                New Archivists
              </h3>
              <p className="text-3xl font-extrabold text-foreground">1,204</p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary/10 group-hover:bg-tertiary transition-colors"></div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Retention Rate Chart */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-8 rounded-xl">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-bold tracking-tight">
                Customer Retention Rate
              </h3>
              <p className="text-sm text-muted-foreground">
                Monthly loyalty and returning visit velocity.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-xs font-medium">New</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span className="text-xs font-medium">Returning</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="new" stackId="a" fill="hsl(var(--primary))" />
                <Bar
                  dataKey="returning"
                  stackId="a"
                  fill="hsl(var(--secondary))"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest p-8 rounded-xl">
          <h3 className="text-xl font-bold tracking-tight mb-8">
            Top Selling Products
          </h3>
          <div className="space-y-6">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-6 group">
                <div className="w-16 h-16 rounded-xl bg-surface overflow-hidden flex-shrink-0">
                  <img
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={product.image}
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-foreground">
                      {product.name}
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      ${product.revenue.toLocaleString()}.00
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${product.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest p-8 rounded-xl flex flex-col">
          <h3 className="text-xl font-bold tracking-tight mb-8">
            Sales by Category
          </h3>
          <div className="flex-grow flex items-center justify-center relative py-12">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-2xl font-black text-foreground block leading-tight">
                    74%
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                    Produce
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-auto">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs font-medium text-muted-foreground">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footnote */}
      <footer className="mt-16 flex justify-between items-center px-2">
        <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          © 2024 Botanical Archivist System V4.2
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-bold text-muted-foreground">
              SYSTEM STABLE
            </span>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            LAST SYNC: 2 MINS AGO
          </span>
        </div>
      </footer>
    </div>
  );
};

export default AnalyticsPage;
