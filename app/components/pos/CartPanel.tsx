"use client";

import {
  Box,
  Typography,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from "@mui/material";
import {
  ShoppingCart as CartIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { formatCurrency } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  cost: number;
  unitConfig: { saleUnit: string };
}

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

interface CartPanelProps {
  cart: CartItem[];
  isMobile: boolean;
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onCheckout: () => void;
}

export default function CartPanel({
  cart,
  isMobile,
  onUpdateQuantity,
  onRemove,
  onClear,
  onCheckout,
}: CartPanelProps) {
  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Badge badgeContent={cartItemCount} color="primary">
          <CartIcon />
        </Badge>
        <Typography variant="h6" sx={{ ml: 1 }}>
          Current Sale
        </Typography>
        {cart.length > 0 && (
          <IconButton size="small" onClick={onClear} sx={{ ml: "auto" }}>
            <DeleteIcon color="error" />
          </IconButton>
        )}
      </Box>

      {cart.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
          <CartIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
          <Typography>No items in cart</Typography>
          <Typography variant="body2">Click on products to add them</Typography>
        </Box>
      ) : (
        <>
          <List sx={{ maxHeight: isMobile ? 300 : 400, overflow: "auto" }}>
            {cart.map((item) => (
              <ListItem
                key={item.product._id}
                sx={{ px: 0, borderBottom: "1px solid #E5E7EB" }}
              >
                <ListItemText
                  primary={item.product.name}
                  secondary={`${formatCurrency(item.product.cost)} / ${item.product.unitConfig.saleUnit}`}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() =>
                      onUpdateQuantity(item.product._id, item.quantity - 1)
                    }
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ minWidth: 24, textAlign: "center" }}>
                    {item.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() =>
                      onUpdateQuantity(item.product._id, item.quantity + 1)
                    }
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  sx={{ minWidth: 80, textAlign: "right", fontWeight: 600 }}
                >
                  {formatCurrency(item.subtotal)}
                </Typography>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Subtotal</Typography>
              <Typography fontWeight="600">
                {formatCurrency(cartTotal)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6" fontWeight="bold">
                Total
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {formatCurrency(cartTotal)}
              </Typography>
            </Box>
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={onCheckout}
            sx={{
              py: 1.5,
              backgroundColor: "#10B981",
              "&:hover": { backgroundColor: "#059669" },
            }}
          >
            Complete Sale
          </Button>
        </>
      )}
    </>
  );
}
