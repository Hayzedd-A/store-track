"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Box, CircularProgress, Typography } from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";

export default function Home() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    } else if (status !== "loading") {
      router.push("/login");
    }
  }, [status, router]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
      }}
    >
      <StoreIcon sx={{ fontSize: 64, color: "#1E40AF", mb: 2 }} />
      <Typography variant="h5" fontWeight="600" sx={{ mb: 1 }}>
        StoreTrack
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Stock Management & POS System
      </Typography>
      <CircularProgress sx={{ mt: 3 }} />
    </Box>
  );
}
