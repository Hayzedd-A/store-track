"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  useMediaQuery,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { 
  PointOfSale as POSIcon, 
  ViewModule as ViewModuleIcon, 
  ViewList as ViewListIcon,
} from "@mui/icons-material";
import PageHeader from "@/app/components/ui/PageHeader";
import ProductSearch from "@/app/components/pos/ProductSearch";
import ProductGrid from "@/app/components/pos/ProductGrid";
import CartPanel from "@/app/components/pos/CartPanel";
import CheckoutDialog from "@/app/components/pos/CheckoutDialog";
import ReceiptDialog from "@/app/components/pos/ReceiptDialog";
import { IProduct } from "@/types";

// interface IProduct {
//   _id: string;
//   name: string;
//   sku: string;
//   price: number;
//   cost: number;
//   quantity: number;
//   minStock: number;
//   shelfNo?: string;
//   unitConfig: {
//     saleUnit: string;
//     restockUnit: string;
//     unitsPerRestock: number;
//   };
//   categoryId?: { _id: string; name: string; color: string } | null;
// }

interface CartItem {
  product: IProduct;
  quantity: number;
  subtotal: number;
}

export default function POSPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [lastSale, setLastSale] = useState<{
    saleId: string;
    total: number;
    items: CartItem[];
  } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  /** Play a short confirmation beep via the Web Audio API */
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(1046, ctx.currentTime); // C6
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch (_) {
      // Audio not available — silent fail is acceptable
    }
  };

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await fetch("/api/products")).json(),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await fetch("/api/categories")).json(),
  });

  const createSaleMutation = useMutation({
    mutationFn: async (items: CartItem[]) => {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product._id,
            quantity: item.quantity,
          })),
          paymentMethod: "cash",
        }),
      });
      if (!res.ok)
        throw new Error(
          (await res.json()).message || "Failed to complete sale",
        );
      return res.json();
    },
    onSuccess: (data) => {
      setLastSale({
        saleId: data.data._id,
        total: data.data.totalAmount,
        items: cart,
      });
      setCart([]);
      setCheckoutOpen(false);
      setReceiptOpen(true);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
    onError: (err: Error) => setError(err.message),
    onSettled: () => setProcessing(false),
  });

  const products: IProduct[] = productsData?.data || [];
  const categories = categoriesData?.data || [];

  const filteredProducts = useMemo(
    () =>
      products.filter((p: IProduct) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory =
          typeof selectedCategory !== "undefined" &&
          typeof p.categoryId !== "string" &&
          (!selectedCategory || p.categoryId?._id === selectedCategory);
        return matchesSearch && matchesCategory;
      }),
    [products, searchQuery, selectedCategory],
  );

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: IProduct) => {
    const existing = cart.find((i) => i.product._id === product._id);
    if (existing) {
      if (existing.quantity >= product.quantity) {
        setError(
          `Only ${product.quantity} ${product.unitConfig.saleUnit} available`,
        );
        return;
      }
      setCart(
        cart.map((i) =>
          i.product._id === product._id
            ? {
                ...i,
                quantity: i.quantity + 1,
                subtotal: (i.quantity + 1) * product.price,
              }
            : i,
        ),
      );
    } else {
      if (product.quantity < 1) {
        setError("Product is out of stock");
        return;
      }
      setCart([...cart, { product, quantity: 1, subtotal: product.price }]);
    }
    setError(null);
  };

  /** Called by ProductSearch when a barcode is successfully scanned */
  const handleBarcodeDetected = (barcode: string) => {
    const product = products.find(
      (p: IProduct) =>
        p.barcode && p.barcode.toLowerCase() === barcode.toLowerCase()
    );
    if (!product) {
      setError(`No product found for barcode: ${barcode}`);
      return;
    }
    addToCart(product);
    playBeep();
  };

  const updateCartQuantity = (productId: string, newQty: number) => {
    if (newQty < 1) {
      setCart(cart.filter((i) => i.product._id !== productId));
      return;
    }
    const product = products.find((p: IProduct) => p._id === productId);
    if (product && newQty > product.quantity) {
      setError(`Only ${product.quantity} available`);
      return;
    }
    setCart(
      cart.map((i) =>
        i.product._id === productId
          ? { ...i, quantity: newQty, subtotal: newQty * i.product.price }
          : i,
      ),
    );
    setError(null);
  };

  const handleCheckout = () => {
    setProcessing(true);
    setError(null);
    createSaleMutation.mutate(cart);
  };

  return (
    <Box>
      <PageHeader icon={<POSIcon />} title="Point of Sale" />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid minWidth={350} flex={2} size={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <ProductSearch
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                categories={categories}
                onSearchChange={setSearchQuery}
                onCategoryChange={setSelectedCategory}
                onBarcodeDetected={handleBarcodeDetected}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <ToggleButtonGroup
                  size="small"
                  value={viewMode}
                  exclusive
                  onChange={(_, newMode) => {
                    if (newMode !== null) setViewMode(newMode);
                  }}
                  aria-label="product view mode"
                >
                  <ToggleButton value="grid" aria-label="grid view">
                    <ViewModuleIcon />
                  </ToggleButton>
                  <ToggleButton value="list" aria-label="list view">
                    <ViewListIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <ProductGrid
                products={filteredProducts}
                isLoading={productsLoading}
                onAddToCart={addToCart}
                viewMode={viewMode}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid minWidth={250} flex={1} size={4}>
          <Card sx={{ borderRadius: 3, position: "sticky", top: 80 }}>
            <CardContent sx={{ p: 2 }}>
              <CartPanel
                cart={cart}
                isMobile={isMobile}
                onUpdateQuantity={updateCartQuantity}
                onRemove={(id) =>
                  setCart(cart.filter((i) => i.product._id !== id))
                }
                onClear={() => setCart([])}
                onCheckout={() => setCheckoutOpen(true)}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <CheckoutDialog
        open={checkoutOpen}
        cartTotal={cartTotal}
        itemCount={cartItemCount}
        isProcessing={processing}
        onClose={() => setCheckoutOpen(false)}
        onConfirm={handleCheckout}
      />

      <ReceiptDialog
        open={receiptOpen}
        sale={lastSale}
        onClose={() => setReceiptOpen(false)}
      />
    </Box>
  );
}
