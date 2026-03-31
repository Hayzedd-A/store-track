"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Fade,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  CameraAlt as CameraIcon,
} from "@mui/icons-material";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

type ScanStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "scanning"
  | "found"
  | "error"
  | "denied"
  | "unsupported";

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
  onError?: (error: string) => void;
}

export default function BarcodeScanner({
  open,
  onClose,
  onBarcodeDetected,
  onError,
}: BarcodeScannerProps) {
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const isScanningRef = useRef(false);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScannedCodeRef = useRef<string>("");

  // Stop scanner and cleanup
  const stopScanner = useCallback(async () => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    if (readerRef.current) {
      try {
        await readerRef.current.reset();
        readerRef.current = null;
      } catch (error) {
        console.error("Error resetting scanner:", error);
      }
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    isScanningRef.current = false;
    lastScannedCodeRef.current = "";
  }, []);

  // Handle successful scan with debouncing
  const handleSuccessfulScan = useCallback(
    (barcode: string) => {
      // Debounce: ignore if same code scanned within 500ms
      if (lastScannedCodeRef.current === barcode) return;

      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      lastScannedCodeRef.current = barcode;
      setLastBarcode(barcode);
      setScanStatus("found");

      // Notify parent
      onBarcodeDetected(barcode);

      // Reset after 500ms to allow re-scanning same code
      scanTimeoutRef.current = setTimeout(() => {
        lastScannedCodeRef.current = "";
      }, 500);

      // Close dialog after showing success
      setTimeout(() => {
        onClose();
      }, 1500);
    },
    [onBarcodeDetected, onClose],
  );

  // Start scanner
  const startScanner = useCallback(async () => {
    if (!videoRef.current || isScanningRef.current) return;

    setScanStatus("requesting");
    setErrorMessage(null);

    // Check browser support
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setScanStatus("unsupported");
      setErrorMessage(
        "Camera API is not available. Please use HTTPS or a modern browser.",
      );
      onError?.("Camera API not supported");
      return;
    }

    try {
      // Initialize ZXing reader
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      // Get available video devices
      const videoInputDevices = await reader.listVideoInputDevices();

      if (videoInputDevices.length === 0) {
        throw new Error("No camera found");
      }

      // Find back camera
      const backCamera = videoInputDevices.find(
        (device) =>
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("environment") ||
          device.label.toLowerCase().includes("rear"),
      );

      const selectedDeviceId =
        backCamera?.deviceId || videoInputDevices[0].deviceId;

      setScanStatus("ready");

      // Start decoding from video device
      await reader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, error) => {
          if (result && !isScanningRef.current) {
            const barcode = result.getText();
            console.log("Barcode detected:", barcode);
            handleSuccessfulScan(barcode);
            isScanningRef.current = true;

            // Stop scanner after successful scan
            setTimeout(() => {
              if (readerRef.current) {
                readerRef.current.reset();
              }
            }, 100);
          }

          if (error && !(error instanceof NotFoundException)) {
            console.error("Scan error:", error);
            if (error instanceof Error) {
              setErrorMessage(error.message);
              setScanStatus("error");
            }
          }
        },
      );

      setScanStatus("scanning");
    } catch (error) {
      console.error("Failed to start scanner:", error);

      if (error instanceof DOMException) {
        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          setScanStatus("denied");
          setErrorMessage(
            "Camera access was denied. Please allow camera permission in your browser settings.",
          );
        } else if (error.name === "NotFoundError") {
          setScanStatus("error");
          setErrorMessage("No camera found on this device.");
        } else if (error.name === "NotReadableError") {
          setScanStatus("error");
          setErrorMessage("Camera is already in use by another application.");
        } else {
          setScanStatus("error");
          setErrorMessage(`Camera error: ${error.message}`);
        }
      } else {
        setScanStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to initialize scanner",
        );
      }

      onError?.(
        error instanceof Error
          ? error.message
          : "Scanner initialization failed",
      );
    }
  }, [handleSuccessfulScan, onError]);

  // Start/stop scanner based on dialog open state
  useEffect(() => {
    if (open) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startScanner();
      }, 250);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
      setScanStatus("idle");
      setLastBarcode(null);
      setErrorMessage(null);
      isScanningRef.current = false;
    }
  }, [open, startScanner, stopScanner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  // Viewfinder overlay component
  const ViewfinderOverlay = () => (
    <>
      {/* Dark overlay panels */}
      <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
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
      </Box>

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
          pointerEvents: "none",
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

        {/* Scanning line animation */}
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
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <IconButton onClick={onClose} sx={{ color: "white" }}>
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
          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />

          {scanStatus !== "found" && <ViewfinderOverlay />}

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
              <Typography variant="h6" color="white" fontWeight={700}>
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

          {/* Status indicator */}
          {(scanStatus === "ready" ||
            scanStatus === "scanning" ||
            scanStatus === "requesting") && (
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
              {(scanStatus === "scanning" || scanStatus === "requesting") && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor:
                      scanStatus === "requesting" ? "#ffa726" : "#42a5f5",
                    animation: "pulse 1s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%, 100%": { opacity: 1, transform: "scale(1)" },
                      "50%": { opacity: 0.5, transform: "scale(0.7)" },
                    },
                  }}
                />
              )}
              <Typography variant="caption" color="white" fontWeight={500}>
                {scanStatus === "requesting"
                  ? "Waiting for camera permission..."
                  : scanStatus === "ready"
                    ? "Starting camera..."
                    : "Align barcode within frame"}
              </Typography>
            </Box>
          )}

          {/* Error overlay */}
          {(scanStatus === "error" ||
            scanStatus === "denied" ||
            scanStatus === "unsupported") && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.82)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                px: 3,
                textAlign: "center",
              }}
            >
              <Box sx={{ fontSize: 48 }}>
                {scanStatus === "denied"
                  ? "🚫"
                  : scanStatus === "unsupported"
                    ? "📵"
                    : "⚠️"}
              </Box>
              <Typography variant="subtitle1" color="white" fontWeight={700}>
                {scanStatus === "denied"
                  ? "Camera Access Denied"
                  : scanStatus === "unsupported"
                    ? "Camera Not Supported"
                    : "Camera Error"}
              </Typography>
              <Typography
                variant="body2"
                color="rgba(255,255,255,0.75)"
                sx={{ lineHeight: 1.6 }}
              >
                {errorMessage}
              </Typography>
              {scanStatus === "denied" && (
                <Typography variant="caption" color="rgba(255,255,255,0.5)">
                  Tip: Look for a camera icon in your browser's address bar and
                  allow access.
                </Typography>
              )}
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setScanStatus("idle");
                  setErrorMessage(null);
                  isScanningRef.current = false;
                  setTimeout(() => startScanner(), 100);
                }}
                sx={{
                  color: "white",
                  borderColor: "rgba(255,255,255,0.4)",
                  mt: 1,
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Try Again
              </Button>
            </Box>
          )}
        </Box>

        {/* Instructions */}
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
            Hold the barcode steady within the highlighted frame. The item will
            be added to your cart automatically.
          </Typography>
          <Button
            variant="outlined"
            onClick={onClose}
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
  );
}
