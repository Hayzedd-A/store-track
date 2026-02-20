"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

interface Category {
  _id: string;
  name: string;
  color: string;
}

interface EditProductForm {
  _id: string;
  name: string;
  sku: string;
  price: string;
  cost: string;
  quantity: string;
  minStock: string;
  shelfNo: string;
  categoryId: string;
  saleUnit: string;
  restockUnit: string;
  unitsPerRestock: string;
}

interface EditProductDialogProps {
  open: boolean;
  form: EditProductForm;
  categories: Category[];
  isLoading: boolean;
  onChange: (field: keyof EditProductForm, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function EditProductDialog({
  open,
  form,
  categories,
  isLoading,
  onChange,
  onClose,
  onSubmit,
}: EditProductDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="Product Name"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              required
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="SKU"
              value={form.sku}
              onChange={(e) => onChange("sku", e.target.value.toUpperCase())}
              required
            />
          </Grid>

          <Grid xs={6} md={3}>
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={form.price}
              onChange={(e) => onChange("price", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₦</InputAdornment>
                ),
              }}
              required
            />
          </Grid>
          <Grid xs={6} md={3}>
            <TextField
              fullWidth
              label="Cost"
              type="number"
              value={form.cost}
              onChange={(e) => onChange("cost", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₦</InputAdornment>
                ),
              }}
              required
            />
          </Grid>
          <Grid xs={6} md={3}>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={form.quantity}
              onChange={(e) => onChange("quantity", e.target.value)}
            />
          </Grid>
          <Grid xs={6} md={3}>
            <TextField
              fullWidth
              label="Min Stock"
              type="number"
              value={form.minStock}
              onChange={(e) => onChange("minStock", e.target.value)}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={form.categoryId}
                label="Category"
                onChange={(e) => onChange("categoryId", e.target.value)}
              >
                <MenuItem value="">No Category</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="Shelf Number"
              value={form.shelfNo}
              onChange={(e) => onChange("shelfNo", e.target.value)}
              placeholder="e.g., A1, B2"
            />
          </Grid>

          <Grid xs={4}>
            <TextField
              fullWidth
              label="Sale Unit"
              value={form.saleUnit}
              onChange={(e) => onChange("saleUnit", e.target.value)}
              placeholder="piece, kg, pack"
            />
          </Grid>
          <Grid xs={4}>
            <TextField
              fullWidth
              label="Restock Unit"
              value={form.restockUnit}
              onChange={(e) => onChange("restockUnit", e.target.value)}
              placeholder="box, crate, dozen"
            />
          </Grid>
          <Grid xs={4}>
            <TextField
              fullWidth
              label="Units per Restock"
              type="number"
              value={form.unitsPerRestock}
              onChange={(e) => onChange("unitsPerRestock", e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
