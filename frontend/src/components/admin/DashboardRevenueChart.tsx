"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CsvExportButton } from "@/components/CsvExportButton";
import type { DashboardResponse } from "@/types";

type DashboardRevenueChartProps = {
  revenueData: DashboardResponse["revenueData"];
};

const DashboardRevenueChart = ({
  revenueData,
}: DashboardRevenueChartProps) => {
  return (
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
          <CsvExportButton
            rows={revenueData}
            columns={[
              { header: "Month", value: (row) => row.month },
              { header: "Revenue", value: (row) => row.revenue },
            ]}
            filename="revenue-overview"
            variant="outline"
            size="sm"
            className="gap-0"
          >
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Export
          </CsvExportButton>
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
  );
};

export default DashboardRevenueChart;
