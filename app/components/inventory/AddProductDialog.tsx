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
import ImageUpload from "@/app/components/ui/ImageUpload";

interface Category {
  _id: string;
  name: string;
  color: string;
}

interface AddProductForm {
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
  image: File | null;
}

interface AddProductDialogProps {
  open: boolean;
  form: AddProductForm;
  imagePreview: string | null;
  categories: Category[];
  isLoading: boolean;
  onChange: (field: keyof AddProductForm, value: string) => void;
  onImageChange: (file: File) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function AddProductDialog({
  open,
  form,
  imagePreview,
  categories,
  isLoading,
  onChange,
  onImageChange,
  onClose,
  onSubmit,
}: AddProductDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Product</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid>
            <TextField
              fullWidth
              label="Product Name"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              required
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="SKU"
              value={form.sku}
              onChange={(e) => onChange("sku", e.target.value.toUpperCase())}
              required
            />
          </Grid>

          <Grid >
            <ImageUpload
              label="Product Image"
              previewUrl={imagePreview}
              onChange={onImageChange}
            />
          </Grid>

          <Grid >
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
          <Grid >
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
          <Grid >
            <TextField
              fullWidth
              label="Initial Quantity"
              type="number"
              value={form.quantity}
              onChange={(e) => onChange("quantity", e.target.value)}
            />
          </Grid>
          <Grid >
            <TextField
              fullWidth
              label="Min Stock"
              type="number"
              value={form.minStock}
              onChange={(e) => onChange("minStock", e.target.value)}
            />
          </Grid>

          <Grid >
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
          <Grid >
            <TextField
              fullWidth
              label="Shelf Number"
              value={form.shelfNo}
              onChange={(e) => onChange("shelfNo", e.target.value)}
              placeholder="e.g., A1, B2"
            />
          </Grid>

          <Grid >
            <TextField
              fullWidth
              label="Sale Unit"
              value={form.saleUnit}
              onChange={(e) => onChange("saleUnit", e.target.value)}
              placeholder="piece, kg, pack"
            />
          </Grid>
          <Grid >
            <TextField
              fullWidth
              label="Restock Unit"
              value={form.restockUnit}
              onChange={(e) => onChange("restockUnit", e.target.value)}
              placeholder="box, crate, dozen"
            />
          </Grid>
          <Grid >
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
          {isLoading ? "Adding..." : "Add Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
