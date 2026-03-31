"use client";

import { useState } from "react";

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
  IconButton,
  Tooltip,
  Divider,
  Typography,
  Paper,
  Box,
} from "@mui/material";
import { AutoAwesome as AutoAwesomeIcon, QrCodeScanner as ScannerIcon } from "@mui/icons-material";
import ImageUpload from "@/app/components/ui/ImageUpload";
import BarcodeScanner from "@/app/components/pos/BarcodeScanner";

interface Category {
  _id: string;
  name: string;
  color: string;
}

interface AddProductForm {
  _id?: string;
  name: string;
  sku: string;
  barcode?: string;
  price: string;
  cost: string;
  quantity: string;
  minStock: string;
  shelfNo?: string;
  image?: null | File;
  publicId?: string;
  saleUnit: string;
  restockUnit: string;
  unitsPerRestock: number;
  categoryId?: string;
  currentImage?: string | null;
  currentPublicId?: string | null;
  newImageFile?: File | null;
  imageRemoved?: boolean;
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
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleGenerateSku = async () => {
    try {
      const res = await fetch("/api/products/generate-sku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: form.categoryId || null }),
      });
      const data = await res.json();
      if (data.success && data.sku) {
        onChange("sku", data.sku);
      } else {
        console.error("Failed to generate SKU:", data.message);
      }
    } catch (err) {
      console.error("Failed to generate SKU error:", err);
    }
  };

  const SectionHeader = ({
    title,
    icon,
  }: {
    title: string;
    icon?: React.ReactNode;
  }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, mt: 2 }}>
      {icon}
      <Typography variant="subtitle1" fontWeight="bold" color="primary">
        {title}
      </Typography>
      <Divider sx={{ flex: 1 }} />
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="span">
          Add New Product
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={3}>
          {/* Basic Information Section */}
          <Grid size={12}>
            <SectionHeader title="Basic Information" />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Product Name"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              required
              placeholder="Enter product name"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="SKU"
              value={form.sku}
              onChange={(e) => onChange("sku", e.target.value.toUpperCase())}
              required
              placeholder="Auto-generated or custom SKU"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Auto-generate SKU">
                      <IconButton
                        onClick={handleGenerateSku}
                        edge="end"
                        size="small"
                      >
                        <AutoAwesomeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              label="Barcode"
              value={form.barcode}
              onChange={(e) => onChange("barcode", e.target.value)}
              placeholder="Scan or enter barcode"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Scan Barcode">
                      <IconButton
                        onClick={() => setScannerOpen(true)}
                        edge="end"
                        size="small"
                      >
                        <ScannerIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Product Image Section */}
          <Grid size={12}>
            <SectionHeader title="Product Image" />
          </Grid>

          <Grid size={12}>
            <Paper
              variant="outlined"
              sx={{ p: 2, bgcolor: "background.default" }}
            >
              <ImageUpload
                label="Product Image"
                previewUrl={imagePreview}
                onChange={onImageChange}
              />
            </Paper>
          </Grid>

          {/* Pricing & Inventory Section */}
          <Grid size={12}>
            <SectionHeader title="Pricing & Inventory" />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
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
              placeholder="0.00"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
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
              placeholder="0.00"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Initial Quantity"
              type="number"
              value={form.quantity}
              onChange={(e) => onChange("quantity", e.target.value)}
              placeholder="0"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Minimum Stock Level"
              type="number"
              value={form.minStock}
              onChange={(e) => onChange("minStock", e.target.value)}
              placeholder="Low stock alert threshold"
            />
          </Grid>

          {/* Classification Section */}
          <Grid size={12}>
            <SectionHeader title="Classification & Location" />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
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

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Shelf / Location"
              value={form.shelfNo}
              onChange={(e) => onChange("shelfNo", e.target.value)}
              placeholder="e.g., A1, B2, Warehouse 3"
            />
          </Grid>

          {/* Unit Management Section */}
          <Grid size={12}>
            <SectionHeader title="Unit Management" />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Sale Unit"
              value={form.saleUnit}
              onChange={(e) => onChange("saleUnit", e.target.value)}
              placeholder="piece, kg, pack"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Restock Unit"
              value={form.restockUnit}
              onChange={(e) => onChange("restockUnit", e.target.value)}
              placeholder="box, crate, dozen"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Units per Restock"
              type="number"
              value={form.unitsPerRestock}
              onChange={(e) => onChange("unitsPerRestock", e.target.value)}
              placeholder="Quantity per restock order"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={isLoading}
          sx={{ minWidth: 120 }}
        >
          {isLoading ? "Adding..." : "Add Product"}
        </Button>
      </DialogActions>

      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onBarcodeDetected={(barcode) => {
          onChange("barcode", barcode);
        }}
      />
    </Dialog>
  );
}
