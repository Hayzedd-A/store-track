"use client";

import { Box, Chip } from "@mui/material";

interface Category {
  _id: string;
  name: string;
  color: string;
}

interface CategoryChipsProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export default function CategoryChips({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryChipsProps) {
  return (
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
  );
}
