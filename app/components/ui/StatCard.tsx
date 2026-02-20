"use client";

import { Box, Card, CardContent, Typography, Skeleton } from "@mui/material";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  isLoading?: boolean;
}

export default function StatCard({
  title,
  value,
  icon,
  color,
  bgColor,
  isLoading,
}: StatCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {isLoading ? <Skeleton width={80} /> : value}
            </Typography>
          </Box>
          <Box
            sx={{ p: 1.5, borderRadius: 2, backgroundColor: bgColor, color }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
