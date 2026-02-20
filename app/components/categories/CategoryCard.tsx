"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";

interface Category {
  _id: string;
  name: string;
  color: string;
  image?: string;
}

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoryCard({
  category,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        transition: "all 0.2s",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 3 },
      }}
    >
      {category.image && (
        <Box
          component="img"
          src={category.image}
          alt={category.name}
          sx={{ width: "100%", height: 180, objectFit: "cover" }}
        />
      )}
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: category.color + "20",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 2,
            }}
          >
            <CategoryIcon sx={{ color: category.color }} />
          </Box>
          <Typography variant="h6" fontWeight="600" noWrap>
            {category.name}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => onEdit(category)}
            sx={{ color: "#3B82F6" }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(category)}
            sx={{ color: "#EF4444" }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}
