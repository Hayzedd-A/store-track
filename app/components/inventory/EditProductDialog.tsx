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
import ImageUpload from "../ui/ImageUpload";
import { FormProduct } from "@/app/inventory/page";

interface Category {
  _id: string;
  name: string;
  color: string;
}

interface EditProductDialogProps {
  open: boolean;
  form: FormProduct;
  categories: Category[];
  isLoading: boolean;
  onImageChange: (file: File) => void;
  onImageRemove: () => void;
  setForm: React.Dispatch<React.SetStateAction<FormProduct>>;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditProductDialog({
  open,
  form,
  setForm,
  onImageChange,
  onImageRemove,
  categories,
  isLoading,
  onClose,
  onUpdate,
}: EditProductDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid>
            {/* Image Upload for Edit Product */}
            <ImageUpload
              label="Product Image"
              previewUrl={
                form.newImageFile
                  ? URL.createObjectURL(form.newImageFile)
                  : form.imageRemoved
                    ? null
                    : form.currentImage
              }
              onChange={onImageChange}
              onRemove={onImageRemove}
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="Product Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="SKU"
              value={form.sku}
              disabled
              helperText="SKU cannot be modified after creation"
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="Barcode"
              value={form.barcode || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  barcode: e.target.value,
                })
              }
              placeholder="Scan or enter barcode"
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₦</InputAdornment>
                ),
              }}
              required
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="Cost"
              type="number"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₦</InputAdornment>
                ),
              }}
              required
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="Min Stock"
              type="number"
              value={form.minStock}
              onChange={(e) => setForm({ ...form, minStock: e.target.value })}
            />
          </Grid>
          <Grid>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={form.categoryId}
                label="Category"
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
              >
                <MenuItem value="">No Category</MenuItem>
                {categories.map((cat: Category) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="Shelf Number"
              value={form.shelfNo}
              onChange={(e) => setForm({ ...form, shelfNo: e.target.value })}
              placeholder="e.g., A1, B2"
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="Sale Unit"
              value={form.saleUnit}
              onChange={(e) => setForm({ ...form, saleUnit: e.target.value })}
              placeholder="piece, kg, pack"
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="Restock Unit"
              value={form.restockUnit}
              onChange={(e) =>
                setForm({ ...form, restockUnit: e.target.value })
              }
              placeholder="box, crate, dozen"
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="Units per Restock"
              type="number"
              value={form.unitsPerRestock}
              onChange={(e) =>
                setForm({ ...form, unitsPerRestock: Number(e.target.value) })
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={() => onClose()}>Cancel</Button>
        <Button variant="contained" onClick={onUpdate} disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
