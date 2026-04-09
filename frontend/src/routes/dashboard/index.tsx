import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DashboardPage = () => {
  // Sample revenue data for the chart
  const revenueData = [
    { month: "Jan", revenue: 45000 },
    { month: "Feb", revenue: 52000 },
    { month: "Mar", revenue: 48000 },
    { month: "Apr", revenue: 61000 },
    { month: "May", revenue: 55000 },
    { month: "Jun", revenue: 67000 },
    { month: "Jul", revenue: 72000 },
    { month: "Aug", revenue: 68000 },
    { month: "Sep", revenue: 75000 },
    { month: "Oct", revenue: 82000 },
    { month: "Nov", revenue: 78000 },
    { month: "Dec", revenue: 89000 },
  ];

  // Sample activity data
  const activities = [
    {
      id: 1,
      user: "Evelyn Montgomery",
      action: "placed an order",
      item: "Valencia Oranges (5kg)",
      time: "2 minutes ago",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDyF758iBzel_7knA5hEY-yOyqMNx5rXjBdNJFKo7dY7S559Riqy-QX19ueNJlyf0AdPcnZnJrEss_yz60aMmPfcx-z-9mG63eSoNXRfDZ9p4-qcWJr_8SLtKAHMynOE21xfrwA_hfaRwuUdIPG1twRzVVg6bQGL6dIlJSrCs-1aA2t3u7wTj48W5u_B-zb8vViBgHCg-GzfxWTUlHoDO-QXObnZvgmLM8FWKDbEVEW_-8C_eEoMkSjEcCkmlSzmHB9i1Q_auTHPGg",
    },
    {
      id: 2,
      user: "Julian Thorne",
      action: "completed payment",
      item: "Order #ARC-8931",
      time: "5 minutes ago",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBNxVnQ6xt0vb8DPGcDsB1Es1flEWOmUruXH8-GQESnkCbge1cN2z2k3cRdEA0Yow6bFwIuXr4mmnm799spGXP1F0sCw75xPZMYkF1mm7Nwy_pWbZeMechq8ho84iO1dzoThU_9wEJABY5mqyBuKqLaPV3shrZKah4TjMnyuSFvm-_HWNhqdcvQQqOEorfa4BqQPm7zzcSRzaGpsu0GqJr3U_tW4XmzYC64ytXf8Vvx302fOoNLH4gPq14svpX95F6amDS_zhcjSkY",
    },
    {
      id: 3,
      user: "Clara Rivera",
      action: "updated profile",
      item: "Shipping address",
      time: "12 minutes ago",
      avatar: "",
      initials: "CR",
    },
    {
      id: 4,
      user: "Sarah Jenkins",
      action: "left a review",
      item: "Organic Tomatoes",
      time: "18 minutes ago",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAbrYFCEwO7KxzzL858suhOiXwGXRfvZOkaceOSb_TPxsEQXohaNjLUjDX8sF8yWYaaFAFYFrZahPV5xbjLpafY48Wsr5brcVJFuXsXaE_5D9DLbJD--eGX6aLDQxaeMKRtFFwJi8Y3NOrew4clH6Y5xO1URtTGElVnpljoPDPquMc7-uyBzN1rJh-4P1yMcnJ5UnwqLXbEh7phJwR2WB5wia6T-I1sCSb7NfYFsQXdp9O8U94uHn1mpzJpOblSE9Esi_XwtiSmvhc",
    },
  ];

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

      {/* Metrics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <Badge className="bg-primary/10 text-primary text-xs font-bold px-2 py-1">
                +12%
              </Badge>
            </div>
            <h3 className="text-secondary-foreground text-xs font-label uppercase tracking-widest mb-1">
              Total Revenue
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              $89,420
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <span className="material-symbols-outlined">shopping_cart</span>
              </div>
            </div>
            <h3 className="text-secondary-foreground text-xs font-label uppercase tracking-widest mb-1">
              Orders Today
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              142
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-600">
                <span className="material-symbols-outlined">group</span>
              </div>

              <Badge className="bg-green-500/10 text-green-600 text-xs font-bold px-2 py-1">
                +8%
              </Badge>
            </div>
            <h3 className="text-secondary-foreground text-xs font-label uppercase tracking-widest mb-1">
              Active Customers
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              1,284
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Revenue Chart */}
      <Card className="bg-surface-container-lowest shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-heading font-bold text-foreground">
                Revenue Overview
              </h3>
              <p className="text-secondary-foreground text-sm">
                Monthly revenue trends for the past year
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
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--surface-container-lowest))",
                    border: "1px solid hsl(var(--outline-variant))",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [
                    `$${value?.toLocaleString() || "0"}`,
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

      {/* Activity Feed */}
      <Card className="bg-surface-container-lowest shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
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
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-surface-container-low transition-colors"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container flex items-center justify-center flex-shrink-0">
                  {activity.avatar ? (
                    <img
                      src={activity.avatar}
                      alt={activity.user}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-on-surface">
                      {activity.initials}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{activity.user}</span>{" "}
                    {activity.action}{" "}
                    <span className="text-secondary-foreground">
                      {activity.item}
                    </span>
                  </p>
                  <p className="text-xs text-secondary-foreground mt-1">
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

      {/* Footer */}
      <footer className="w-full py-12 mt-20 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto font-label text-xs uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">
        <p className="text-secondary-foreground mb-6 md:mb-0">
          © {new Date().getFullYear()} Corner Store. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default DashboardPage;
