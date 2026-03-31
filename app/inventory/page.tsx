"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import {
  formatCurrency,
  getStockStatus,
  getStockStatusColor,
} from "@/lib/utils";
import EditProductDialog from "../components/inventory/EditProductDialog";
import SnackbarAlert from "../components/ui/SnackbarAlert";
import RestockDialog from "../components/inventory/RestockDialog";
import AddProductDialog from "../components/inventory/AddProductDialog";

interface Product {
  _id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  cost: number;
  quantity: number;
  minStock: number;
  shelfNo?: string;
  image?: string; // Added image field
  publicId?: string; // Added publicId field
  unitConfig: {
    saleUnit: string;
    restockUnit: string;
    unitsPerRestock: number;
  };
  categoryId?: {
    _id: string;
    name: string;
    color: string;
  } | null;
}

export interface FormProduct {
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

// Form validation schema would go here with Zod
// For simplicity, we'll handle validation inline

export default function InventoryPage() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openRestockDialog, setOpenRestockDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const formDefault = {
    name: "",
    sku: "",
    barcode: "",
    price: "",
    cost: "",
    quantity: "",
    minStock: "",
    shelfNo: "",
    categoryId: "",
    saleUnit: "piece",
    restockUnit: "box",
    unitsPerRestock: 12,
    image: null as File | null,
  };

