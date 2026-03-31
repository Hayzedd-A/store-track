"use client";

import { useState } from "react";
import { Grid, Card, Typography, ToggleButton, ToggleButtonGroup, Box } from "@mui/material";
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
  cost: number;
  profit: number;
}
interface PieDataPoint {
  name: string;
  revenue: number;
  quantity: number;
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
  const [pieMode, setPieMode] = useState<"revenue" | "quantity">("revenue");

  return (
    <Grid container spacing={3} columns={2} sx={{ mb: 3 }}>
      <Grid size={1}>
        <Card sx={{ borderRadius: 3, p: 2, height: "100%" }}>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
            Sales Trend
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formalizeCurrency} />
              <Tooltip
                formatter={(value, name) => {
                  const safeValue = Number(value ?? 0);
                  if (name === "profit") return [formatCurrency(safeValue), "Profit"];
                  if (name === "cost") return [formatCurrency(safeValue), "Cost"];
                  return [safeValue, name];
                }}
              />
              <Bar dataKey="cost" stackId="a" fill="#F97316" />
              <Bar dataKey="profit" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Grid>
      <Grid size={1}>
        <Card sx={{ borderRadius: 3, p: 2, height: "100%" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight="600">
              Top Products
            </Typography>
            <ToggleButtonGroup
              size="small"
              value={pieMode}
              exclusive
              onChange={(_, newMode) => {
                if (newMode !== null) setPieMode(newMode);
              }}
              aria-label="top products view mode"
            >
              <ToggleButton value="revenue" aria-label="sales mode">
                Sales
              </ToggleButton>
              <ToggleButton value="quantity" aria-label="quantity mode">
                Quantity
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey={pieMode}
                label={({ name, percent }) =>
                  `${name?.substring(0, 10)}... ${((percent || 0.0001) * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => 
                  pieMode === "revenue" ? formatCurrency(Number(value)) : `${Number(value)} sold`
                } 
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </Grid>
    </Grid>
  );
}
