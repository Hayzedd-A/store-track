"use client";

import { TableRow, TableCell, Box } from "@mui/material";

interface LoadingRowsProps {
  rows?: number;
  cols?: number;
}

export default function LoadingRows({ rows = 5, cols = 6 }: LoadingRowsProps) {
  return (
    <>
      {Array(rows)
        .fill(0)
        .map((_, i) => (
          <TableRow key={i}>
            {Array(cols)
              .fill(0)
              .map((_, j) => (
                <TableCell key={j}>
                  <Box
                    sx={{
                      height: 24,
                      backgroundColor: "#E2E8F0",
                      borderRadius: 1,
                    }}
                  />
                </TableCell>
              ))}
          </TableRow>
        ))}
    </>
  );
}
