import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Favorite,
  AssignmentLate,
  Warning,
  TrendingUp,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import PageHeader from '../components/common/PageHeader';
import { PageSkeleton } from '../components/skeletons/PageSkeleton';
import { getDashboardData, getIncidentsByWorkerId } from '../data/enrichedData';
import { useSimulatedLoading } from '../hooks/useSimulatedLoading';
import type { ReactNode } from 'react';

interface WorkerHistoryPageProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
  notificationMenu?: ReactNode;
}

// Generate 30 days of mock data
const generateMonthlyData = (baseValue: number, variance: number, days: number = 30) => {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * variance)),
    };
  });
};

// Generate a single random time string
const generateRandomTime = (shift: string) => {
  switch (shift) {
    case 'morning': {
      const hours = Math.floor(Math.random() * 4) + 6;
      const minutes = Math.floor(Math.random() * 60);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    case 'afternoon': {
      const hours = Math.floor(Math.random() * 4) + 12;
      const minutes = Math.floor(Math.random() * 60);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    case 'night': {
      const hours = Math.floor(Math.random() * 6) + 18;
      const minutes = Math.floor(Math.random() * 60);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    default: {
      const hours = Math.floor(Math.random() * 12) + 6;
      const minutes = Math.floor(Math.random() * 60);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }
};

const WorkerHistoryPage = ({ toggleTheme, isDarkMode, notificationMenu }: WorkerHistoryPageProps) => {
  const theme = useTheme();
  const loading = useSimulatedLoading(700);
  const [searchParams] = useSearchParams();
  const workerIdFromUrl = searchParams.get('workerId');

  const data = getDashboardData();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(
    workerIdFromUrl || data.workers[0]?.id || ''
  );

  const selectedWorker = data.workers.find(w => w.id === selectedWorkerId);
  const workerIncidents = selectedWorker ? getIncidentsByWorkerId(selectedWorker.id) : [];

  // Monthly compliance data (30 days) - MEMOIZED
  const complianceData = useMemo(() => {
    if (!selectedWorker) return [];
    return generateMonthlyData(selectedWorker.complianceScore, 20);
  }, [selectedWorker]);

  // Monthly biometrics data (30 days) - MEMOIZED
  const biometricsData = useMemo(() => {
    if (!selectedWorker) return [];
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const heartRate = Math.max(60, Math.min(120, (selectedWorker.heartRate || 80) + (Math.random() - 0.5) * 20));
      const fatigueValues = { low: 20, medium: 50, high: 80 };
      const baseFatigue = fatigueValues[selectedWorker.fatigue as keyof typeof fatigueValues] || 50;
      const fatigue = Math.max(0, Math.min(100, baseFatigue + (Math.random() - 0.5) * 30));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        heartRate: Math.round(heartRate),
        fatigue: Math.round(fatigue),
      };
    });
  }, [selectedWorker]);

  // Calculate stats - MEMOIZED
  const violationsCount = useMemo(() => {
    return workerIncidents.filter(i => i.type.includes('Violation') || i.type.includes('PPE')).length;
  }, [workerIncidents]);

  const incidentsCount = useMemo(() => {
    return workerIncidents.length;
  }, [workerIncidents]);

  const avgHeartRate = useMemo(() => {
    if (!selectedWorker || biometricsData.length === 0) return 0;
    return Math.round(biometricsData.reduce((acc, d) => acc + d.heartRate, 0) / biometricsData.length);
  }, [selectedWorker, biometricsData]);

  // Stable incident times (memoized so they don't change on re-render)
  const incidentTimes = useMemo(() => {
    return workerIncidents.map(i => generateRandomTime(i.conditions.shift));
  }, [workerIncidents]);

  const handleWorkerChange = (event: SelectChangeEvent) => {
    setSelectedWorkerId(event.target.value);
  };

  // Get avatar color
  const getAvatarColor = (name: string) => {
    const colors = [
      '#D32F2F', '#C62828', '#E65100', '#ED6C02', '#2E7D32',
      '#00695C', '#0D47A1', '#1565C0', '#4527A0', '#4A148C',
      '#6A1B9A', '#880E4F', '#AD1457', '#BF360C'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      default: return theme.palette.success.main;
    }
  };

  return (
    <Box>
      <PageHeader
        title="Worker History"
        subtitle="Detailed analysis of worker compliance and biometrics"
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        notificationMenu={notificationMenu}
      />

      {loading ? (
        <PageSkeleton chartCount={2} tableRows={5} />
      ) : (
      <React.Fragment>
      {/* Worker Selector */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          {/* Row 1: Select Worker */}
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth size="small" sx={{ maxWidth: { xs: '100%', md: '400px' } }}>
              <InputLabel>Select Worker</InputLabel>
              <Select
                value={selectedWorkerId}
                label="Select Worker"
                onChange={handleWorkerChange}
              >
                {data.workers.map((worker) => (
                  <MenuItem key={worker.id} value={worker.id}>
                    {worker.name} ({worker.id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Row 2: Worker Info + Labels */}
          {selectedWorker && (
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                  mt: 1,
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                {/* Left: Avatar + Name + Details */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: getAvatarColor(selectedWorker.name),
                      color: '#FFFFFF',
                      fontWeight: 600,
                      borderRadius: '30%',
                      fontSize: 16,
                    }}
                  >
                    {selectedWorker.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {selectedWorker.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedWorker.role} • {selectedWorker.site} • {selectedWorker.zone}
                    </Typography>
                  </Box>
                </Box>

                {/* Right: Labels - with solid colors and white text */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={selectedWorker.compliant ? 'Compliant' : 'Non-Compliant'}
                    color={selectedWorker.compliant ? 'success' : 'error'}
                    size="small"
                    sx={{ fontWeight: 600, color: '#FFFFFF' }}
                  />
                  <Chip
                    label={`${selectedWorker.complianceScore}% Score`}
                    size="small"
                    sx={{ 
                      bgcolor: theme.palette.primary.main,
                      color: '#FFFFFF',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    icon={<Warning sx={{ fontSize: 14, color: '#FFFFFF' }} />}
                    label={`${violationsCount} violations/mo`}
                    size="small"
                    sx={{ 
                      bgcolor: theme.palette.warning.main,
                      color: '#FFFFFF',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    icon={<AssignmentLate sx={{ fontSize: 14, color: '#FFFFFF' }} />}
                    label={`${incidentsCount} incidents`}
                    size="small"
                    sx={{ 
                      bgcolor: theme.palette.error.main,
                      color: '#FFFFFF',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    icon={<Favorite sx={{ fontSize: 14, color: '#FFFFFF' }} />}
                    label={`${avgHeartRate} bpm avg`}
                    size="small"
                    sx={{ 
                      bgcolor: theme.palette.info.main,
                      color: '#FFFFFF',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {selectedWorker && (
        <Grid container spacing={3}>
          {/* Compliance Trend Chart - Monthly */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingUp sx={{ color: theme.palette.success.main }} />
                <Typography variant="h6">PPE Compliance Trend (30 Days)</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={complianceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis
                    dataKey="date"
                    stroke={theme.palette.text.secondary}
                    tick={{ fontSize: 10 }}
                    interval={4}
                  />
                  <YAxis domain={[0, 100]} stroke={theme.palette.text.secondary} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider,
                      color: theme.palette.text.primary,
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={theme.palette.success.main}
                    strokeWidth={2}
                    dot={false}
                    name="Compliance %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Biometrics Chart - Monthly */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Favorite sx={{ color: theme.palette.error.main }} />
                <Typography variant="h6">Biometrics (30 Days)</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={biometricsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis
                    dataKey="date"
                    stroke={theme.palette.text.secondary}
                    tick={{ fontSize: 10 }}
                    interval={4}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[40, 140]}
                    stroke={theme.palette.error.main}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    stroke={theme.palette.warning.main}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider,
                      color: theme.palette.text.primary,
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="heartRate"
                    stroke={theme.palette.error.main}
                    strokeWidth={2}
                    dot={false}
                    name="Heart Rate (BPM)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="fatigue"
                    stroke={theme.palette.warning.main}
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 5"
                    name="Fatigue Index"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Incidents & Violations Log - Full width */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AssignmentLate sx={{ color: theme.palette.warning.main }} />
                <Typography variant="h6">Incidents & Violations Log</Typography>
                <Chip
                  label={`${workerIncidents.length} records`}
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ ml: 'auto' }}
                />
              </Box>

              {workerIncidents.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No incidents or violations recorded for this worker
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Zone</TableCell>
                        <TableCell>Conditions</TableCell>
                        <TableCell align="center">Severity</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {workerIncidents.map((incident, index) => {
                        const incidentTime = incidentTimes[index];
                        return (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Typography variant="body2">
                                {incident.date} 
                                <span style={{ color: theme.palette.text.secondary, fontSize: '0.75rem', marginLeft: '6px' }}>
                                  • {incidentTime}
                                </span>
                              </Typography>
                            </TableCell>
                            <TableCell>{incident.type}</TableCell>
                            <TableCell>
                              {incident.conditions.weather === 'Rainy' ? 'Zone A' : 
                               incident.conditions.weather === 'Windy' ? 'Zone B' : 
                               incident.conditions.weather === 'Clear' ? 'Zone C' : 'Zone A'}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                <Chip
                                  size="small"
                                  label={`${incident.conditions.tempC}°C`}
                                  sx={{ 
                                    fontSize: '0.625rem', 
                                    height: 20,
                                    bgcolor: theme.palette.info.main,
                                    color: '#FFFFFF',
                                    fontWeight: 500,
                                  }}
                                />
                                <Chip
                                  size="small"
                                  label={incident.conditions.weather}
                                  sx={{ 
                                    fontSize: '0.625rem', 
                                    height: 20,
                                    bgcolor: theme.palette.info.main,
                                    color: '#FFFFFF',
                                    fontWeight: 500,
                                  }}
                                />
                                <Chip
                                  size="small"
                                  label={`Fatigue: ${incident.conditions.fatigue}`}
                                  sx={{ 
                                    fontSize: '0.625rem', 
                                    height: 20,
                                    bgcolor: incident.conditions.fatigue === 'high' 
                                      ? theme.palette.error.main 
                                      : incident.conditions.fatigue === 'medium' 
                                        ? theme.palette.warning.main 
                                        : theme.palette.success.main,
                                    color: '#FFFFFF',
                                    fontWeight: 500,
                                  }}
                                />
                                <Chip
                                  size="small"
                                  label={incident.conditions.ppeOk ? 'PPE OK' : 'PPE Missing'}
                                  sx={{ 
                                    fontSize: '0.625rem', 
                                    height: 20,
                                    bgcolor: incident.conditions.ppeOk 
                                      ? theme.palette.success.main 
                                      : theme.palette.error.main,
                                    color: '#FFFFFF',
                                    fontWeight: 500,
                                  }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                size="small"
                                label={incident.severity}
                                sx={{
                                  bgcolor: getSeverityColor(incident.severity),
                                  color: '#FFFFFF',
                                  fontSize: '0.625rem',
                                  height: 24,
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
      </React.Fragment>
      )}
    </Box>
  );
};

export default WorkerHistoryPage;