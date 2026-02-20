"use client";

import { Grid, Card, Typography, Chip } from "@mui/material";
import { formatCurrency } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  quantity: number;
  minStock: number;
  shelfNo?: string;
  unitConfig: {
    saleUnit: string;
    restockUnit: string;
    unitsPerRestock: number;
  };
  categoryId?: { _id: string; name: string; color: string } | null;
}

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({
  products,
  isLoading,
  onAddToCart,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Grid key={i}>
              <Card sx={{ p: 2, textAlign: "center", cursor: "pointer" }}>
                <Typography variant="h6">Loading...</Typography>
              </Card>
            </Grid>
          ))}
      </Grid>
    );
  }

  if (products.length === 0) {
    return (
      <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>
        No products found
      </Typography>
    );
  }

  return (
    <Grid container spacing={2}>
      {products.map((product) => (
        <Grid key={product._id}>
          <Card
            sx={{
              p: 2,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
              border: product.quantity === 0 ? "2px solid #EF4444" : "none",
            }}
            onClick={() => onAddToCart(product)}
          >
            <Typography
              variant="subtitle1"
              fontWeight="600"
              sx={{ mb: 0.5 }}
              noWrap
            >
              {product.name}
            </Typography>
            {product.shelfNo && (
              <Chip
                label={`Shelf ${product.shelfNo}`}
                size="small"
                sx={{ mb: 1, fontSize: "0.7rem" }}
              />
            )}
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              {formatCurrency(product.cost)}
            </Typography>
            <Typography
              variant="caption"
              color={
                product.quantity <= product.minStock
                  ? "error"
                  : "text.secondary"
              }
            >
              {product.quantity} {product.unitConfig.saleUnit} in stock
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
