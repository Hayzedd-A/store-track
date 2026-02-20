"use client";

import { Box, Typography } from "@mui/material";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: "center", py: 6 }}>
      <Box
        sx={{
          fontSize: 64,
          color: "#CBD5E1",
          mb: 2,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{ mb: subtitle ? 0.5 : 2 }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      )}
      {action}
    </Box>
  );
}
