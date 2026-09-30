import { Skeleton, Paper } from '@mui/material';

interface ChartSkeletonProps {
  height?: number;
}

export const ChartSkeleton = ({ height = 250 }: ChartSkeletonProps) => (
  <Paper sx={{ p: 2 }}>
    <Skeleton variant="text" width={180} height={28} sx={{ mb: 2 }} />
    <Skeleton variant="rounded" width="100%" height={height} />
  </Paper>
);
