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
  Box,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import LoadingRows from "@/app/components/ui/LoadingRows";
import { formatCurrency, formatDate } from "@/lib/utils";

interface SaleItem {
  productName: string;
  quantity: number;
  price: number;
  cost: number;
  subtotal: number;
}
interface Sale {
  _id: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  items: SaleItem[];
  createdAt: string;
}

interface SalesTableProps {
  sales: Sale[];
  isLoading: boolean;
  onViewDetails: (sale: Sale) => void;
  onPrintReceipt: (sale: Sale) => void;
}

export default function SalesTable({
  sales,
  isLoading,
  onViewDetails,
  onPrintReceipt,
}: SalesTableProps) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F1F5F9" }}>
              {[
                "Date & Time",
                "Sale ID",
                "Items",
                "Total",
                "Profit",
                "Status",
                "Actions",
              ].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 600 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <LoadingRows rows={7} cols={7} />
            ) : sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No sales found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale._id} hover>
                  <TableCell>
                    <Typography fontWeight="500">
                      {formatDate(sale.createdAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(sale.createdAt).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <code>{sale._id.slice(-8).toUpperCase()}</code>
                  </TableCell>
                  <TableCell>{sale.items.length} item(s)</TableCell>
                  <TableCell>
                    <Typography fontWeight="600">
                      {formatCurrency(sale.totalAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="600" color="success.main">
                      {formatCurrency(
                        sale.items.reduce(
                          (s, i) => s + (i.price - i.cost) * i.quantity,
                          0,
                        ),
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={sale.status}
                      size="small"
                      color={
                        sale.status === "completed" ? "success" : "warning"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => onViewDetails(sale)}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onPrintReceipt(sale)}
                    >
                      <ReceiptIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
