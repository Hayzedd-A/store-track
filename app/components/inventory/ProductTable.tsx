"use client";

import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Edit as EditIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import LoadingRows from "@/app/components/ui/LoadingRows";
import {
  formatCurrency,
  getStockStatus,
  getStockStatusColor,
} from "@/lib/utils";
import { IProduct } from "@/types";

interface ProductTableProps {
  products: IProduct[];
  isLoading: boolean;
  onEdit: (product: IProduct) => void;
  onRestock: (product: IProduct) => void;
}

export default function ProductTable({
  products,
  isLoading,
  onEdit,
  onRestock,
}: ProductTableProps) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F1F5F9" }}>
              <TableCell sx={{ fontWeight: 600 }}>Products</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Cost</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <LoadingRows rows={5} cols={7} />
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No products found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
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
                      <code>{product.sku}</code>
                    </TableCell>
                    <TableCell>
                      {product.categoryId &&
                      typeof product.categoryId !== "string" ? (
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
                    <TableCell>{formatCurrency(product.cost)}</TableCell>
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
                          onClick={() => onEdit(product)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Restock">
                        <IconButton
                          color="primary"
                          onClick={() => onRestock(product)}
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
  );
}
