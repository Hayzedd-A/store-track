"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { Store as StoreIcon } from "@mui/icons-material";
import StoreInfoForm from "@/app/components/settings/StoreInfoForm";
import ChangePasswordForm from "@/app/components/settings/ChangePasswordForm";
import SkuSettingsForm from "@/app/components/settings/SkuSettingsForm";

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const [storeSettings, setStoreSettings] = useState({
    storeName: "",
    address: "",
    phone: "",
    email: "",
    skuSettings: {
      method: "RANDOM" as "RANDOM" | "SEQUENTIAL" | "CATEGORY_PREFIX",
      prefix: "",
    },
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showMessage = (
    message: string,
    severity: "success" | "error" = "success",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const json = await res.json();
      return json.data;
    },
  });

  // Update local state when data is fetched
  useEffect(() => {
    if (data) {
      setStoreSettings({
        storeName: data.storeName || "",
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        skuSettings: data.skuSettings || { method: "RANDOM", prefix: "" },
      });
    }
  }, [data]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: typeof storeSettings) => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      const resData = await res.json();
      if (!res.ok)
        throw new Error(resData.message || "Failed to save settings");
      return resData;
    },
    onSuccess: () => {
      showMessage("Store settings saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error: any) => {
      showMessage(error.message || "Failed to save settings", "error");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (pwdData: typeof passwords) => {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwdData.currentPassword,
          newPassword: pwdData.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");
      return data;
    },
    onSuccess: () => {
      showMessage("Password changed successfully!");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: any) => {
      showMessage(error.message || "Failed to change password", "error");
    },
  });

  const handleStoreSettingsChange = (field: string, value: string) => {
    setStoreSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSkuSettingsChange = (field: string, value: string) => {
    setStoreSettings((prev) => ({
      ...prev,
      skuSettings: {
        ...prev.skuSettings,
        [field]: value,
      },
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveStoreSettings = () => {
    updateSettingsMutation.mutate(storeSettings);
  };

  const handleChangePassword = () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      showMessage("New passwords do not match!", "error");
      return;
    }
    if (passwords.newPassword.length < 6) {
      showMessage("Password must be at least 6 characters!", "error");
      return;
    }
    changePasswordMutation.mutate(passwords);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <StoreIcon sx={{ fontSize: 32, color: "primary.main", mr: 1 }} />
        <Typography variant="h4" fontWeight="bold">
          Settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Store Settings */}
        <Grid>
          <StoreInfoForm
            settings={storeSettings}
            onChange={handleStoreSettingsChange}
            onSave={handleSaveStoreSettings}
            isLoading={updateSettingsMutation.isPending}
          />
        </Grid>

        {/* SKU Generation Settings */}
        <Grid>
          <SkuSettingsForm
            settings={storeSettings.skuSettings}
            onChange={handleSkuSettingsChange}
            onSave={handleSaveStoreSettings}
            isLoading={updateSettingsMutation.isPending}
          />
        </Grid>

        {/* Password Change */}
        <Grid>
          <ChangePasswordForm
            passwords={passwords}
            onChange={handlePasswordChange}
            onSubmit={handleChangePassword}
            isLoading={changePasswordMutation.isPending}
          />
        </Grid>

        {/* App Info */}
        <Grid>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                About StoreTrack
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                StoreTrack is a complete stock management and point of sale
                system designed for markets and small businesses. Built with
                Next.js, MongoDB, and Material UI.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Version 1.0.0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Features: Inventory Management, POS, Sales Tracking, Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
