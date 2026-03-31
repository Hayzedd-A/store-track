"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Fade,
} from "@mui/material";
import {
  Search as SearchIcon,
  QrCodeScanner as ScannerIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  CameraAlt as CameraIcon,
} from "@mui/icons-material";
import Quagga, { QuaggaJSResultCallbackFunction } from "@ericblade/quagga2";

interface Category {
  _id: string;
  name: string;
  color: string;
}

interface ProductSearchProps {
  searchQuery: string;
  selectedCategory: string | null;
  categories: Category[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (categoryId: string | null) => void;
  /** Called when a barcode is successfully scanned; parent handles add-to-cart */
  onBarcodeDetected?: (barcode: string) => void;
}

type ScanStatus = "idle" | "ready" | "scanning" | "found" | "error";

export default function ProductSearch({
  searchQuery,
  selectedCategory,
  categories,
  onSearchChange,
  onCategoryChange,
  onBarcodeDetected,
}: ProductSearchProps) {
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const quaggaStarted = useRef(false);
  const detectedRef = useRef(false);

  const stopScanner = useCallback(() => {
    if (quaggaStarted.current) {
      try {
        Quagga.offDetected();
        Quagga.stop();
      } catch (_) {}
      quaggaStarted.current = false;
    }
  }, []);

  const startScanner = useCallback(() => {
    if (!videoRef.current || quaggaStarted.current) return;
    detectedRef.current = false;
    setScanStatus("ready");

    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            facingMode: "environment",
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
          },
        },
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "code_128_reader",
            "code_39_reader",
            "upc_reader",
            "upc_e_reader",
          ],
        },
        locate: true,
      },
      (err: Error | null) => {
        if (err) {
          console.error("Quagga init error:", err);
          setScanStatus("error");
          quaggaStarted.current = false;
          return;
        }
        Quagga.start();
        quaggaStarted.current = true;
        setScanStatus("scanning");
      },
    );

    const handleDetected: QuaggaJSResultCallbackFunction = (result) => {
      console.log("Barcode detected:", result);
      if (detectedRef.current) return; // prevent duplicate fires
      if (result?.codeResult?.code) {
        const barcode = result.codeResult.code;
        detectedRef.current = true;
        setScanStatus("found");
        setLastBarcode(barcode);
        stopScanner();

        if (onBarcodeDetected) {
          onBarcodeDetected(barcode);
        } else {
          onSearchChange(barcode);
        }

        // Close dialog after brief success display
        setTimeout(() => {
          setScannerOpen(false);
          setScanStatus("idle");
          setLastBarcode(null);
        }, 1400);
      }
    };

    Quagga.onDetected(handleDetected);
  }, [onBarcodeDetected, onSearchChange, stopScanner]);

  // Start scanner when dialog opens, stop when it closes
  useEffect(() => {
    if (scannerOpen) {
      // Small delay to let the DOM mount
      const t = setTimeout(() => startScanner(), 200);
      return () => clearTimeout(t);
    } else {
      stopScanner();
      setScanStatus("idle");
      setLastBarcode(null);
    }
  }, [scannerOpen, startScanner, stopScanner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopScanner();
  }, [stopScanner]);

  const handleOpenScanner = () => {
    detectedRef.current = false;
    setScannerOpen(true);
  };

  const handleCloseScanner = () => {
    setScannerOpen(false);
  };

  return (
    <>
      {/* Search bar */}
      <Box sx={{ position: "relative", mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search products by name, SKU, or barcode..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleOpenScanner}
                  color="primary"
                  title="Open camera barcode scanner"
                  size="small"
                >
                  <ScannerIcon />
                </IconButton>
                {searchQuery && (
                  <IconButton
                    onClick={() => onSearchChange("")}
                    size="small"
                    title="Clear search"
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Category chips */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <Chip
          label="All"
          onClick={() => onCategoryChange(null)}
          color={!selectedCategory ? "primary" : "default"}
          sx={{ borderRadius: 2 }}
        />
        {categories.map((category) => (
          <Chip
            key={category._id}
            label={category.name}
            onClick={() => onCategoryChange(category._id)}
            sx={{
              borderRadius: 2,
              backgroundColor:
                selectedCategory === category._id ? category.color : undefined,
              color: selectedCategory === category._id ? "white" : undefined,
            }}
          />
        ))}
      </Box>

      {/* Camera Scanner Dialog */}
      <Dialog
        open={scannerOpen}
        onClose={handleCloseScanner}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "#0a0a0a",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "#0a0a0a",
            color: "white",
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CameraIcon fontSize="small" />
            <Typography variant="h6" fontWeight={600}>
              Scan Barcode
            </Typography>
          </Box>
          <IconButton onClick={handleCloseScanner} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, bgcolor: "#0a0a0a", position: "relative" }}>
          {/* Camera feed container */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              aspectRatio: "4/3",
              overflow: "hidden",
              bgcolor: "#111",
            }}
          >
            {/* Quagga injects the <video> here */}
            <Box
              ref={videoRef}
              sx={{
                width: "100%",
                height: "100%",
                "& video": {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                },
                "& canvas": {
                  display: "none",
                },
              }}
            />

            {/* Dark overlay with cutout — achieved via 4 panels */}
            {scanStatus !== "found" && (
              <>
                {/* Top overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "25%",
                    bgcolor: "rgba(0,0,0,0.55)",
                  }}
                />
                {/* Bottom overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "25%",
                    bgcolor: "rgba(0,0,0,0.55)",
                  }}
                />
                {/* Left overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "25%",
                    left: 0,
                    width: "10%",
                    bottom: "25%",
                    bgcolor: "rgba(0,0,0,0.55)",
                  }}
                />
                {/* Right overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "25%",
                    right: 0,
                    width: "10%",
                    bottom: "25%",
                    bgcolor: "rgba(0,0,0,0.55)",
                  }}
                />

                {/* Viewfinder frame */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "25%",
                    left: "10%",
                    right: "10%",
                    bottom: "25%",
                    border: "2px solid",
                    borderColor:
                      scanStatus === "scanning"
                        ? "primary.main"
                        : "rgba(255,255,255,0.4)",
                    borderRadius: 1,
                    transition: "border-color 0.3s",
                  }}
                >
                  {/* Corner accents */}
                  {[
                    {
                      top: -2,
                      left: -2,
                      borderTop: "3px solid",
                      borderLeft: "3px solid",
                      borderTopLeftRadius: 4,
                    },
                    {
                      top: -2,
                      right: -2,
                      borderTop: "3px solid",
                      borderRight: "3px solid",
                      borderTopRightRadius: 4,
                    },
                    {
                      bottom: -2,
                      left: -2,
                      borderBottom: "3px solid",
                      borderLeft: "3px solid",
                      borderBottomLeftRadius: 4,
                    },
                    {
                      bottom: -2,
                      right: -2,
                      borderBottom: "3px solid",
                      borderRight: "3px solid",
                      borderBottomRightRadius: 4,
                    },
                  ].map((style, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: "absolute",
                        width: 24,
                        height: 24,
                        borderColor: "primary.main",
                        ...style,
                      }}
                    />
                  ))}

                  {/* Scanning laser line animation */}
                  {scanStatus === "scanning" && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 4,
                        right: 4,
                        height: "2px",
                        background:
                          "linear-gradient(90deg, transparent, #1976d2, #42a5f5, #1976d2, transparent)",
                        boxShadow: "0 0 8px 2px rgba(66,165,245,0.7)",
                        animation: "scanLine 1.8s ease-in-out infinite",
                        "@keyframes scanLine": {
                          "0%": { top: "5%" },
                          "50%": { top: "90%" },
                          "100%": { top: "5%" },
                        },
                      }}
                    />
                  )}
                </Box>
              </>
            )}

            {/* Success overlay */}
            <Fade in={scanStatus === "found"}>
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(46, 125, 50, 0.85)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1.5,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 64, color: "white" }} />
                <Typography
                  variant="h6"
                  color="white"
                  fontWeight={700}
                  textAlign="center"
                >
                  Barcode Detected!
                </Typography>
                {lastBarcode && (
                  <Typography
                    variant="body2"
                    color="rgba(255,255,255,0.85)"
                    sx={{ fontFamily: "monospace", fontSize: "1rem" }}
                  >
                    {lastBarcode}
                  </Typography>
                )}
                <Typography variant="caption" color="rgba(255,255,255,0.7)">
                  Adding to cart...
                </Typography>
              </Box>
            </Fade>

            {/* Status chip at bottom of camera area */}
            {scanStatus !== "found" && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  px: 2,
                  py: 0.75,
                  borderRadius: 5,
                  bgcolor: "rgba(0,0,0,0.65)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  whiteSpace: "nowrap",
                }}
              >
                {scanStatus === "scanning" && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#42a5f5",
                      animation: "pulse 1s ease-in-out infinite",
                      "@keyframes pulse": {
                        "0%, 100%": { opacity: 1, transform: "scale(1)" },
                        "50%": { opacity: 0.5, transform: "scale(0.7)" },
                      },
                    }}
                  />
                )}
                <Typography variant="caption" color="white" fontWeight={500}>
                  {scanStatus === "ready"
                    ? "Starting camera..."
                    : scanStatus === "scanning"
                      ? "Align barcode within frame"
                      : scanStatus === "error"
                        ? "Camera unavailable"
                        : ""}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Instruction text below camera */}
          <Box
            sx={{
              px: 3,
              py: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              bgcolor: "#141414",
            }}
          >
            <Typography
              variant="body2"
              color="rgba(255,255,255,0.7)"
              textAlign="center"
            >
              Hold the barcode steady within the highlighted frame. The item
              will be added to your cart automatically.
            </Typography>
            <Button
              variant="outlined"
              onClick={handleCloseScanner}
              sx={{
                color: "rgba(255,255,255,0.6)",
                borderColor: "rgba(255,255,255,0.2)",
                borderRadius: 2,
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.5)",
                  bgcolor: "rgba(255,255,255,0.05)",
                },
              }}
            >
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
