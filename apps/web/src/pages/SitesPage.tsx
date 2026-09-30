import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Card,
  CardContent,
  useTheme,
  Stack,
} from '@mui/material';
import {
  Business,
  People,
  CheckCircle,
  Warning,
  Error,
  LocationOn,
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
import { getSiteStats } from '../data/enrichedData';
import { useSimulatedLoading } from '../hooks/useSimulatedLoading';
import type { ReactNode } from 'react';

interface SitesPageProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
  notificationMenu?: ReactNode;
}

const SitesPage = ({ toggleTheme, isDarkMode, notificationMenu }: SitesPageProps) => {
  const theme = useTheme();
  const loading = useSimulatedLoading(700);
  const siteStats = getSiteStats();

  // Prepare data for trend chart
  const trendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => {
      const dataPoint: { month: string; [key: string]: string | number } = { month };
      siteStats.forEach((site) => {
        dataPoint[site.site] = site.monthlyTrend[index] || 0;
      });
      return dataPoint;
    });
  }, [siteStats]);

  // Get compliance color
  const getComplianceColor = (value: number) => {
    if (value >= 80) return theme.palette.success.main;
    if (value >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Get risk level color
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      default: return theme.palette.success.main;
    }
  };

  // Get risk level label
  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical': return 'Critical';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      default: return 'Low';
    }
  };

  // Calculate total stats
  const totalWorkers = siteStats.reduce((acc, site) => acc + site.workers, 0);
  const totalCritical = siteStats.reduce((acc, site) => acc + site.criticalAlerts, 0);
  const avgCompliance = Math.round(siteStats.reduce((acc, site) => acc + site.complianceRate, 0) / siteStats.length);

  // Site positions on the map (mock coordinates)
  const sitePositions: Record<string, { x: number; y: number }> = {
    'Construction Site A': { x: 25, y: 30 },
    'Construction Site B': { x: 55, y: 50 },
    'Construction Site C': { x: 75, y: 25 },
  };

  return (
    <Box>
      <PageHeader
        title="Site Analysis"
        subtitle="Compare sites, risk zones, and compliance rates"
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        notificationMenu={notificationMenu}
      />

      {loading ? (
        <PageSkeleton kpiCards={4} chartCount={1} />
      ) : (
      <React.Fragment>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderTop: `4px solid ${theme.palette.text.primary}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <Business sx={{ fontSize: 40, color: theme.palette.text.primary }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {siteStats.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Sites
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderTop: `4px solid ${theme.palette.text.primary}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <People sx={{ fontSize: 40, color: theme.palette.text.primary }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {totalWorkers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Workers
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderTop: `4px solid ${theme.palette.success.main}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CheckCircle sx={{ fontSize: 40, color: theme.palette.success.main }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {avgCompliance}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Compliance
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderTop: `4px solid ${theme.palette.error.main}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <Warning sx={{ fontSize: 40, color: theme.palette.error.main }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {totalCritical}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Critical Alerts
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Site Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {siteStats.map((site) => (
          <Grid size={{ xs: 12, md: 4 }} key={site.site}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[6],
                },
                borderTop: `4px solid ${getComplianceColor(site.complianceRate)}`,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {site.site}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <People sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="text.secondary">
                      {site.workers} workers
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CheckCircle sx={{ fontSize: 16, color: theme.palette.success.main }} />
                    <Typography variant="body2" color="text.secondary">
                      {site.complianceRate}% compliance
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    size="small"
                    icon={<Warning sx={{ fontSize: 14 }} />}
                    label={`${site.activeAlerts} active`}
                    color="warning"
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    icon={<Error sx={{ fontSize: 14 }} />}
                    label={`${site.criticalAlerts} critical`}
                    color="error"
                    variant="outlined"
                  />
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                  Risk Zones
                </Typography>
                <Stack spacing={1}>
                  {site.riskZones.map((zone) => (
                    <Box key={zone.zone} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 16, color: getRiskColor(zone.riskLevel) }} />
                        <Typography variant="body2">{zone.zone}</Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={`${getRiskLabel(zone.riskLevel)} (${zone.incidents} incidents)`}
                        sx={{
                          bgcolor: getRiskColor(zone.riskLevel) + '20',
                          color: getRiskColor(zone.riskLevel),
                          fontSize: '0.625rem',
                          height: 20,
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Compliance Trend + Map */}
      <Grid container spacing={3}>
        {/* Compliance Trend Chart */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Compliance Trend (6 Months)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                <YAxis domain={[0, 100]} stroke={theme.palette.text.secondary} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                    color: theme.palette.text.primary,
                  }}
                />
                <Legend />
                {siteStats.map((site, index) => {
                  const colors = [
                    theme.palette.success.main,
                    theme.palette.warning.main,
                    theme.palette.error.main,
                  ];
                  return (
                    <Line
                      key={site.site}
                      type="monotone"
                      dataKey={site.site}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ fill: colors[index % colors.length] }}
                      name={site.site}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Risk Zone Map */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Site Risk Map
            </Typography>
            
            {/* Map Container */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: 300,
                bgcolor: theme.palette.mode === 'dark' ? '#1a1a2e' : '#f0f2f5',
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {/* Grid lines */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `
                    linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: '30px 30px',
                  zIndex: 0,
                }}
              />

              {/* Site markers */}
              {siteStats.map((site) => {
                const pos = sitePositions[site.site] || { x: 50, y: 50 };
                const color = getComplianceColor(site.complianceRate);
                return (
                  <Box
                    key={site.site}
                    sx={{
                      position: 'absolute',
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translate(-50%, -50%) scale(1.2)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 20px ${color}40`,
                        border: `2px solid ${color}`,
                      }}
                    >
                      <LocationOn sx={{ fontSize: 16, color: '#FFFFFF' }} />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        bgcolor: theme.palette.background.paper,
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        boxShadow: theme.shadows[1],
                      }}
                    >
                      {site.site.replace('Construction ', '')}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.5rem',
                        fontWeight: 700,
                        color: color,
                      }}
                    >
                      {site.complianceRate}%
                    </Typography>
                  </Box>
                );
              })}

              {/* Legend - Bottom Left */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  zIndex: 2,
                  bgcolor: theme.palette.background.paper,
                  borderRadius: 1,
                  p: 1,
                  boxShadow: theme.shadows[2],
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Compliance Legend
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.success.main }} />
                    <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>Good (≥80%)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.warning.main }} />
                    <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>Medium (60-79%)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.error.main }} />
                    <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>Critical (&lt;60%)</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      </React.Fragment>
      )}
    </Box>
  );
};

export default SitesPage;