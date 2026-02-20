"use client";

import { Grid, Card, CardContent, Box, Typography } from "@mui/material";
import {
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import { formatCurrency } from "@/lib/utils";

interface SalesSummaryCardsProps {
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  averageSale: number;
}

export default function SalesSummaryCards({
  totalSales,
  totalRevenue,
  totalProfit,
  averageSale,
}: SalesSummaryCardsProps) {
  const cards = [
    {
      title: "Total Sales",
      value: totalSales,
      icon: <ReceiptIcon sx={{ color: "#3B82F6" }} />,
      bgColor: "#EFF6FF",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: <MoneyIcon sx={{ color: "#10B981" }} />,
      bgColor: "#ECFDF5",
      valueColor: "#10B981",
    },
    {
      title: "Total Profit",
      value: formatCurrency(totalProfit),
      icon: <TrendingUpIcon sx={{ color: "#F59E0B" }} />,
      bgColor: "#FEF3C7",
      valueColor: "#F59E0B",
    },
    {
      title: "Average Sale",
      value: formatCurrency(averageSale),
      icon: <TrendingUpIcon sx={{ color: "#6B7280" }} />,
      bgColor: "#F3F4F6",
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={3} key={card.title}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: card.bgColor,
                    mr: 2,
                  }}
                >
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color={(card as any).valueColor}
                  >
                    {card.value}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
