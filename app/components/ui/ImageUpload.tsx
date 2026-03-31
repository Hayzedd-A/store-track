"use client";

import { Box, Button, Typography, Stack } from "@mui/material";

interface ImageUploadProps {
  label?: string;
  previewUrl?: string | null;
  onChange: (file: File) => void;
  onRemove?: () => void; // Added onRemove prop
  accept?: string;
}

export default function ImageUpload({
  label = "Upload Image",
  previewUrl,
  onChange,
  onRemove, // Destructure onRemove
  accept = "image/*",
}: ImageUploadProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange(file);
  };

  return (
    <Box>
      {label && (
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      {previewUrl && (
        <Box
          component="img"
          src={previewUrl}
          alt="Preview"
          sx={{
            width: "100%",
            maxWidth: 300,
            height: 200,
            objectFit: "cover",
            borderRadius: 2,
            mb: 2,
          }}
        />
      )}
      <Stack direction="row" spacing={1}> {/* Use Stack for buttons */}
        <Button variant="outlined" component="label" fullWidth>
          {previewUrl ? "Change Image" : label}
          <input hidden accept={accept} type="file" onChange={handleChange} />
        </Button>
        {previewUrl && onRemove && ( // Conditionally render Remove button
          <Button variant="outlined" color="error" onClick={onRemove} fullWidth>
            Remove Image
          </Button>
        )}
      </Stack>
    </Box>
  );
}
