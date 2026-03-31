"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { Save as SaveIcon, QrCode as QrCodeIcon } from "@mui/icons-material";

export interface SkuSettings {
  method: "RANDOM" | "SEQUENTIAL" | "CATEGORY_PREFIX";
  prefix: string;
}

interface SkuSettingsFormProps {
  settings: SkuSettings;
  onChange: (field: keyof SkuSettings, value: string) => void;
  onSave: () => void;
  isLoading?: boolean;
}

export default function SkuSettingsForm({
  settings,
  onChange,
  onSave,
  isLoading,
}: SkuSettingsFormProps) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <QrCodeIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" fontWeight="600">
            SKU Generation Settings
          </Typography>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Box>
            <FormControl fullWidth>
              <InputLabel id="sku-method-label">Generation Method</InputLabel>
              <Select
                labelId="sku-method-label"
                value={settings.method || "RANDOM"}
                label="Generation Method"
                onChange={(e) => onChange("method", e.target.value)}
              >
                <MenuItem value="RANDOM">Random Alphanumeric</MenuItem>
                <MenuItem value="SEQUENTIAL">Sequential Numbering</MenuItem>
                <MenuItem value="CATEGORY_PREFIX">
                  Category Based Prefix
                </MenuItem>
              </Select>
              <FormHelperText>
                {settings.method === "RANDOM" &&
                  "Generates a random 8-character string (e.g. A7X9B2K1)"}
                {settings.method === "SEQUENTIAL" &&
                  "Generates a sequential number based on existing SKUs (e.g. SKU0001)"}
                {settings.method === "CATEGORY_PREFIX" &&
                  "Uses the product's category name as a prefix (e.g. ELEC-001)"}
              </FormHelperText>
            </FormControl>
          </Box>
          <Box>
            <TextField
              fullWidth
              label="Global Prefix (Optional)"
              value={settings.prefix || ""}
              onChange={(e) => onChange("prefix", e.target.value)}
              disabled={settings.method === "CATEGORY_PREFIX"}
              helperText="Added to the beginning of generated SKUs. Disabled for Category Based."
            />
          </Box>
        </Box>
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
