"use client";

import {
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

interface ProductFiltersProps {
  searchQuery: string;
  stockFilter: string;
  onSearchChange: (value: string) => void;
  onStockFilterChange: (value: string) => void;
  onRefresh: () => void;
}

export default function ProductFilters({
  searchQuery,
  stockFilter,
  onSearchChange,
  onStockFilterChange,
  onRefresh,
}: ProductFiltersProps) {
  return (
    <Card sx={{ borderRadius: 3, mb: 3 }}>
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
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
                onChange={(e) => onStockFilterChange(e.target.value)}
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
              onClick={onRefresh}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
