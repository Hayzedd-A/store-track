"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";

interface Product {
  _id: string;
  name: string;
  quantity: number;
  cost: number;
  unitConfig: {
    saleUnit: string;
    restockUnit: string;
    unitsPerRestock: number;
  };
}

interface RestockForm {
  quantity: string;
  cost: string;
  notes: string;
}

interface RestockDialogProps {
  open: boolean;
  product: Product | null;
  form: RestockForm;
  isLoading: boolean;
  onChange: (field: keyof RestockForm, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function RestockDialog({
  open,
  product,
  form,
  isLoading,
  onChange,
  onClose,
  onSubmit,
}: RestockDialogProps) {
  // Calculate equivalent unit quantity
  const restockQty = parseInt(form.quantity) || 0;
  const unitsPerRestock = product?.unitConfig?.unitsPerRestock || 1;
  const equivalentQty = restockQty * unitsPerRestock;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Restock Product</DialogTitle>
      <DialogContent>
        {product && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight="600">
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Current Stock: {product.quantity} {product.unitConfig.saleUnit}
            </Typography>
            <TextField
              fullWidth
              label={`Quantity (${product.unitConfig.restockUnit})`}
              type="number"
              value={form.quantity}
              onChange={(e) => onChange("quantity", e.target.value)}
              helperText={`Each ${product.unitConfig.restockUnit} = ${product.unitConfig.unitsPerRestock} ${product.unitConfig.saleUnit}`}
              sx={{ mb: 2 }}
            />
            {restockQty > 0 && (
              <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                Equivalent: {equivalentQty} {product.unitConfig.saleUnit}
              </Typography>
            )}
            <TextField
              fullWidth
              label="Cost Price (optional)"
              type="number"
              value={form.cost}
              onChange={(e) => onChange("cost", e.target.value)}
              placeholder={`${product.cost.toLocaleString()}`}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">₦</InputAdornment>
                  ),
                },
              }}
              helperText={`Current cost: ₦${product.cost.toLocaleString()} per ${product.unitConfig.saleUnit}`}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Notes (optional)"
              value={form.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              multiline
              rows={2}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={isLoading}>
          {isLoading ? "Restocking..." : "Restock"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
