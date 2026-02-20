"use client";

import { Grid, Card, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ChartDataPoint {
  date: string;
  sales: number;
  revenue: number;
}
interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

interface SalesChartsProps {
  salesChartData: ChartDataPoint[];
  pieData: PieDataPoint[];
}

const formalizeCurrency = (amount: number) => {
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M`;
  if (amount >= 1e3) return `${(amount / 1e3).toFixed(1)}K`;
  return formatCurrency(amount);
};

export default function SalesCharts({
  salesChartData,
  pieData,
}: SalesChartsProps) {
  return (
    <Grid container spacing={3} columns={2} sx={{ mb: 3 }}>
      <Grid size={1}>
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
            Sales Trend (Last 7 Days)
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formalizeCurrency} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === "revenue" ? formatCurrency(value) : value,
                  name === "revenue" ? "Revenue" : "Sales",
                ]}
              />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Grid>
      <Grid size={1}>
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
            Top Products
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name.substring(0, 10)}... ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </Grid>
    </Grid>
  );
}
