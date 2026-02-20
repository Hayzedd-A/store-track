"use client";

import { Box, Card, CardContent, Typography, Skeleton } from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";

interface LowStockItem {
  _id: string;
  name: string;
  quantity: number;
  minStock: number;
}

interface LowStockAlertsProps {
  isLoading: boolean;
  items: LowStockItem[];
}

export default function LowStockAlerts({
  isLoading,
  items,
}: LowStockAlertsProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
          Low Stock Alerts
        </Typography>
        {isLoading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <Skeleton height={40} />
              </Box>
            ))
        ) : items.length ? (
          items.map((item) => (
            <Box
              key={item._id}
              sx={{
                mb: 2,
                p: 2,
                border: "1px solid #F59E0B",
                borderRadius: 1,
                bgcolor: "#FFFBEB",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography fontWeight="500">{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current: {item.quantity} | Min: {item.minStock}
                  </Typography>
                </Box>
                <WarningIcon color="warning" />
              </Box>
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">No low stock items</Typography>
        )}
      </CardContent>
    </Card>
  );
}
