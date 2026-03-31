"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  // InputAdornment,
  Divider,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  // DateRange as DateRangeIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ISale } from "@/types";

export default function SalesPage() {
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedSale, setSelectedSale] = useState<ISale | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch sales data
  const {
    data: salesData,
    isLoading,
    // refetch,
  } = useQuery({
    queryKey: ["sales", dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);
      params.append("limit", "100");
      const res = await fetch(`/api/sales?${params.toString()}`);
      return res.json();
    },
  });

  const sales: ISale[] = salesData?.data || [];
  const summary = salesData?.summary || { totalSales: 0, totalRevenue: 0 };
  const totalProfit = sales.reduce(
    (sum, sale) =>
      sum +
      sale.items.reduce(
        (itemSum, item) => itemSum + (item.price - item.cost) * item.quantity,
        0,
      ),
    0,
  );

  const formalizeCurrency = (amount: number) => {
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(1)}K`;
    return formatCurrency(amount);
  };

  // Calculate chart data
  const salesChartData = useMemo(() => {
    const dailySales: Record<
      string,
      { date: string; sales: number; revenue: number }
    > = {};

    sales.forEach((sale) => {
      const date = new Date(sale.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      if (!dailySales[date]) {
        dailySales[date] = { date, sales: 0, revenue: 0 };
      }

      dailySales[date].sales += 1;
      dailySales[date].revenue += sale.totalAmount;
    });

    return Object.values(dailySales).slice(-7);
  }, [sales]);

  // Calculate top products
  const topProducts = useMemo(() => {
    const productSales: Record<
      string,
      { name: string; quantity: number; revenue: number }
    > = {};

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!productSales[item.productName]) {
          productSales[item.productName] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[item.productName].quantity += item.quantity;
        productSales[item.productName].revenue += item.subtotal;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales]);

  // Pie chart data
  const pieData = topProducts.map((product, index) => ({
    name: product.name,
    value: product.revenue,
    color: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][index],
  }));

  const handleViewDetails = (sale: ISale) => {
    setSelectedSale(sale);
    setDetailsOpen(true);
  };

  const handlePrintReceipt = (sale: ISale) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const receiptHTML = `
      <html>
        <head>
          <title>Receipt - ${sale._id.slice(-8).toUpperCase()}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { border-top: 1px solid #000; margin-top: 10px; padding-top: 10px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Store Receipt</h2>
            <p>Sale ID: ${sale._id.slice(-8).toUpperCase()}</p>
            <p>Date: ${formatDate(sale.createdAt)}</p>
          </div>
          <div>
            ${sale.items
              .map(
                (item) => `
              <div class="item">
                <span>${item.productName} x${item.quantity}</span>
                <span>${formatCurrency(item.subtotal)}</span>
              </div>
            `,
              )
              .join("")}
          </div>
          <div class="total">
            <div class="item">
              <span>Total</span>
              <span>${formatCurrency(sale.totalAmount)}</span>
            </div>
            <div class="item">
              <span>Payment</span>
              <span>${sale.paymentMethod}</span>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExport = () => {
    const csvContent = [
      ["Date", "Sale ID", "Items", "Total", "Payment", "Status"],
      ...sales.map((sale) => [
        formatDate(sale.createdAt),
        sale._id,
        sale.items.length,
        sale.totalAmount,
        sale.paymentMethod,
        sale.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ReceiptIcon sx={{ fontSize: 32, color: "primary.main", mr: 1 }} />
          <Typography variant="h4" fontWeight="bold">
            Sales History
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: "#EFF6FF",
                    mr: 2,
                  }}
                >
                  <ReceiptIcon sx={{ color: "#3B82F6" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Sales
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {summary.totalSales}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: "#ECFDF5",
                    mr: 2,
                  }}
                >
                  <MoneyIcon sx={{ color: "#10B981" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#10B981">
                    {formatCurrency(summary.totalRevenue)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: "#FEF3C7",
                    mr: 2,
                  }}
                >
                  <TrendingUpIcon sx={{ color: "#F59E0B" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Profit
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#F59E0B">
                    {formatCurrency(totalProfit)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: "#F3F4F6",
                    mr: 2,
                  }}
                >
                  <TrendingUpIcon sx={{ color: "#6B7280" }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Average Sale
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(
                      summary.totalSales > 0
                        ? summary.totalRevenue / summary.totalSales
                        : 0,
                    )}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Date Filter */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setDateRange({ startDate: "", endDate: "" })}
              >
                Clear Filter
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <Grid container spacing={3} columns={2} sx={{ mb: 3 }}>
        <Grid size={1}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
              Sales Trend (Last 7 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formalizeCurrency} />
                <Tooltip
                  formatter={(value, name) => {
                    const safeValue = Number(value ?? 0);

                    return [
                      name === "revenue"
                        ? formatCurrency(safeValue)
                        : safeValue,
                      name === "revenue" ? "Revenue" : "Sales",
                    ];
                  }}
                />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid size={1}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
              Top Products
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name?.substring(0, 10)}... ${(percent || 0 * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Top Products Table */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
            Top Selling Products
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Quantity Sold
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Revenue
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topProducts.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Chip
                        label={index + 1}
                        size="small"
                        sx={{
                          backgroundColor:
                            index === 0
                              ? "#FCD34D"
                              : index === 1
                                ? "#D1D5DB"
                                : index === 2
                                  ? "#F97316"
                                  : "#E5E7EB",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell align="right">{product.quantity}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(product.revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card sx={{ borderRadius: 3 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#F1F5F9" }}>
                <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Sale ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Profit</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array(7)
                  .fill(0)
                  .map((_, j) => (
                    <TableRow key={j}>
                      {Array(6)
                        .fill(0)
                        .map((_, j) => (
                          <TableCell key={j}>
                            <Box
                              sx={{
                                height: 24,
                                backgroundColor: "#E2E8F0",
                                borderRadius: 1,
                              }}
                            />
                          </TableCell>
                        ))}
                    </TableRow>
                  ))
              ) : sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No sales found
                    </Typography>
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
                      <code
                      // sx={{
                      //   backgroundColor: "#F1F5F9",
                      //   px: 1,
                      //   py: 0.5,
                      //   borderRadius: 1,
                      //   fontSize: "0.85rem",
                      // }}
                      >
                        {sale._id.slice(-8).toUpperCase()}
                      </code>
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
                            (sum, item) =>
                              sum + (item.price - item.cost) * item.quantity,
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
                        onClick={() => handleViewDetails(sale)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handlePrintReceipt(sale)}
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

      {/* Sale Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Sale Details</DialogTitle>
        <DialogContent>
          {selectedSale && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                  p: 2,
                  backgroundColor: "#F1F5F9",
                  borderRadius: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Sale ID
                  </Typography>
                  <Typography fontWeight="600">
                    {selectedSale._id.slice(-8).toUpperCase()}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography fontWeight="600">
                    {formatDate(selectedSale.createdAt)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Items
              </Typography>
              {selectedSale.items.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                    borderBottom: "1px solid #E5E7EB",
                  }}
                >
                  <Box>
                    <Typography fontWeight="500">{item.productName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.quantity} x {formatCurrency(item.price)}
                    </Typography>
                  </Box>
                  <Typography fontWeight="600">
                    {formatCurrency(item.subtotal)}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Total
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  {formatCurrency(selectedSale.totalAmount)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
