"use client";

import { Card, CardContent, Grid, TextField, Button } from "@mui/material";

interface DateFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClear: () => void;
}

export default function DateFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: DateFilterProps) {
  return (
    <Card sx={{ borderRadius: 3, mb: 3 }}>
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid>
            <Button fullWidth variant="outlined" onClick={onClear}>
              Clear Filter
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
