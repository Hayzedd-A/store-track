"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import { formatCurrency } from "@/lib/utils";

interface CartItem {
  product: { name: string };
  quantity: number;
  subtotal: number;
}

interface Sale {
  saleId: string;
  total: number;
  items: CartItem[];
}

interface ReceiptDialogProps {
  open: boolean;
  sale: Sale | null;
  onClose: () => void;
}

export default function ReceiptDialog({
  open,
  sale,
  onClose,
}: ReceiptDialogProps) {
  const generateReceipt = () => {
    if (!sale) return "";
    const date = new Date().toLocaleString();
    return `
      <div style="font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">StoreTrack</h2>
          <p style="margin: 5px 0;">Stock Management System</p>
          <p style="margin: 5px 0; font-size: 12px;">${date}</p>
          <p style="margin: 5px 0; font-size: 12px;">Receipt #: ${sale.saleId.slice(-8).toUpperCase()}</p>
        </div>
        <div style="border-top: 1px dashed #333; border-bottom: 1px dashed #333; padding: 10px 0; margin-bottom: 10px;">
          ${sale.items
            .map(
              (item) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>${item.product.name} x${item.quantity}</span>
              <span>${formatCurrency(item.subtotal)}</span>
            </div>
          `,
            )
            .join("")}
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; margin-top: 10px;">
          <span>TOTAL</span>
          <span>${formatCurrency(sale.total)}</span>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 12px;">
          <p>Thank you for your business!</p>
        </div>
      </div>
    `;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        Sale Complete!
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            textAlign: "center",
            py: 2,
            mb: 2,
            backgroundColor: "#ECFDF5",
            borderRadius: 2,
          }}
        >
          <ReceiptIcon sx={{ fontSize: 48, color: "#10B981", mb: 1 }} />
          <Typography variant="h5" fontWeight="bold" color="#10B981">
            {sale && formatCurrency(sale.total)}
          </Typography>
        </Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Receipt Preview:
        </Typography>
        <Box
          id="receipt-preview"
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 2,
            p: 2,
            backgroundColor: "#FAFAFA",
          }}
          dangerouslySetInnerHTML={{ __html: generateReceipt() }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          onClick={() => window.print()}
          sx={{ backgroundColor: "#3B82F6" }}
        >
          Print Receipt
        </Button>
      </DialogActions>
    </Dialog>
  );
}
