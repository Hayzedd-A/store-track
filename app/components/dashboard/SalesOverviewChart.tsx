"use client";

import { Card, CardContent } from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ChartDataPoint {
  date: string;
  sales: number;
  revenue: number;
}

interface SalesOverviewChartProps {
  data: ChartDataPoint[];
}

export default function SalesOverviewChart({ data }: SalesOverviewChartProps) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === "sales" ? value : formatCurrency(value),
                name === "sales" ? "Sales Count" : "Revenue",
              ]}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sales"
              stroke="#3B82F6"
              strokeWidth={2}
              name="sales"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              strokeWidth={2}
              name="revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
