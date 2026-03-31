"use client";

import { Grid } from "@mui/material";
import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  PointOfSale as POSIcon,
} from "@mui/icons-material";
import StatCard from "@/app/components/ui/StatCard";
import { formatCurrency } from "@/lib/utils";

interface DashboardStatsCardsProps {
  isLoading: boolean;
  totalProducts?: number;
  lowStockProducts?: number;
  todaySales?: number;
  todayRevenue?: number;
  todayProfit?: number;
}

export default function DashboardStatCards({
  isLoading,
  totalProducts = 0,
  lowStockProducts = 0,
  todaySales = 0,
  todayRevenue = 0,
  todayProfit = 0,
}: DashboardStatsCardsProps) {
  const cards = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: <InventoryIcon />,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
    },
    {
      title: "Low Stock Items",
      value: lowStockProducts,
      icon: <WarningIcon />,
      color: "#F59E0B",
      bgColor: "#FFFBEB",
    },
    {
      title: "Today's Sales",
      value: todaySales,
      icon: <POSIcon />,
      color: "#10B981",
      bgColor: "#ECFDF5",
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(todayRevenue),
      icon: <TrendingUpIcon />,
      color: "#6366F1",
      bgColor: "#EEF2FF",
    },
    {
      title: "Today's Profit",
      value: formatCurrency(todayProfit),
      icon: <TrendingUpIcon />,
      color: "#F59E0B",
      bgColor: "#FFFBEB",
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid key={index}>
          <StatCard {...card} isLoading={isLoading} />
        </Grid>
      ))}
    </Grid>
  );
}
