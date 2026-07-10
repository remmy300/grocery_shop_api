"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/api";
import type { AnalyticsResponse } from "@/types";

type AnalyticsChartsProps = {
  categoryData: AnalyticsResponse["categoryData"];
  retentionData: AnalyticsResponse["retentionData"];
  topProducts: AnalyticsResponse["topProducts"];
};

const AnalyticsCharts = ({
  categoryData,
  retentionData,
  topProducts,
}: AnalyticsChartsProps) => {
  const retentionColors = {
    new: "#16a34a",
    returning: "#f97316",
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-heading font-bold text-foreground">
                Category Distribution
              </h3>
              <p className="text-secondary-foreground text-sm">
                Revenue by product category
              </p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name} ${value}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => [`${value}%`, "Revenue Share"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm hover:bg-white">
          <CardContent className="space-y-6 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-heading font-bold text-foreground">
                Customer Retention
              </h3>
              <p className="text-secondary-foreground text-sm">
                New vs returning customers over time
              </p>
            </div>
            <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-widest text-secondary-foreground">
                <span className="inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: retentionColors.new }}
                  />
                  New customers
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: retentionColors.returning }}
                  />
                  Returning customers
                </span>
              </div>
              <div className="h-72 w-full min-h-72">
                <ResponsiveContainer width="100%" height="100%" minHeight={288}>
                  <BarChart
                    data={retentionData}
                    margin={{ top: 24, right: 12, left: 0, bottom: 0 }}
                    barCategoryGap="18%"
                    barGap={8}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--outline-variant))"
                    />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--secondary-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="hsl(var(--secondary-foreground))"
                      fontSize={12}
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--surface-container-low))" }}
                      formatter={(value, name) => [
                        Number(value).toLocaleString(),
                        name === "new"
                          ? "New customers"
                          : "Returning customers",
                      ]}
                    />
                    <Legend
                      formatter={(value) =>
                        value === "new"
                          ? "New customers"
                          : "Returning customers"
                      }
                    />
                    <Bar
                      dataKey="new"
                      fill={retentionColors.new}
                      name="new"
                      radius={[6, 6, 0, 0]}
                      barSize={20}
                      minPointSize={6}
                    >
                      <LabelList
                        dataKey="new"
                        offset={8}
                        fill={retentionColors.new}
                        style={{ fontSize: 11, fontWeight: 700 }}
                      />
                    </Bar>
                    <Bar
                      dataKey="returning"
                      fill={retentionColors.returning}
                      name="returning"
                      radius={[6, 6, 0, 0]}
                      barSize={20}
                      minPointSize={6}
                    >
                      <LabelList
                        dataKey="returning"
                        offset={8}
                        fill={retentionColors.returning}
                        style={{ fontSize: 11, fontWeight: 700 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-surface-container-lowest shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-heading font-bold text-foreground">
              Top Products
            </h3>
            <p className="text-secondary-foreground text-sm">
              Revenue contribution by product
            </p>
          </div>
          <div className="space-y-4">
            {topProducts.map((product) => (
              <div
                key={product.name}
                className="space-y-3 rounded-xl bg-surface-container-low p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {product.name}
                    </p>
                    <p className="text-sm text-secondary-foreground">
                      KES {formatCurrency(product.revenue)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {product.percentage}%
                  </p>
                </div>
                <Progress value={product.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AnalyticsCharts;