  // Form state for adding product
  const [addForm, setAddForm] = useState<FormProduct>(formDefault);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form state for restocking
  const [restockForm, setRestockForm] = useState({
    quantity: "",
    cost: "",
    notes: "",
  });
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<FormProduct>({
    ...formDefault,
    currentImage: null as string | null, // Existing image URL
    currentPublicId: null as string | null, // Existing public ID
    newImageFile: null as File | null, // Newly selected image file
    imageRemoved: false, // Flag to indicate if existing image should be removed
  });

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products", stockFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (stockFilter === "low") params.append("lowStock", "true");
      params.append("limit", "100");
      const res = await fetch(`/api/products?${params.toString()}`);
      return res.json();
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      return res.json();
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: typeof addForm) => {
      const formData = new FormData();
      formData.append("name", productData.name);
      formData.append("sku", productData.sku);
      if (productData.barcode) {
        formData.append("barcode", productData.barcode);
      }
      formData.append("price", String(productData.price));
      formData.append("cost", String(productData.cost));
      formData.append("quantity", String(productData.quantity) || "0");
      formData.append("minStock", String(productData.minStock));
      formData.append("shelfNo", productData.shelfNo || "");
      formData.append("categoryId", productData.categoryId || "");
      formData.append("saleUnit", productData.saleUnit);
      formData.append("restockUnit", productData.restockUnit);
      formData.append("unitsPerRestock", String(productData.unitsPerRestock));

      if (productData.image) {
        formData.append("image", productData.image);
      }

      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create product");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setOpenAddDialog(false);
      setAddForm(formDefault);
      setImagePreview(null);
      setSnackbar({
        open: true,
        message: "Product added successfully!",
        severity: "success",
      });
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    },
  });

  // Restock mutation
  const restockMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
      cost,
      notes,
    }: {
      productId: string;
      quantity: number;
      cost?: string;
      notes?: string;
    }) => {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity,
          cost: cost ? parseFloat(cost) : null,
          notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to restock");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setOpenRestockDialog(false);
      setSelectedProduct(null);
      setRestockForm({ quantity: "", cost: "", notes: "" });
      setSnackbar({
        open: true,
        message: "Product restocked successfully!",
        severity: "success",
      });
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (payload: FormData) => {
      // Expect FormData as payload
      const res = await fetch(`/api/products/${payload.get("_id")}`, {
        // Get ID from FormData
        method: "PUT",
        body: payload, // Pass FormData directly
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update product");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setOpenEditDialog(false);
      setSnackbar({
        open: true,
        message: "Product updated successfully!",
        severity: "success",
      });
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    },
  });

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];
  const lowStockCount = products.filter(
    (p: Product) => p.quantity <= p.minStock,
  ).length;

  // Handlers for EditProductDialog image changes
  const handleEditImageChange = (file: File) => {
    setEditForm((prev) => ({
      ...prev,
      newImageFile: file,
      imageRemoved: false, // If a new image is selected, it's not removed
    }));
  };

  const handleEditImageRemove = () => {
    setEditForm((prev) => ({
      ...prev,
      newImageFile: null,
      imageRemoved: true, // Mark existing image for removal
    }));
  };

  // const handleAddProduct = () => {
  //   if (!addForm.name || !addForm.sku || !addForm.price || !addForm.cost) {
  //     setSnackbar({
  //       open: true,
  //       message: "Please fill in all required fields",
  //       severity: "error",
  //     });
  //     return;
  //   }
  //   createProductMutation.mutate(addForm);
  // };

  const handleRestock = () => {
    if (!selectedProduct || !restockForm.quantity) {
      setSnackbar({
        open: true,
        message: "Please enter quantity",
        severity: "error",
      });
      return;
    }
    restockMutation.mutate({
      productId: selectedProduct._id,
      quantity:
        parseInt(restockForm.quantity) *
          selectedProduct.unitConfig.unitsPerRestock || 1,
      cost: restockForm.cost || undefined,
      notes: restockForm.notes,
    });
  };

  const openRestockDialogWithProduct = (product: Product) => {
    setSelectedProduct(product);
    setOpenRestockDialog(true);
  };

  const openEditDialogWithProduct = (product: Product) => {
    setEditForm({
      _id: product._id,
      name: product.name || "",
      sku: product.sku || "",
      barcode: (product as any).barcode || "",
      price: String(product.price) || "",
      cost: String(product.cost) || "",
      quantity: String(product.quantity) || "",
      minStock: String(product.minStock) || "",
      shelfNo: product.shelfNo || "",
      categoryId: product.categoryId?._id || "",
      saleUnit: product.unitConfig?.saleUnit || "piece",
      restockUnit: product.unitConfig?.restockUnit || "box",
      unitsPerRestock: product.unitConfig?.unitsPerRestock || 12,
      currentImage: product.image || null, // Initialize current image
      currentPublicId: product.publicId || null, // Initialize current public ID
      newImageFile: null, // Reset new image file
      imageRemoved: false, // Reset image removed flag
    });
    setOpenEditDialog(true);
  };

  const handleUpdateProduct = async () => {
    if (!editForm._id) {
      setSnackbar({
        open: true,
        message: "Invalid product",
        severity: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("_id", editForm._id);
    formData.append("name", editForm.name);
    formData.append("sku", editForm.sku);
    if (editForm.barcode) {
      formData.append("barcode", editForm.barcode);
    }
    formData.append("price", String(editForm.price));
    formData.append("cost", String(editForm.cost));
    formData.append("quantity", String(editForm.quantity));
    formData.append("minStock", String(editForm.minStock));
    formData.append("shelfNo", editForm.shelfNo || "");
    formData.append("categoryId", editForm.categoryId || "");
    formData.append("saleUnit", editForm.saleUnit);
    formData.append("restockUnit", editForm.restockUnit);
    formData.append("unitsPerRestock", String(editForm.unitsPerRestock));
    formData.append("imageRemoved", String(editForm.imageRemoved)); // Send as string

    if (editForm.currentPublicId) {
      formData.append("currentPublicId", editForm.currentPublicId);
    }
    if (editForm.newImageFile) {
      formData.append("image", editForm.newImageFile);
    }

    try {
      await updateProductMutation.mutateAsync(formData);
    } catch (error: any) {
      console.error("Failed to update product:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to update product",
        severity: "error",
      });
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <InventoryIcon sx={{ fontSize: 32, color: "primary.main", mr: 1 }} />
          <Typography variant="h4" fontWeight="bold">
            Inventory
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
          sx={{ backgroundColor: "#1E40AF" }}
        >
          Add Product
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Products
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {products.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid>
          <Card
            sx={{
              borderRadius: 3,
              backgroundColor: "#FFFBEB",
              border: "1px solid #FCD34D",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TrendingDownIcon sx={{ color: "#F59E0B", mr: 1 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock Items
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#F59E0B">
                    {lowStockCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Value
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(
                  products.reduce(
                    (sum: number, p: Product) =>
                      sum + Number(p.price) * Number(p.quantity),
                    0,
                  ),
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid>
              <FormControl fullWidth size="small">
                <InputLabel>Stock Status</InputLabel>
                <Select
                  value={stockFilter}
                  label="Stock Status"
                  onChange={(e) => setStockFilter(e.target.value)}
                >
                  <MenuItem value="all">All Products</MenuItem>
                  <MenuItem value="low">Low Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["products"] })
                }
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card sx={{ borderRadius: 3 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#F1F5F9" }}>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productsLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      {Array(7)
                        .fill(0)
                        .map((_, j) => (
                          <TableCell key={j}>
                            <Box
                              sx={{
                                height: 24,
                                backgroundColor: "#E2E8F0",
                                borderRadius: 1,
                              }}
                            />
                          </TableCell>
                        ))}
                    </TableRow>
                  ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No products found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product: Product) => {
                  const status = getStockStatus(
                    product.quantity,
                    product.minStock,
                  );
                  return (
                    <TableRow key={product._id} hover>
                      <TableCell>
                        <Typography fontWeight="600">{product.name}</Typography>
                        {product.shelfNo && (
                          <Chip
                            label={`Shelf ${product.shelfNo}`}
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <code
                        // sx={{
                        //   backgroundColor: "#F1F5F9",
                        //   px: 1,
                        //   py: 0.5,
                        //   borderRadius: 1,
                        // }}
                        >
                          {product.sku}
                        </code>
                      </TableCell>
                      <TableCell>
                        {product.categoryId ? (
                          <Chip
                            label={product.categoryId.name}
                            size="small"
                            sx={{
                              backgroundColor: product.categoryId.color + "20",
                              color: product.categoryId.color,
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            None
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        <Typography
                          fontWeight="600"
                          color={
                            product.quantity === 0
                              ? "error.main"
                              : product.quantity <= product.minStock
                                ? "warning.main"
                                : "text.primary"
                          }
                        >
                          {product.quantity} {product.unitConfig.saleUnit}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={status.replace("-", " ")}
                          size="small"
                          sx={{
                            color: getStockStatusColor(status),
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() => openEditDialogWithProduct(product)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Restock">
                          <IconButton
                            color="primary"
                            onClick={() =>
                              openRestockDialogWithProduct(product)
                            }
                          >
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Product Dialog */}
      <AddProductDialog
        open={openAddDialog}
        form={addForm}
        imagePreview={imagePreview}
        categories={categories || []}
        isLoading={createProductMutation.isPending}
        onChange={(field, value) => {
          setAddForm((prev) => ({
            ...prev,
            [field]: value,
          }));
        }}
        onImageChange={(file) => {
          setAddForm((prev) => ({ ...prev, image: file }));
          setImagePreview(URL.createObjectURL(file));
        }}
        onClose={() => setOpenAddDialog(false)}
        onSubmit={() => createProductMutation.mutate(addForm)}
      />

      {/* Edit Product Dialog */}
      <EditProductDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        form={editForm}
        setForm={setEditForm}
        categories={categories}
        onImageChange={handleEditImageChange}
        isLoading={updateProductMutation.isPending}
        onImageRemove={handleEditImageRemove}
        onUpdate={handleUpdateProduct}
      />

      {/* Restock Dialog */}
      <RestockDialog
        open={openRestockDialog}
        product={selectedProduct}
        form={restockForm}
        isLoading={restockMutation.isPending}
        onChange={(field, value) =>
          setRestockForm({ ...restockForm, [field]: value })
        }
        onClose={() => setOpenRestockDialog(false)}
        onSubmit={handleRestock}
      />

      {/* Snackbar */}
      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
}
