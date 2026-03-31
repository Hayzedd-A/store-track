"use client";

import { useState } from "react";
import { Box, TextField, InputAdornment, IconButton } from "@mui/material";
import {
  Search as SearchIcon,
  QrCodeScanner as ScannerIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import CategoryChips from "./CategoryChips";
import BarcodeScanner from "./BarcodeScanner";

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
  onBarcodeDetected?: (barcode: string) => void;
}

export default function ProductSearch({
  searchQuery,
  selectedCategory,
  categories,
  onSearchChange,
  onCategoryChange,
  onBarcodeDetected,
}: ProductSearchProps) {
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleOpenScanner = () => {
    setScannerOpen(true);
  };

  const handleCloseScanner = () => {
    setScannerOpen(false);
  };

  const handleBarcodeDetected = (barcode: string) => {
    if (onBarcodeDetected) {
      onBarcodeDetected(barcode);
    } else {
      onSearchChange(barcode);
    }
  };

  return (
    <>
      {/* Search bar */}
      <Box sx={{ position: "relative", mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search products by name, SKU, or barcode..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleOpenScanner}
                  color="primary"
                  title="Open camera barcode scanner"
                  size="small"
                >
                  <ScannerIcon />
                </IconButton>
                {searchQuery && (
                  <IconButton
                    onClick={() => onSearchChange("")}
                    size="small"
                    title="Clear search"
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Category chips */}
      <CategoryChips
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />

      {/* Barcode scanner dialog */}
      <BarcodeScanner
        open={scannerOpen}
        onClose={handleCloseScanner}
        onBarcodeDetected={handleBarcodeDetected}
        onError={(error) => console.error("Scanner error:", error)}
      />
    </>
  );
}
