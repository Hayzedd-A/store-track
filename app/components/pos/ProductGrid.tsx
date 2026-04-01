"use client";

import { Grid, Card, Typography, Chip, Box } from "@mui/material";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { IProduct } from "@/types";
import { useEffect, useState } from "react";

interface ProductGridProps {
  products: IProduct[];
  isLoading: boolean;
  onAddToCart: (product: IProduct) => void;
  viewMode?: "grid" | "list" | "cart";
}

export default function ProductGrid({
  products,
  isLoading,
  onAddToCart,
  viewMode = "grid",
}: ProductGridProps) {
  const [productViewMode, setProductViewMode] = useState<"grid" | "list">(
    "grid",
  );

  useEffect(() => {
    if (viewMode !== "cart") setProductViewMode(viewMode);
  }, [viewMode]);

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

  if (productViewMode === "list") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {products.map((product) => (
          <Card
            key={product._id}
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { transform: "translateX(4px)", boxShadow: 3 },
              border:
                product.quantity === 0
                  ? "2px solid #EF4444"
                  : "1px solid #E5E7EB",
            }}
            onClick={() => onAddToCart(product)}
          >
            <Image
              src={product.image ? product.image : "/placeholder.jpeg"}
              alt={product.name}
              width={64}
              height={64}
              style={{ objectFit: "cover", borderRadius: 8, marginRight: 16 }}
              unoptimized
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight="600" noWrap>
                {product.name}
              </Typography>
              {product.shelfNo && (
                <Chip
                  label={`Shelf ${product.shelfNo}`}
                  size="small"
                  sx={{ mt: 0.5, fontSize: "0.7rem", height: 20 }}
                />
              )}
            </Box>
            <Box sx={{ textAlign: "right", ml: 2 }}>
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                {formatCurrency(product.price)}
              </Typography>
              <Typography
                variant="caption"
                color={
                  product.quantity <= product.minStock
                    ? "error"
                    : "text.secondary"
                }
                sx={{ display: "block" }}
              >
                {product.quantity} {product.unitConfig.saleUnit}
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {products.map((product) => (
        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={product._id}>
          <Card
            sx={{
              p: 2,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
              border:
                product.quantity === 0
                  ? "2px solid #EF4444"
                  : "1px solid #E5E7EB",
            }}
            onClick={() => onAddToCart(product)}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Image
                src={product.image ? product.image : "/placeholder.jpeg"}
                alt={product.name}
                width={100}
                height={100}
                style={{ objectFit: "cover", borderRadius: 8 }}
                unoptimized
              />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                sx={{
                  mb: 0.5,
                  minHeight: 48,
                  display: "-webkit-box",
                  overflow: "hidden",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                }}
              >
                {product.name}
              </Typography>
              {product.shelfNo && (
                <Chip
                  label={`Shelf ${product.shelfNo}`}
                  size="small"
                  sx={{ mb: 1, fontSize: "0.7rem", height: 20 }}
                />
              )}
            </Box>
            <Box>
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                {formatCurrency(product.price)}
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
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
