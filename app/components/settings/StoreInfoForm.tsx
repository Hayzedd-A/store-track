"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Button,
} from "@mui/material";
import { Save as SaveIcon, Store as StoreIcon } from "@mui/icons-material";

interface StoreSettings {
  storeName: string;
  address: string;
  phone: string;
  email: string;
}

interface StoreInfoFormProps {
  settings: StoreSettings;
  onChange: (field: keyof StoreSettings, value: string) => void;
  onSave: () => void;
  isLoading?: boolean;
}

export default function StoreInfoForm({
  settings,
  onChange,
  onSave,
  isLoading,
}: StoreInfoFormProps) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <StoreIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" fontWeight="600">
            Store Information
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid>
            <TextField
              fullWidth
              label="Store Name"
              value={settings.storeName}
              onChange={(e) => onChange("storeName", e.target.value)}
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="Address"
              value={settings.address}
              onChange={(e) => onChange("address", e.target.value)}
              multiline
              rows={2}
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="Phone Number"
              value={settings.phone}
              onChange={(e) => onChange("phone", e.target.value)}
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={settings.email}
              onChange={(e) => onChange("email", e.target.value)}
            />
          </Grid>
        </Grid>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={onSave}
          disabled={isLoading}
          sx={{ mt: 3, backgroundColor: "#1E40AF" }}
        >
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
