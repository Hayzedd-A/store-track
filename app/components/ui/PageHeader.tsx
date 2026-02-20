"use client";

import { Box, Typography, Button } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  action?: {
    label: string;
    startIcon?: React.ReactNode;
    onClick: () => void;
    sx?: SxProps<Theme>;
  };
}

export default function PageHeader({ icon, title, action }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 3,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          sx={{ fontSize: 32, color: "primary.main", mr: 1, display: "flex" }}
        >
          {icon}
        </Box>
        <Typography variant="h4" fontWeight="bold">
          {title}
        </Typography>
      </Box>
      {action && (
        <Button
          variant="contained"
          startIcon={action.startIcon}
          onClick={action.onClick}
          sx={action.sx}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}
