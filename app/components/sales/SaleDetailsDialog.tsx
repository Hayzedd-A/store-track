"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
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
  items: SaleItem[];
  createdAt: string;
}

interface SaleDetailsDialogProps {
  open: boolean;
  sale: Sale | null;
  onClose: () => void;
}

export default function SaleDetailsDialog({
  open,
  sale,
  onClose,
}: SaleDetailsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Sale Details</DialogTitle>
      <DialogContent>
        {sale && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
                p: 2,
                backgroundColor: "#F1F5F9",
                borderRadius: 2,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Sale ID
                </Typography>
                <Typography fontWeight="600">
                  {sale._id.slice(-8).toUpperCase()}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" color="text.secondary">
                  Date
                </Typography>
                <Typography fontWeight="600">
                  {formatDate(sale.createdAt)}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Items
            </Typography>
            {sale.items.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 1,
                  borderBottom: "1px solid #E5E7EB",
                }}
              >
                <Box>
                  <Typography fontWeight="500">{item.productName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.quantity} x {formatCurrency(item.price)}
                  </Typography>
                </Box>
                <Typography fontWeight="600">
                  {formatCurrency(item.subtotal)}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6" fontWeight="bold">
                Total
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {formatCurrency(sale.totalAmount)}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
