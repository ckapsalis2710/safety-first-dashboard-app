import { Box, Grid, Paper, Skeleton } from '@mui/material';

interface PageSkeletonProps {
  kpiCards?: number;
  chartCount?: number;
  tableRows?: number;
}

export const PageSkeleton = ({ kpiCards = 0, chartCount = 0, tableRows = 0 }: PageSkeletonProps) => (
  <Box>
    {/* KPI Cards */}
    {kpiCards > 0 && (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Array.from({ length: kpiCards }).map((_, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="rounded" width={48} height={48} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={60} height={40} />
                <Skeleton variant="text" width={100} height={20} />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    )}

    {/* Charts */}
    {chartCount > 0 && (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Array.from({ length: chartCount }).map((_, i) => (
          <Grid size={{ xs: 12, md: 12 / Math.min(chartCount, 2) }} key={i}>
            <Paper sx={{ p: 2 }}>
              <Skeleton variant="text" width={180} height={28} sx={{ mb: 2 }} />
              <Skeleton variant="rounded" width="100%" height={220} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    )}

    {/* Table */}
    {tableRows > 0 && (
      <Paper sx={{ p: 2 }}>
        <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
        {Array.from({ length: tableRows }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="text" width="20%" />
            <Skeleton variant="text" width="20%" />
            <Skeleton variant="text" width="15%" sx={{ ml: 'auto' }} />
          </Box>
        ))}
      </Paper>
    )}
  </Box>
);
