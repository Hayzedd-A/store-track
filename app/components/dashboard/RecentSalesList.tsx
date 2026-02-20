"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Skeleton,
} from "@mui/material";
import { formatCurrency, formatDate } from "@/lib/utils";

interface SaleItem {
  productName: string;
  quantity: number;
  price: number;
  cost: number;
  subtotal: number;
}

interface Sale {
  _id: string;
  totalAmount: number;
  createdAt: string;
  items: SaleItem[];
}

interface RecentSalesListProps {
  isLoading: boolean;
  sales: Sale[];
}

export default function RecentSalesList({
  isLoading,
  sales,
}: RecentSalesListProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
          Recent Sales
        </Typography>
        {isLoading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <Skeleton height={40} />
              </Box>
            ))
        ) : sales.length ? (
          sales.map((sale) => (
            <Box
              key={sale._id}
              sx={{ mb: 2, p: 2, border: "1px solid #E5E7EB", borderRadius: 1 }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography fontWeight="500">
                    {sale.items.length} item(s) –{" "}
                    {formatCurrency(sale.totalAmount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Profit:{" "}
                    {formatCurrency(
                      sale.items.reduce(
                        (s, i) => s + (i.price - i.cost) * i.quantity,
                        0,
                      ),
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(sale.createdAt)}
                  </Typography>
                </Box>
                <Chip
                  label={sale._id.slice(-8).toUpperCase()}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">No recent sales</Typography>
        )}
      </CardContent>
    </Card>
  );
}
