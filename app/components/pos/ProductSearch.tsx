"use client";

import { Box, TextField, InputAdornment, Chip } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface Category {
  _id: string;
  name: string;
  color: string;
}

interface ProductSearchProps {
  searchQuery: string;
  selectedCategory: string | null;
  categories: Category[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (categoryId: string | null) => void;
}

export default function ProductSearch({
  searchQuery,
  selectedCategory,
  categories,
  onSearchChange,
  onCategoryChange,
}: ProductSearchProps) {
  return (
    <>
      <TextField
        fullWidth
        placeholder="Search products by name or SKU..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <Chip
          label="All"
          onClick={() => onCategoryChange(null)}
          color={!selectedCategory ? "primary" : "default"}
          sx={{ borderRadius: 2 }}
        />
        {categories.map((category) => (
          <Chip
            key={category._id}
            label={category.name}
            onClick={() => onCategoryChange(category._id)}
            sx={{
              borderRadius: 2,
              backgroundColor:
                selectedCategory === category._id ? category.color : undefined,
              color: selectedCategory === category._id ? "white" : undefined,
            }}
          />
        ))}
      </Box>
    </>
  );
}
