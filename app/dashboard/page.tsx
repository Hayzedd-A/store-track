"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Box, Grid, Typography, Alert } from "@mui/material";
import { Dashboard as DashboardIcon } from "@mui/icons-material";
import DashboardStatCards from "@/app/components/dashboard/DashboardStatCards";
import SalesCharts from "@/app/components/sales/SalesCharts";
import RecentSalesList from "@/app/components/dashboard/RecentSalesList";
import LowStockAlerts from "@/app/components/dashboard/LowStockAlerts";
import QuickActions from "@/app/components/dashboard/QuickActions";

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  todaySales: number;
  todayRevenue: number;
  todayProfit: number;
  totalSales: number;
  totalRevenue: number;
  recentSales: Array<{
    _id: string;
    totalAmount: number;
    createdAt: string;
    items: Array<{
      productName: string;
      quantity: number;
      price: number;
      cost: number;
      subtotal: number;
    }>;
  }>;
  lowStockItems: Array<{
    _id: string;
    name: string;
    quantity: number;
    minStock: number;
  }>;
  allSales: Array<{
    _id: string;
    totalAmount: number;
    createdAt: string;
    items: Array<{
      productName: string;
      quantity: number;
      price: number;
      cost: number;
      subtotal: number;
    }>;
  }>;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split("T")[0];

  const [productsRes, lowStockRes, salesRes] = await Promise.all([
    fetch("/api/products"),
    fetch("/api/products?lowStock=true"),
    fetch(`/api/sales?startDate=${startDate}&limit=1000`),
  ]);

  const productsData = await productsRes.json();
  const lowStockData = await lowStockRes.json();
  const salesData = await salesRes.json();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySales =
    salesData.data?.filter(
      (sale: { createdAt: string }) => new Date(sale.createdAt) >= today,
    ) || [];

  const todayRevenue = todaySales.reduce(
    (sum: number, sale: { totalAmount: number }) => sum + sale.totalAmount,
    0,
  );

  const todayProfit = todaySales.reduce(
    (sum: number, sale: any) =>
      sum +
      sale.items.reduce(
        (itemSum: number, item: any) =>
          itemSum + (item.price - item.cost) * item.quantity,
        0,
      ),
    0,
  );

  return {
    totalProducts: productsData.pagination?.total || 0,
    lowStockProducts: lowStockData.data?.length || 0,
    todaySales: todaySales.length,
    todayRevenue,
    todayProfit,
    totalSales: salesData.summary?.totalSales || 0,
    totalRevenue: salesData.summary?.totalRevenue || 0,
    recentSales: salesData.data?.slice(0, 5) || [],
    lowStockItems: lowStockData.data?.slice(0, 5) || [],
    allSales: salesData.data || [],
  };
}

export default function DashboardPage() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  });

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: date.toISOString().split("T")[0],
        sales: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
      };
    });

    (stats?.allSales || []).forEach((sale) => {
      const date = new Date(sale.createdAt).toISOString().split("T")[0];
      const day = last7Days.find((d) => d.fullDate === date);
      if (day) {
        let dailyCost = 0;
        let dailyProfit = 0;
        sale.items.forEach((item) => {
          dailyCost += item.cost * item.quantity;
          dailyProfit += (item.price - item.cost) * item.quantity;
        });

        day.sales += 1;
        day.revenue += sale.totalAmount;
        day.cost += dailyCost;
        day.profit += dailyProfit;
      }
    });

    return last7Days;
  }, [stats?.allSales]);

  const pieData = useMemo(() => {
    const productSales: Record<
      string,
      { name: string; quantity: number; revenue: number }
    > = {};

    (stats?.allSales || []).forEach((sale) => {
      sale.items.forEach((item) => {
        if (!productSales[item.productName]) {
          productSales[item.productName] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[item.productName].quantity += item.quantity;
        productSales[item.productName].revenue += item.subtotal;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((product, index) => ({
        name: product.name,
        revenue: product.revenue,
        quantity: product.quantity,
        color: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][index],
      }));
  }, [stats?.allSales]);

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load dashboard data. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <DashboardIcon sx={{ fontSize: 32, color: "primary.main", mr: 1 }} />
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>
      </Box>

      <DashboardStatCards
        isLoading={isLoading}
        totalProducts={stats?.totalProducts}
        lowStockProducts={stats?.lowStockProducts}
        todaySales={stats?.todaySales}
        todayRevenue={stats?.todayRevenue}
        todayProfit={stats?.todayProfit}
      />

      <SalesCharts salesChartData={chartData} pieData={pieData} />

      <Grid container spacing={3}>
        <Grid>
          <RecentSalesList
            isLoading={isLoading}
            sales={stats?.recentSales || []}
          />
        </Grid>
        <Grid>
          <LowStockAlerts
            isLoading={isLoading}
            items={stats?.lowStockItems || []}
          />
        </Grid>
      </Grid>

      <Typography variant="h5" fontWeight="600" sx={{ mt: 4, mb: 2 }}>
        Quick Actions
      </Typography>
      <QuickActions />
    </Box>
  );
}
