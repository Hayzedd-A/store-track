'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';

interface Category {
  _id: string;
  name: string;
  color: string;
  image?: string;
  createdAt: string;
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export default function CategoriesPage() {
  const queryClient = useQueryClient();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#3B82F6', image: null as File | null });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch categories
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      return res.json();
    },
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; color: string; image: File | null }) => {
      if (data.image) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('color', data.color);
        formData.append('image', data.image);

        const res = await fetch('/api/categories', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message);
        }
        return res.json();
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name, color: data.color }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message);
        }
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setOpenDialog(false);
      setFormData({ name: '', color: '#3B82F6', image: null });
      setImagePreview(null);
      setSnackbar({ open: true, message: 'Category added successfully!', severity: 'success' });
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; color: string; image: File | null } }) => {
      if (data.image) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('color', data.color);
        formData.append('image', data.image);

        const res = await fetch(`/api/categories?id=${id}`, {
          method: 'PUT',
          body: formData,
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message);
        }
        return res.json();
      } else {
        const res = await fetch(`/api/categories?id=${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name, color: data.color }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message);
        }
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setOpenDialog(false);
      setEditingCategory(null);
      setFormData({ name: '', color: '#3B82F6', image: null });
      setImagePreview(null);
      setSnackbar({ open: true, message: 'Category updated successfully!', severity: 'success' });
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteConfirm(null);
      setSnackbar({ open: true, message: 'Category deleted successfully!', severity: 'success' });
    },
    onError: (error: Error) => {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    },
  });

  const categories: Category[] = categoriesData?.data || [];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setSnackbar({ open: true, message: 'Please enter a category name', severity: 'error' });
      return;
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, color: category.color, image: null });
    setImagePreview(category.image || null);
    setOpenDialog(true);
  };

  const handleDelete = (category: Category) => {
    setDeleteConfirm(category);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CategoryIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
          <Typography variant="h4" fontWeight="bold">
            Categories
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', color: '#3B82F6' });
            setOpenDialog(true);
          }}
          sx={{ backgroundColor: '#1E40AF' }}
        >
          Add Category
        </Button>
      </Box>

      {/* Categories Grid */}
      <Grid container spacing={3}>
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Card sx={{ borderRadius: 3, p: 3 }}>
                <Box sx={{ height: 80, backgroundColor: '#E2E8F0', borderRadius: 2 }} />
              </Card>
            </Grid>
          ))
        ) : categories.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
              <CategoryIcon sx={{ fontSize: 64, color: '#CBD5E1', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No categories yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create your first category to organize products
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
              >
                Add Category
              </Button>
            </Card>
          </Grid>
        ) : (
          categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={category._id}>
              <Card
                sx={{
                  borderRadius: 3,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                {category.image && (
                  <Box
                    component="img"
                    src={category.image}
                    alt={category.name}
                    sx={{
                      width: '100%',
                      height: 180,
                      objectFit: 'cover',
                    }}
                  />
                )}
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        backgroundColor: category.color + '20',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}
                    >
                      <CategoryIcon sx={{ color: category.color }} />
                    </Box>
                    <Typography variant="h6" fontWeight="600" noWrap>
                      {category.name}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(category)}
                      sx={{ color: '#3B82F6' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(category)}
                      sx={{ color: '#EF4444' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 3 }}
            />
            
            {/* Image Upload */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Category Image
              </Typography>
              {imagePreview && (
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Preview"
                  sx={{
                    width: '100%',
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
                startIcon={<CloudUploadIcon />}
              >
                Upload Image
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleImageChange}
                />
              </Button>
            </Box>
            
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Color
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {COLORS.map((color) => (
                <Box
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: formData.color === color ? '3px solid #1E40AF' : '3px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingCategory ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Category?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteConfirm?.name}"? Products in this category will
            become uncategorized.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm._id)}
            disabled={deleteMutation.isPending}
          >
            Delete
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

