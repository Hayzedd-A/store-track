'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  Snackbar,
  InputAdornment,
} from '@mui/material';
import {
  Store as StoreIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

export default function SettingsPage() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'My Store',
    address: '',
    phone: '',
    email: '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSaveStoreSettings = () => {
    // In production, this would save to the database
    setSnackbar({
      open: true,
      message: 'Store settings saved successfully!',
      severity: 'success',
    });
  };

  const handleChangePassword = () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New passwords do not match!',
        severity: 'error',
      });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setSnackbar({
        open: true,
        message: 'Password must be at least 6 characters!',
        severity: 'error',
      });
      return;
    }

    // In production, this would change the password
    setSnackbar({
      open: true,
      message: 'Password changed successfully!',
      severity: 'success',
    });

    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <StoreIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
        <Typography variant="h4" fontWeight="bold">
          Settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Store Settings */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                Store Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Store Name"
                    value={storeSettings.storeName}
                    onChange={(e) =>
                      setStoreSettings({ ...storeSettings, storeName: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={storeSettings.address}
                    onChange={(e) =>
                      setStoreSettings({ ...storeSettings, address: e.target.value })
                    }
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={storeSettings.phone}
                    onChange={(e) =>
                      setStoreSettings({ ...storeSettings, phone: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={storeSettings.email}
                    onChange={(e) =>
                      setStoreSettings({ ...storeSettings, email: e.target.value })
                    }
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveStoreSettings}
                sx={{ mt: 3, backgroundColor: '#1E40AF' }}
              >
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Password Change */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="600">
                  Change Password
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, currentPassword: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, newPassword: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirmPassword: e.target.value })
                    }
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                startIcon={<SecurityIcon />}
                onClick={handleChangePassword}
                sx={{ mt: 3, backgroundColor: '#1E40AF' }}
                disabled={
                  !passwords.currentPassword ||
                  !passwords.newPassword ||
                  !passwords.confirmPassword
                }
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* App Info */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                About StoreTrack
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                StoreTrack is a complete stock management and point of sale system designed for
                markets and small businesses. Built with Next.js 16, MongoDB, and Material UI.
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

        {/* Environment Info */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#92400E' }}>
                Environment Variables
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#92400E' }}>
                Make sure these variables are set in your .env.local file:
              </Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  p: 2,
                  borderRadius: 2,
                  overflow: 'auto',
                  fontSize: '0.85rem',
                }}
              >
                {`MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret`}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

