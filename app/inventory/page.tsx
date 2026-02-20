'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { formatCurrency, getStockStatus, getStockStatusColor } from '@/lib/utils';

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  quantity: number;
  minStock: number;
  shelfNo?: string;
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

interface Category {
  _id: string;
  name: string;
  color: string;
}

// Form validation schema would go here with Zod
// For simplicity, we'll handle validation inline

export default function InventoryPage() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openRestockDialog, setOpenRestockDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Form state for adding product
  const [addForm, setAddForm] = useState({
    name: '',
    sku: '',
    price: '',
    cost: '',
    quantity: '',
    minStock: '5',
    shelfNo: '',
    categoryId: '',
    saleUnit: 'piece',
    restockUnit: 'box',
    unitsPerRestock: '12',
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form state for restocking
  const [restockForm, setRestockForm] = useState({
    quantity: '',
    notes: '',
  });
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    _id: '',
    name: '',
    sku: '',
    price: '',
    cost: '',
    quantity: '',
    minStock: '',
    shelfNo: '',
    categoryId: '',
    saleUnit: '',
    restockUnit: '',
    unitsPerRestock: '',
  });

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', stockFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (stockFilter === 'low') params.append('lowStock', 'true');
      params.append('limit', '100');
      const res = await fetch(`/api/products?${params.toString()}`);
      return res.json();
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      return res.json();
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: typeof addForm) => {
      if (productData.image) {
        const formData = new FormData();
        formData.append('name', productData.name);
        formData.append('sku', productData.sku);
        formData.append('price', productData.price);
        formData.append('cost', productData.cost);
        formData.append('quantity', productData.quantity || '0');
        formData.append('minStock', productData.minStock);
        formData.append('shelfNo', productData.shelfNo || '');
        formData.append('categoryId', productData.categoryId || '');
        formData.append('saleUnit', productData.saleUnit);
        formData.append('restockUnit', productData.restockUnit);
        formData.append('unitsPerRestock', productData.unitsPerRestock);
        formData.append('image', productData.image);

        const res = await fetch('/api/products', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to create product');
        }
        return res.json();
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: productData.name,
            sku: productData.sku,
            price: parseFloat(productData.price),
            cost: parseFloat(productData.cost),
            quantity: parseInt(productData.quantity) || 0,
            minStock: parseInt(productData.minStock),
            shelfNo: productData.shelfNo || null,
            categoryId: productData.categoryId || null,
            unitConfig: {
              saleUnit: productData.saleUnit,
              restockUnit: productData.restockUnit,
              unitsPerRestock: parseInt(productData.unitsPerRestock),
            },
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to create product');
        }
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setOpenAddDialog(false);
      setAddForm({
        name: '',
        sku: '',
        price: '',
        cost: '',
        quantity: '',
        minStock: '5',
        shelfNo: '',
        categoryId: '',
        saleUnit: 'piece',
        restockUnit: 'box',
        unitsPerRestock: '12',
        image: null,
      });
      setImagePreview(null);
      setSnackbar({ open: true, message: 'Product added successfully!', severity: 'success' });
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    },
  });

  // Restock mutation
  const restockMutation = useMutation({
    mutationFn: async ({ productId, quantity, notes }: { productId: string; quantity: number; notes?: string }) => {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, notes }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to restock');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setOpenRestockDialog(false);
      setSelectedProduct(null);
      setRestockForm({ quantity: '', notes: '' });
      setSnackbar({ open: true, message: 'Product restocked successfully!', severity: 'success' });
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`/api/products/${payload._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update product');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setOpenEditDialog(false);
      setSnackbar({ open: true, message: 'Product updated successfully!', severity: 'success' });
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    },
  });

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];
  const lowStockCount = products.filter((p: Product) => p.quantity <= p.minStock).length;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAddForm({ ...addForm, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = () => {
    if (!addForm.name || !addForm.sku || !addForm.price || !addForm.cost) {
      setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
      return;
    }
    createProductMutation.mutate(addForm);
  };

  const handleRestock = () => {
    if (!selectedProduct || !restockForm.quantity) {
      setSnackbar({ open: true, message: 'Please enter quantity', severity: 'error' });
      return;
    }
    restockMutation.mutate({
      productId: selectedProduct._id,
      quantity: parseInt(restockForm.quantity) * selectedProduct.unitConfig.unitsPerRestock || 1,
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
      name: product.name || '',
      sku: product.sku || '',
      price: String(product.price || ''),
      cost: String(product.cost || ''),
      quantity: String(product.quantity || ''),
      minStock: String(product.minStock || ''),
      shelfNo: product.shelfNo || '',
      categoryId: product.categoryId?._id || '',
      saleUnit: product.unitConfig?.saleUnit || 'piece',
      restockUnit: product.unitConfig?.restockUnit || 'box',
      unitsPerRestock: String(product.unitConfig?.unitsPerRestock || ''),
    });
    setOpenEditDialog(true);
  };

  const handleUpdateProduct = () => {
    if (!editForm._id) {
      setSnackbar({ open: true, message: 'Invalid product', severity: 'error' });
      return;
    }
    updateProductMutation.mutate({
      _id: editForm._id,
      name: editForm.name,
      sku: editForm.sku,
      price: parseFloat(editForm.price) || 0,
      cost: parseFloat(editForm.cost) || 0,
      quantity: parseInt(editForm.quantity) || 0,
      minStock: parseInt(editForm.minStock) || 0,
      shelfNo: editForm.shelfNo || null,
      categoryId: editForm.categoryId || null,
      unitConfig: {
        saleUnit: editForm.saleUnit,
        restockUnit: editForm.restockUnit,
        unitsPerRestock: parseInt(editForm.unitsPerRestock) || 1,
      },
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InventoryIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
          <Typography variant="h4" fontWeight="bold">
            Inventory
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
          sx={{ backgroundColor: '#1E40AF' }}
        >
          Add Product
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={12} sm={4}>
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
        <Grid xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, backgroundColor: '#FFFBEB', border: '1px solid #FCD34D' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingDownIcon sx={{ color: '#F59E0B', mr: 1 }} />
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
        <Grid xs={12} sm={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Value
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(
                  products.reduce((sum: number, p: Product) => sum + p.price * p.quantity, 0)
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
            <Grid xs={12} md={6}>
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
            <Grid xs={12} md={3}>
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
            <Grid xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card sx={{ borderRadius: 3 }}>
        <TableContainer component={Paper}  >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F1F5F9' }}>
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
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(7).fill(0).map((_, j) => (
                      <TableCell key={j}>
                        <Box sx={{ height: 24, backgroundColor: '#E2E8F0', borderRadius: 1 }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No products found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product: Product) => {
                  const status = getStockStatus(product.quantity, product.minStock);
                  return (
                    <TableRow key={product._id} hover>
                      <TableCell>
                        <Typography fontWeight="600">{product.name}</Typography>
                        {product.shelfNo && (
                          <Chip label={`Shelf ${product.shelfNo}`} size="small" sx={{ mt: 0.5 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <code sx={{ backgroundColor: '#F1F5F9', px: 1, py: 0.5, borderRadius: 1 }}>
                          {product.sku}
                        </code>
                      </TableCell>
                      <TableCell>
                        {product.categoryId ? (
                          <Chip
                            label={product.categoryId.name}
                            size="small"
                            sx={{
                              backgroundColor: product.categoryId.color + '20',
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
                              ? 'error.main'
                              : product.quantity <= product.minStock
                              ? 'warning.main'
                              : 'text.primary'
                          }
                        >
                          {product.quantity} {product.unitConfig.saleUnit}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={status.replace('-', ' ')}
                          size="small"
                          sx={{
                            ...getStockStatusColor(status),
                            textTransform: 'capitalize',
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
                            onClick={() => openRestockDialogWithProduct(product)}
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
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                required
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="SKU"
                value={addForm.sku}
                onChange={(e) => setAddForm({ ...addForm, sku: e.target.value.toUpperCase() })}
                required
              />
            </Grid>
            
            {/* Image Upload */}
            <Grid xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Product Image
              </Typography>
              {imagePreview && (
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    maxWidth: 300,
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 2,
                    mb: 2,
                  }}
                />
              )}
              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                Upload Product Image
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleImageChange}
                />
              </Button>
            </Grid>
            
            <Grid xs={6} md={3}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={addForm.price}
                onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
                required
              />
            </Grid>
            <Grid xs={6} md={3}>
              <TextField
                fullWidth
                label="Cost"
                type="number"
                value={addForm.cost}
                onChange={(e) => setAddForm({ ...addForm, cost: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
                required
              />
            </Grid>
            <Grid xs={6} md={3}>
              <TextField
                fullWidth
                label="Initial Quantity"
                type="number"
                value={addForm.quantity}
                onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
              />
            </Grid>
            <Grid xs={6} md={3}>
              <TextField
                fullWidth
                label="Min Stock"
                type="number"
                value={addForm.minStock}
                onChange={(e) => setAddForm({ ...addForm, minStock: e.target.value })}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={addForm.categoryId}
                  label="Category"
                  onChange={(e) => setAddForm({ ...addForm, categoryId: e.target.value })}
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
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Shelf Number"
                value={addForm.shelfNo}
                onChange={(e) => setAddForm({ ...addForm, shelfNo: e.target.value })}
                placeholder="e.g., A1, B2"
              />
            </Grid>
            <Grid xs={4}>
              <TextField
                fullWidth
                label="Sale Unit"
                value={addForm.saleUnit}
                onChange={(e) => setAddForm({ ...addForm, saleUnit: e.target.value })}
                placeholder="piece, kg, pack"
              />
            </Grid>
            <Grid xs={4}>
              <TextField
                fullWidth
                label="Restock Unit"
                value={addForm.restockUnit}
                onChange={(e) => setAddForm({ ...addForm, restockUnit: e.target.value })}
                placeholder="box, crate, dozen"
              />
            </Grid>
            <Grid xs={4}>
              <TextField
                fullWidth
                label="Units per Restock"
                type="number"
                value={addForm.unitsPerRestock}
                onChange={(e) => setAddForm({ ...addForm, unitsPerRestock: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddProduct}
            disabled={createProductMutation.isPending}
          >
            {createProductMutation.isPending ? 'Adding...' : 'Add Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="SKU"
                value={editForm.sku}
                onChange={(e) => setEditForm({ ...editForm, sku: e.target.value.toUpperCase() })}
                required
              />
            </Grid>
            <Grid xs={6} md={3}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
                required
              />
            </Grid>
            <Grid xs={6} md={3}>
              <TextField
                fullWidth
                label="Cost"
                type="number"
                value={editForm.cost}
                onChange={(e) => setEditForm({ ...editForm, cost: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
                required
              />
            </Grid>
            <Grid xs={6} md={3}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={editForm.quantity}
                onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
              />
            </Grid>
            <Grid xs={6} md={3}>
              <TextField
                fullWidth
                label="Min Stock"
                type="number"
                value={editForm.minStock}
                onChange={(e) => setEditForm({ ...editForm, minStock: e.target.value })}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editForm.categoryId}
                  label="Category"
                  onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
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
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Shelf Number"
                value={editForm.shelfNo}
                onChange={(e) => setEditForm({ ...editForm, shelfNo: e.target.value })}
                placeholder="e.g., A1, B2"
              />
            </Grid>
            <Grid xs={4}>
              <TextField
                fullWidth
                label="Sale Unit"
                value={editForm.saleUnit}
                onChange={(e) => setEditForm({ ...editForm, saleUnit: e.target.value })}
                placeholder="piece, kg, pack"
              />
            </Grid>
            <Grid xs={4}>
              <TextField
                fullWidth
                label="Restock Unit"
                value={editForm.restockUnit}
                onChange={(e) => setEditForm({ ...editForm, restockUnit: e.target.value })}
                placeholder="box, crate, dozen"
              />
            </Grid>
            <Grid xs={4}>
              <TextField
                fullWidth
                label="Units per Restock"
                type="number"
                value={editForm.unitsPerRestock}
                onChange={(e) => setEditForm({ ...editForm, unitsPerRestock: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateProduct}
            disabled={updateProductMutation.isPending}
          >
            {updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={openRestockDialog} onClose={() => setOpenRestockDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Restock Product</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="600">
                {selectedProduct.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current Stock: {selectedProduct.quantity} {selectedProduct.unitConfig.saleUnit}
              </Typography>
              
              <TextField
                fullWidth
                label={`Quantity (${selectedProduct.unitConfig.restockUnit})`}
                type="number"
                value={restockForm.quantity}
                onChange={(e) => setRestockForm({ ...restockForm, quantity: e.target.value })}
                helperText={`Each ${selectedProduct.unitConfig.restockUnit} = ${selectedProduct.unitConfig.unitsPerRestock} ${selectedProduct.unitConfig.saleUnit}`}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Notes (optional)"
                value={restockForm.notes}
                onChange={(e) => setRestockForm({ ...restockForm, notes: e.target.value })}
                multiline
                rows={2}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenRestockDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRestock}
            disabled={restockMutation.isPending}
          >
            {restockMutation.isPending ? 'Restocking...' : 'Restock'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

