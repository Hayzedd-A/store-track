"use client";

import { Grid, Card, Typography } from "@mui/material";
import {
  PointOfSale as POSIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

const actions = [
  {
    label: "New Sale",
    icon: <POSIcon sx={{ fontSize: 48, color: "#3B82F6", mb: 1 }} />,
    path: "/pos",
  },
  {
    label: "Add Product",
    icon: <InventoryIcon sx={{ fontSize: 48, color: "#10B981", mb: 1 }} />,
    path: "/inventory",
  },
  {
    label: "View Reports",
    icon: <TrendingUpIcon sx={{ fontSize: 48, color: "#6366F1", mb: 1 }} />,
    path: "/sales",
  },
  {
    label: "Restock Items",
    icon: <WarningIcon sx={{ fontSize: 48, color: "#F59E0B", mb: 1 }} />,
    path: "/inventory",
  },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <Grid container spacing={2}>
      {actions.map((action) => (
        <Grid key={action.label}>
          <Card
            sx={{
              p: 2,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              },
            }}
            onClick={() => router.push(action.path)}
          >
            {action.icon}
            <Typography fontWeight="600">{action.label}</Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
