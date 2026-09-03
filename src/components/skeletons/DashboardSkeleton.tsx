import { Box, Grid, Paper, Skeleton } from '@mui/material';

export const DashboardSkeleton = () => (
  <Box>
    {/* KPI Cards */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {Array.from({ length: 4 }).map((_, i) => (
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

    {/* Main area: Table + Alerts */}
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper sx={{ p: 2 }}>
          <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" width="100%" height={40} sx={{ mb: 2 }} />
          {Array.from({ length: 6 }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" width="25%" />
              <Skeleton variant="text" width="15%" />
              <Skeleton variant="text" width="15%" />
              <Skeleton variant="rounded" width={50} height={24} sx={{ ml: 'auto' }} />
            </Box>
          ))}
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Skeleton variant="text" width={100} height={32} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" width="100%" height={40} sx={{ mb: 2 }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="60%" />
            </Box>
          ))}
        </Paper>
      </Grid>
    </Grid>
  </Box>
);
