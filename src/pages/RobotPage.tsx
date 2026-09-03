import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  useTheme,
  Avatar,
  LinearProgress,
  Divider,
  Stack,
} from '@mui/material';
import {
  BatteryFull,
  BatteryChargingFull,
  BatteryAlert,
  Thermostat,
  GasMeter,
  Error,
  Warning,
  Info,
  Wifi,
  Settings,
  Videocam,
} from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import { PageSkeleton } from '../components/skeletons/PageSkeleton';
import { robotData } from '../data/mockData';
import { useSimulatedLoading } from '../hooks/useSimulatedLoading';
import type { ReactNode } from 'react';

interface RobotPageProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
  notificationMenu?: ReactNode;
}

const RobotPage = ({ toggleTheme, isDarkMode, notificationMenu }: RobotPageProps) => {
  const theme = useTheme();
  const loading = useSimulatedLoading(700);
  const robot = robotData;

  // Sort detections by severity: critical → high → medium → low
  const sortedDetections = useMemo(() => {
    const severityRank: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    
    return [...robot.detections].sort((a, b) => {
      const aRank = severityRank[a.severity || 'low'];
      const bRank = severityRank[b.severity || 'low'];
      return aRank - bRank;
    });
  }, [robot.detections]);

  // Get battery icon and color
  const getBatteryInfo = (battery: number) => {
    if (battery >= 70) return { icon: BatteryFull, color: theme.palette.success.main };
    if (battery >= 40) return { icon: BatteryChargingFull, color: theme.palette.warning.main };
    return { icon: BatteryAlert, color: theme.palette.error.main };
  };

  // Get gas status color
  const getGasColor = (gas: string) => {
    switch (gas) {
      case 'normal': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'critical': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  // Get detection severity color
  const getDetectionColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      default: return theme.palette.success.main;
    }
  };

  // Get detection icon
  const getDetectionIcon = (type: string) => {
    switch (type) {
      case 'no_helmet':
      case 'no_vest':
      case 'no_gloves':
      case 'no_glasses':
        return <Warning sx={{ color: 'inherit', fontSize: 18 }} />;
      case 'fall':
        return <Error sx={{ color: 'inherit', fontSize: 18 }} />;
      case 'obstacle':
        return <Info sx={{ color: 'inherit', fontSize: 18 }} />;
      default:
        return <Info sx={{ color: 'inherit', fontSize: 18 }} />;
    }
  };

  // Get zone coverage status
  const getZoneCoverage = (zone: string) => {
    const coverage: Record<string, 'full' | 'partial' | 'none'> = {
      'Zone A': 'full',
      'Zone B': 'full',
      'Zone C': 'partial',
      'Zone D': 'none',
    };
    return coverage[zone] || 'none';
  };

  const getCoverageColor = (status: string) => {
    switch (status) {
      case 'full': return theme.palette.success.main;
      case 'partial': return theme.palette.warning.main;
      case 'none': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  const getCoverageLabel = (status: string) => {
    switch (status) {
      case 'full': return 'Full Coverage';
      case 'partial': return 'Partial Coverage';
      case 'none': return 'No Coverage';
      default: return status;
    }
  };

  const batteryInfo = getBatteryInfo(robot.battery);
  const BatteryIcon = batteryInfo.icon;

  return (
    <Box>
      <PageHeader
        title="Robot Unitree"
        subtitle="Real-time robot status, detections, and patrol route"
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        notificationMenu={notificationMenu}
      />

      {loading ? (
        <PageSkeleton chartCount={1} tableRows={3} />
      ) : (
      <React.Fragment>
      {/* Main Layout */}
      <Grid container spacing={3}>
        {/* LEFT COLUMN: Camera Feed (75%) */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Paper
            sx={{
              p: 2,
              height: '100%',
              minHeight: 500,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Videocam sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h6">Live Feed - Patrol Camera</Typography>
              <Chip
                size="small"
                label="LIVE"
                color="error"
                sx={{ ml: 'auto', fontWeight: 600, animation: 'pulse 2s infinite' }}
              />
            </Box>
            
            {/* Camera Feed Placeholder */}
            <Box
              sx={{
                flex: 1,
                bgcolor: theme.palette.mode === 'dark' ? '#1a1a2e' : '#0a0a1a',
                borderRadius: 2,
                position: 'relative',
                minHeight: 400,
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {/* Grid overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `
                    linear-gradient(rgba(0,255,0,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,255,0,0.03) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                  zIndex: 1,
                }}
              />

              {/* Detection boxes */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '15%',
                  left: '10%',
                  width: '30%',
                  height: '25%',
                  border: `3px solid ${theme.palette.error.main}`,
                  borderRadius: 1,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  p: 1,
                  bgcolor: 'rgba(255,0,0,0.05)',
                  boxShadow: '0 0 20px rgba(255,0,0,0.1)',
                }}
              >
                <Chip
                  size="small"
                  label="No Helmet"
                  sx={{
                    bgcolor: theme.palette.error.main,
                    color: '#FFFFFF',
                    fontSize: '0.625rem',
                    height: 20,
                  }}
                />
              </Box>

              <Box
                sx={{
                  position: 'absolute',
                  top: '55%',
                  right: '15%',
                  width: '20%',
                  height: '30%',
                  border: `3px solid ${theme.palette.warning.main}`,
                  borderRadius: 1,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  p: 1,
                  bgcolor: 'rgba(255,165,0,0.05)',
                  boxShadow: '0 0 20px rgba(255,165,0,0.1)',
                }}
              >
                <Chip
                  size="small"
                  label="No Vest"
                  sx={{
                    bgcolor: theme.palette.warning.main,
                    color: '#FFFFFF',
                    fontSize: '0.625rem',
                    height: 20,
                  }}
                />
              </Box>

              <Box
                sx={{
                  position: 'absolute',
                  bottom: '10%',
                  left: '40%',
                  width: '15%',
                  height: '20%',
                  border: `3px solid ${theme.palette.info.main}`,
                  borderRadius: 1,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  p: 1,
                  bgcolor: 'rgba(0,150,255,0.05)',
                  boxShadow: '0 0 20px rgba(0,150,255,0.1)',
                }}
              >
                <Chip
                  size="small"
                  label="Obstacle"
                  sx={{
                    bgcolor: theme.palette.info.main,
                    color: '#FFFFFF',
                    fontSize: '0.625rem',
                    height: 20,
                  }}
                />
              </Box>

              {/* Camera timestamp */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  right: 15,
                  zIndex: 3,
                  color: 'rgba(0,255,0,0.7)',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <span>REC</span>
                <span>•</span>
                <span>09:41:23</span>
                <span>•</span>
                <span>Zone A</span>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: Robot Status + Detections */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Grid container spacing={3}>
            {/* Robot Status */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Robot Status
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BatteryIcon sx={{ color: batteryInfo.color, fontSize: 20 }} />
                        <Typography variant="body2">Battery</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {robot.battery}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={robot.battery}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: theme.palette.action.hover,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: batteryInfo.color,
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Wifi sx={{ fontSize: 20, color: robot.status === 'active' ? theme.palette.success.main : theme.palette.error.main }} />
                      <Typography variant="body2">Connection</Typography>
                    </Box>
                    <Chip 
                      size="small" 
                      label={robot.status === 'active' ? 'Connected' : 'Disconnected'} 
                      color={robot.status === 'active' ? 'success' : 'error'} 
                      sx={{ fontSize: '0.625rem', height: 20, fontWeight: 600 }} 
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Settings sx={{ fontSize: 20, color: robot.mode === 'patrol' ? theme.palette.success.main : theme.palette.warning.main }} />
                      <Typography variant="body2">Mode</Typography>
                    </Box>
                    <Chip 
                      size="small" 
                      label={robot.mode} 
                      color={robot.mode === 'patrol' ? 'success' : 'warning'} 
                      sx={{ fontSize: '0.625rem', height: 20, textTransform: 'capitalize', fontWeight: 600 }} 
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Thermostat sx={{ fontSize: 20, color: robot.tempC > 40 ? theme.palette.error.main : theme.palette.info.main }} />
                      <Typography variant="body2">Temperature</Typography>
                    </Box>
                    <Chip 
                      size="small" 
                      label={`${robot.tempC}°C`} 
                      color={robot.tempC > 40 ? 'error' : 'info'} 
                      sx={{ fontSize: '0.625rem', height: 20, fontWeight: 600 }} 
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <GasMeter sx={{ fontSize: 20, color: getGasColor(robot.gas) }} />
                      <Typography variant="body2">Gas</Typography>
                    </Box>
                    <Chip 
                      size="small" 
                      label={robot.gas} 
                      sx={{ 
                        bgcolor: getGasColor(robot.gas), 
                        color: '#FFFFFF', 
                        fontSize: '0.625rem', 
                        height: 20, 
                        textTransform: 'capitalize',
                        fontWeight: 600,
                      }} 
                    />
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Detections List - SORTED BY SEVERITY */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Detections (Last Patrol)
                </Typography>
                {sortedDetections.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No detections
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {sortedDetections.slice(0, 5).map((detection, index) => {
                      const severityColor = getDetectionColor(detection.severity);
                      return (
                        <Paper
                          key={index}
                          variant="outlined"
                          sx={{
                            p: 1,
                            borderLeft: `4px solid ${severityColor}`,
                            bgcolor: 'transparent',
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'translateX(4px)',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: severityColor + '30', color: severityColor }}>
                              {getDetectionIcon(detection.type)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', color: theme.palette.text.primary }}>
                                {detection.type.replace('_', ' ').toUpperCase()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {detection.zone} • {detection.time}
                              </Typography>
                            </Box>
                            {detection.severity && (
                              <Chip
                                size="small"
                                label={detection.severity}
                                sx={{
                                  bgcolor: severityColor,
                                  color: '#FFFFFF',
                                  fontSize: '0.5rem',
                                  height: 16,
                                  fontWeight: 700,
                                }}
                              />
                            )}
                          </Box>
                        </Paper>
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Patrol Route */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Patrol Route - Zone Coverage
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              {robot.route.map((point, index) => {
                const coverage = getZoneCoverage(point.zone);
                const color = getCoverageColor(coverage);
                return (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        border: `2px solid ${color}`,
                      }}
                    >
                      {point.zone.replace('Zone ', 'Z')}
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                        {point.zone}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                        {getCoverageLabel(coverage)}
                      </Typography>
                    </Box>
                    {index < robot.route.length - 1 && (
                      <Box
                        sx={{
                          width: 30,
                          height: 2,
                          bgcolor: theme.palette.divider,
                          mx: 0.5,
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
      </React.Fragment>
      )}
    </Box>
  );
};

export default RobotPage;