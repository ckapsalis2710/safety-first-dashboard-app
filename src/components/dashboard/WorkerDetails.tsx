import { useMemo } from 'react';
import { Box, Typography, Chip, Grid, useTheme, Paper } from '@mui/material';
import { Check, Close, BatteryChargingFull, Favorite } from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Worker } from '../../types';

interface WorkerDetailsProps {
  worker: Worker | null;
}

// Generate heart rate data for the last hour (12 data points)
const generateHeartRateData = (baseHeartRate: number) => {
  return Array.from({ length: 12 }, (_, i) => ({
    minute: `${i * 5}m`,
    heartRate: Math.max(60, Math.min(120, baseHeartRate + (Math.random() - 0.5) * 15)),
  }));
};

const WorkerDetails = ({ worker }: WorkerDetailsProps) => {
  const theme = useTheme();

  if (!worker) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
        Select a worker to view details
      </Typography>
    );
  }

  // Memoize heart rate data - only regenerates when worker changes
  const heartRateData = useMemo(() => {
    return generateHeartRateData(worker.heartRate);
  }, [worker.heartRate]);

  // Get avatar color based on name (same as in table)
  const getAvatarColor = (name: string) => {
    const colors = [
      '#D32F2F', '#C62828', '#E65100', '#ED6C02', '#2E7D32',
      '#00695C', '#0D47A1', '#1565C0', '#4527A0', '#4A148C',
      '#6A1B9A', '#880E4F', '#AD1457', '#BF360C'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <Box>
      {/* Header with avatar and basic info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '30%',
            bgcolor: getAvatarColor(worker.name),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {worker.name.split(' ').map(n => n[0]).join('')}
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            {worker.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {worker.role} • {worker.zone}
          </Typography>
        </Box>
        <Chip
          label={worker.compliant ? 'Compliant' : 'Non-Compliant'}
          color={worker.compliant ? 'success' : 'error'}
          size="small"
          sx={{ ml: 'auto', fontWeight: 600, color: '#FFFFFF' }}
        />
      </Box>

      {/* Main Content - 70% / 30% split */}
      <Grid container spacing={2}>
        {/* Left Column: 70% - PPE Status + Heart Rate Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={2}>
            {/* PPE Status - Full width */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                PPE Status
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(worker.ppe).map(([key, value]) => (
                  <Chip
                    key={key}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    icon={value ? <Check fontSize="small" sx={{ color: '#FFFFFF' }} /> : <Close fontSize="small" sx={{ color: '#FFFFFF' }} />}
                    sx={{
                      bgcolor: value ? theme.palette.success.main : theme.palette.error.main,
                      color: '#FFFFFF',
                      fontWeight: 600,
                      borderColor: value ? theme.palette.success.main : theme.palette.error.main,
                      '& .MuiChip-icon': {
                        color: '#FFFFFF',
                      },
                    }}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>

            {/* Heart Rate Chart - Full width */}
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Favorite sx={{ fontSize: 16, color: theme.palette.error.main }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                    Heart Rate Trend (Last Hour)
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={heartRateData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis 
                      dataKey="minute" 
                      tick={{ fontSize: 8 }} 
                      stroke={theme.palette.text.secondary}
                      interval={2}
                    />
                    <YAxis 
                      domain={[60, 120]} 
                      tick={{ fontSize: 8 }} 
                      stroke={theme.palette.text.secondary}
                      width={20}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        borderColor: theme.palette.divider,
                        color: theme.palette.text.primary,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="heartRate"
                      stroke={theme.palette.error.main}
                      strokeWidth={2}
                      dot={false}
                      name="BPM"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column: 30% - Biometrics (aligned with left content) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.75rem', color: theme.palette.text.secondary }}>
              Biometrics
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: 120,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Favorite sx={{ fontSize: 18, color: theme.palette.error.main }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                      {worker.heartRate} bpm
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                    Fatigue: {worker.fatigue}
                  </Typography>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BatteryChargingFull sx={{ fontSize: 18, color: theme.palette.info.main }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                      {worker.battery}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                    {worker.connected ? 'Connected' : 'Offline'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkerDetails;