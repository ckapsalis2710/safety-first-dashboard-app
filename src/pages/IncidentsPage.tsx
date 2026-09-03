import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  LinearProgress,
} from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import { PageSkeleton } from '../components/skeletons/PageSkeleton';
import { getDashboardData } from '../data/enrichedData';
import { useSimulatedLoading } from '../hooks/useSimulatedLoading';
import type { ReactNode } from 'react';

interface IncidentsPageProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
  notificationMenu?: ReactNode;
}

const IncidentsPage = ({ toggleTheme, isDarkMode, notificationMenu }: IncidentsPageProps) => {
  const theme = useTheme();
  const loading = useSimulatedLoading(700);
  const data = getDashboardData();
  const incidents = data.incidents;

  // Monthly data with bubbles
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month) => {
      const count = Math.floor(Math.random() * 5);
      const size = count > 0 ? 20 + count * 10 : 16;
      let color;
      if (count === 0) {
        color = theme.palette.success.main;
      } else if (count >= 4) {
        color = theme.palette.error.main;
      } else if (count >= 2) {
        color = theme.palette.warning.main;
      } else {
        color = theme.palette.info.main;
      }
      return {
        month,
        count,
        size,
        color,
      };
    });
  }, []);

  // Shift data with bars
  const shiftData = useMemo(() => {
    const hours = ['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm', '12am', '2am', '4am'];
    return hours.map((hour) => ({
      hour,
      incidents: Math.floor(Math.random() * 4),
    }));
  }, []);

  // Get color for shift bar (consistent with monthly chart)
  const getShiftBarColor = (value: number) => {
    if (value === 0) return theme.palette.success.main;
    if (value >= 3) return theme.palette.error.main;
    if (value >= 2) return theme.palette.warning.main;
    if (value >= 1) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  // Top conditions data with more variety
  const conditionsData = useMemo(() => {
    const conditions: Record<string, number> = {
      'High Fatigue': incidents.filter(i => i.conditions.fatigue === 'high').length,
      'Temperature > 32°C': incidents.filter(i => i.conditions.tempC > 32).length,
      'Rainy Weather': incidents.filter(i => i.conditions.weather === 'Rainy').length,
      'Windy Weather': incidents.filter(i => i.conditions.weather === 'Windy').length,
      'PPE Missing': incidents.filter(i => !i.conditions.ppeOk).length,
      'Low Lighting': incidents.filter(i => i.conditions.lighting === 'low' || i.conditions.lighting === 'Low').length,
      'High Humidity': incidents.filter(i => (i.conditions.humidity || 0) > 80).length,
    };
    const total = Object.values(conditions).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(conditions)
      .map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / total) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [incidents]);

  // Get color for condition bar
  const getConditionColor = (percentage: number) => {
    if (percentage >= 50) return theme.palette.error.main;
    if (percentage >= 30) return theme.palette.warning.main;
    if (percentage >= 15) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  // Get conditions labels for incident log
  const getConditionLabels = (incident: typeof incidents[0]) => {
    const labels: string[] = [];
    if (incident.conditions.fatigue === 'high') labels.push('High Fatigue');
    if (incident.conditions.weather === 'Rainy') labels.push('Rainy');
    if (incident.conditions.weather === 'Windy') labels.push('Windy');
    if (!incident.conditions.ppeOk) labels.push('PPE Missing');
    if (incident.conditions.tempC > 32) labels.push('Temp > 32°C');
    if (incident.conditions.lighting === 'low' || incident.conditions.lighting === 'Low') labels.push('Low Lighting');
    if ((incident.conditions.humidity || 0) > 80) labels.push('High Humidity');
    return labels;
  };

  // Get condition chip color with better contrast
  const getConditionChipColor = (condition: string) => {
    if (condition.includes('PPE') || condition.includes('Fatigue')) {
      return theme.palette.error.main;
    }
    if (condition.includes('Temp') || condition.includes('Humidity')) {
      return theme.palette.warning.main;
    }
    if (condition.includes('Rainy') || condition.includes('Windy')) {
      return theme.palette.info.main;
    }
    return theme.palette.success.main;
  };

  // Stable random times for each incident (memoized so they don't change on re-render)
  const incidentTimes = useMemo(() => {
    return incidents.slice(0, 8).map(() => {
      const hours = Math.floor(Math.random() * 12) + 6;
      const minutes = Math.floor(Math.random() * 60);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    });
  }, [incidents]);

  return (
    <Box>
      <PageHeader
        title="Incidents"
        subtitle="Incident analysis, conditions, and timelines"
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        notificationMenu={notificationMenu}
      />

      {loading ? (
        <PageSkeleton chartCount={3} tableRows={5} />
      ) : (
      <React.Fragment>
      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Monthly Incident Trend - Bubbles without Y-axis */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Monthly Incident Trend
            </Typography>
            <Box sx={{ display: 'flex', height: 250, pt: 2 }}>
              {/* Chart area */}
              <Box sx={{ flex: 1, position: 'relative' }}>
                {/* Bubbles positioned from bottom */}
                <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '100%' }}>
                  {monthlyData.map((data) => {
                    // Calculate height based on count (max 5)
                    const heightPercent = data.count > 0 ? (data.count / 5) * 80 : 0;
                    return (
                      <Box key={data.month} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', pb: 2 }}>
                        <Box
                          sx={{
                            width: data.size,
                            height: data.size,
                            borderRadius: '50%',
                            bgcolor: data.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: data.count === 0 ? theme.palette.success.contrastText : '#FFFFFF',
                            fontWeight: 700,
                            fontSize: data.count >= 10 ? '0.75rem' : '0.625rem',
                            transition: 'transform 0.2s',
                            marginBottom: `${heightPercent}%`,
                            opacity: data.count === 0 ? 0.6 : 1,
                            '&:hover': {
                              transform: 'scale(1.15)',
                            },
                          }}
                        >
                          {data.count}
                        </Box>
                        <Typography variant="caption" sx={{ mt: 0.5, fontWeight: 600 }}>
                          {data.month}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 1, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: theme.palette.success.main, opacity: 0.6 }} />
                <Typography variant="caption">0</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: theme.palette.info.main }} />
                <Typography variant="caption">1</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: theme.palette.warning.main }} />
                <Typography variant="caption">2</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: theme.palette.error.main }} />
                <Typography variant="caption">3+</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Incidents by Shift - Bars */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Incidents by Shift Hour
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 220, gap: 0.5, pt: 2 }}>
              {shiftData.map((data) => {
                const color = getShiftBarColor(data.incidents);
                const height = data.incidents > 0 ? data.incidents * 40 + 20 : 8;
                return (
                  <Box key={data.hour} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <Box
                      sx={{
                        width: '100%',
                        height: height,
                        maxHeight: 180,
                        bgcolor: color,
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s, background-color 0.3s',
                        opacity: data.incidents === 0 ? 0.6 : 1,
                        '&:hover': {
                          opacity: 0.8,
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.5rem' }}>
                      {data.hour}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: theme.palette.success.main, borderRadius: 1, opacity: 0.6 }} />
                <Typography variant="caption">0</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: theme.palette.info.main, borderRadius: 1 }} />
                <Typography variant="caption">1</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: theme.palette.warning.main, borderRadius: 1 }} />
                <Typography variant="caption">2</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: theme.palette.error.main, borderRadius: 1 }} />
                <Typography variant="caption">3+</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Top Conditions + Incident Log - Equal height */}
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            {/* Top Conditions - Horizontal bars */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper sx={{ p: 2, height: '100%', minHeight: 300 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Top Incident Conditions
                </Typography>
                <Stack spacing={2}>
                  {conditionsData.map((condition) => {
                    const color = getConditionColor(condition.percentage);
                    return (
                      <Box key={condition.name}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">{condition.name}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {condition.percentage}%
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={condition.percentage}
                            sx={{
                              flex: 1,
                              height: 10,
                              borderRadius: 5,
                              bgcolor: theme.palette.action.hover,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: color,
                                borderRadius: 5,
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>
            </Grid>

            {/* Incident Log - Simplified */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ p: 2, height: '100%', minHeight: 300, overflow: 'auto' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Incident Log
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Conditions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {incidents.slice(0, 8).map((incident, index) => {
                        const conditions = getConditionLabels(incident);
                        return (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Typography variant="body2">
                                {incident.date}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {incidentTimes[index]}
                              </Typography>
                            </TableCell>
                            <TableCell>{incident.role}</TableCell>
                            <TableCell>{incident.type}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {conditions.map((condition) => {
                                  const color = getConditionChipColor(condition);
                                  return (
                                    <Chip
                                      key={condition}
                                      size="small"
                                      label={condition}
                                      sx={{
                                        bgcolor: color + '25',
                                        color: color,
                                        fontSize: '0.5rem',
                                        height: 18,
                                        fontWeight: 600,
                                        border: `1px solid ${color}40`,
                                      }}
                                    />
                                  );
                                })}
                                {conditions.length === 0 && (
                                  <Typography variant="caption" color="text.secondary">
                                    No conditions
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      </React.Fragment>
      )}
    </Box>
  );
};

export default IncidentsPage;