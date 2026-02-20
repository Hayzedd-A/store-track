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
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import ImageUpload from "@/app/components/ui/ImageUpload";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

interface CategoryFormData {
  name: string;
  color: string;
  image: File | null;
}

interface CategoryFormDialogProps {
  open: boolean;
  isEditing: boolean;
  formData: CategoryFormData;
  imagePreview: string | null;
  isLoading: boolean;
  onNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
  onImageChange: (file: File) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function CategoryFormDialog({
  open,
  isEditing,
  formData,
  imagePreview,
  isLoading,
  onNameChange,
  onColorChange,
  onImageChange,
  onClose,
  onSubmit,
}: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? "Edit Category" : "Add New Category"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Category Name"
            value={formData.name}
            onChange={(e) => onNameChange(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Box sx={{ mb: 3 }}>
            <ImageUpload
              label="Category Image"
              previewUrl={imagePreview}
              onChange={onImageChange}
            />
          </Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Color
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {COLORS.map((color) => (
              <Box
                key={color}
                onClick={() => onColorChange(color)}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: color,
                  cursor: "pointer",
                  border:
                    formData.color === color
                      ? "3px solid #1E40AF"
                      : "3px solid transparent",
                  transition: "all 0.2s",
                  "&:hover": { transform: "scale(1.1)" },
                }}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={isLoading}>
          {isEditing ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
