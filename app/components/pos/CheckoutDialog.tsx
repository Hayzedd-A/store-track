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
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { formatCurrency } from "@/lib/utils";

interface CheckoutDialogProps {
  open: boolean;
  cartTotal: number;
  itemCount: number;
  isProcessing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CheckoutDialog({
  open,
  cartTotal,
  itemCount,
  isProcessing,
  onClose,
  onConfirm,
}: CheckoutDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        Complete Sale
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="h3" fontWeight="bold" color="primary.main">
            {formatCurrency(cartTotal)}
          </Typography>
          <Typography color="text.secondary">Total Amount</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Payment method: Cash
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {itemCount} item(s) in this sale
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={isProcessing}
          sx={{ minWidth: 120 }}
        >
          {isProcessing ? "Processing..." : "Complete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
