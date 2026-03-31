"use client";

import { Grid, Card, Typography, Box, Button } from "@mui/material";
import { Add as AddIcon, Category as CategoryIcon } from "@mui/icons-material";
import CategoryCard from "./CategoryCard";
import { ICategory } from "@/types";

// interface ICategory {
//   _id: string;
//   name: string;
//   color: string;
//   image?: string;
//   createdAt: string;
// }

interface CategoryGridProps {
  categories: ICategory[];
  isLoading: boolean;
  onEdit: (category: ICategory) => void;
  onDelete: (category: ICategory) => void;
  onAdd: () => void;
}

export default function CategoryGrid({
  categories,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
}: CategoryGridProps) {
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Grid key={i}>
              <Card sx={{ borderRadius: 3, p: 3 }}>
                <Box
                  sx={{
                    height: 80,
                    backgroundColor: "#E2E8F0",
                    borderRadius: 2,
                  }}
                />
              </Card>
            </Grid>
          ))}
      </Grid>
    );
  }

  if (categories.length === 0) {
    return (
      <Grid container>
        <Grid>
          <Card sx={{ borderRadius: 3, p: 4, textAlign: "center" }}>
            <CategoryIcon sx={{ fontSize: 64, color: "#CBD5E1", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No categories yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create your first category to organize products
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
              Add Category
            </Button>
          </Card>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {categories.map((category) => (
        <Grid key={category._id}>
          <CategoryCard
            category={category}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Grid>
      ))}
    </Grid>
  );
}
