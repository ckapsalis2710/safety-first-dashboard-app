import { Skeleton, Paper, Box } from '@mui/material';

export const KpiCardSkeleton = () => (
  <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
    <Skeleton variant="rounded" width={48} height={48} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width={60} height={40} />
      <Skeleton variant="text" width={100} height={20} />
    </Box>
  </Paper>
);
