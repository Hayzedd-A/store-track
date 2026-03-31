"use client";

import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import { TrendingDown as TrendingDownIcon } from "@mui/icons-material";
import { formatCurrency } from "@/lib/utils";

interface Product {
  price: number;
  quantity: number;
  minStock: number;
}

interface InventoryStatsBarProps {
  products: Product[];
}

export default function InventoryStatsBar({
  products,
}: InventoryStatsBarProps) {
  const lowStockCount = products.filter((p) => p.quantity <= p.minStock).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Total Products
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {products.length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid>
        <Card
          sx={{
            borderRadius: 3,
            backgroundColor: "#FFFBEB",
            border: "1px solid #FCD34D",
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TrendingDownIcon sx={{ color: "#F59E0B", mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Low Stock Items
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#F59E0B">
                  {lowStockCount}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Total Value
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {formatCurrency(totalValue)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
