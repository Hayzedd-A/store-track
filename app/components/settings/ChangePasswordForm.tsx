"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Grid,
  Button,
} from "@mui/material";
import { Security as SecurityIcon } from "@mui/icons-material";

interface Passwords {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordFormProps {
  passwords: Passwords;
  onChange: (field: keyof Passwords, value: string) => void;
  onSubmit: () => void;
}

export default function ChangePasswordForm({
  passwords,
  onChange,
  onSubmit,
}: ChangePasswordFormProps) {
  const isDisabled =
    !passwords.currentPassword ||
    !passwords.newPassword ||
    !passwords.confirmPassword;

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <SecurityIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" fontWeight="600">
            Change Password
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => onChange("currentPassword", e.target.value)}
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={passwords.newPassword}
              onChange={(e) => onChange("newPassword", e.target.value)}
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => onChange("confirmPassword", e.target.value)}
            />
          </Grid>
        </Grid>
        <Button
          variant="contained"
          startIcon={<SecurityIcon />}
          onClick={onSubmit}
          disabled={isDisabled}
          sx={{ mt: 3, backgroundColor: "#1E40AF" }}
        >
          Change Password
        </Button>
      </CardContent>
    </Card>
  );
}
