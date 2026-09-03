import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Button,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Search,
  People,
  CheckCircle,
  Warning,
  Error,
  Visibility,
} from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import WorkerDetails from '../components/dashboard/WorkerDetails';
import { DashboardSkeleton } from '../components/skeletons/DashboardSkeleton';
import { getDashboardData } from '../data/enrichedData';
import { useSimulatedLoading } from '../hooks/useSimulatedLoading';
import type { ReactNode } from 'react';

interface DashboardProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
  notificationMenu?: ReactNode;
  alerts: import('../types').Alert[];
  onAcknowledgeAlert: (alertId: string) => void;
}

const Dashboard = ({ toggleTheme, isDarkMode, notificationMenu, alerts, onAcknowledgeAlert }: DashboardProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const data = getDashboardData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState(0);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [alertFilterSeverity, setAlertFilterSeverity] = useState<string>('all');
  const [alertFilterWorker, setAlertFilterWorker] = useState<string>('all');

  const loading = useSimulatedLoading(700);

  // Filter workers (memoized)
  const filteredWorkers = useMemo(() => {
    return data.workers
      .filter((worker) =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.site.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((worker) => {
        if (filterTab === 0) return true;
        if (filterTab === 1) return worker.compliant;
        if (filterTab === 2) return !worker.compliant;
        return true;
      });
  }, [data.workers, searchTerm, filterTab]);

  // Selected worker (memoized)
  const selectedWorker = useMemo(() => {
    return data.workers.find(w => w.id === selectedWorkerId) ?? null;
  }, [data.workers, selectedWorkerId]);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    let filtered = alerts.filter(a => !a.acknowledged);
    
    if (alertFilterSeverity !== 'all') {
      filtered = filtered.filter(a => a.severity === alertFilterSeverity);
    }
    
    if (alertFilterWorker !== 'all') {
      filtered = filtered.filter(a => a.workerId === alertFilterWorker);
    }
    
    return filtered;
  }, [alerts, alertFilterSeverity, alertFilterWorker]);

  // Alert counts by severity
  const alertCounts = useMemo(() => {
    const active = alerts.filter(a => !a.acknowledged);
    return {
      critical: active.filter(a => a.severity === 'critical').length,
      high: active.filter(a => a.severity === 'high').length,
      medium: active.filter(a => a.severity === 'medium').length,
      low: active.filter(a => a.severity === 'low').length,
      total: active.length,
    };
  }, [alerts]);

  // KPI Data
  const kpis = [
    {
      label: 'Workers in Field',
      value: data.stats.totalWorkers,
      icon: People,
      color: theme.palette.text.primary,
    },
    {
      label: 'PPE Compliance',
      value: `${data.stats.complianceRate}%`,
      icon: CheckCircle,
      color: theme.palette.success.main,
    },
    {
      label: 'Active Alerts',
      value: alertCounts.total,
      icon: Warning,
      color: theme.palette.warning.main,
    },
    {
      label: 'Critical',
      value: alertCounts.critical,
      icon: Error,
      color: theme.palette.error.main,
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      default: return theme.palette.success.main;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Critical';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      default: return 'Low';
    }
  };

  // Get avatar colors based on name
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
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to the SafetyFirst Supervisor Dashboard"
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        notificationMenu={notificationMenu}
      />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <React.Fragment>
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.label}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderTop: `4px solid ${kpi.color}`,
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[6],
                },
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: kpi.color + '20',
                  color: kpi.color,
                }}
              >
                <kpi.icon />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  {kpi.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {kpi.label}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Workers Table and Alerts Panel */}
      <Grid container spacing={3}>
        {/* Workers Table with Details inside */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2 }}>
            {/* Workers Table Header - Search left, filters right */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>Workers</Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Search by name / role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ flex: '0 1 260px' }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button
                    variant={filterTab === 0 ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setFilterTab(0)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      borderRadius: 1.5,
                      bgcolor: filterTab === 0 ? theme.palette.primary.main : 'transparent',
                      color: filterTab === 0 ? '#FFFFFF' : theme.palette.text.primary,
                      borderColor: filterTab === 0 ? 'transparent' : theme.palette.divider,
                      '&:hover': {
                        bgcolor: filterTab === 0 ? theme.palette.primary.dark : theme.palette.action.hover,
                      },
                    }}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterTab === 1 ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setFilterTab(1)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      borderRadius: 1.5,
                      bgcolor: filterTab === 1 ? theme.palette.success.main : 'transparent',
                      color: filterTab === 1 ? '#FFFFFF' : theme.palette.text.primary,
                      borderColor: filterTab === 1 ? 'transparent' : theme.palette.divider,
                      '&:hover': {
                        bgcolor: filterTab === 1 ? theme.palette.success.dark : theme.palette.action.hover,
                      },
                    }}
                  >
                    Compliant
                  </Button>
                  <Button
                    variant={filterTab === 2 ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setFilterTab(2)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      borderRadius: 1.5,
                      bgcolor: filterTab === 2 ? theme.palette.error.main : 'transparent',
                      color: filterTab === 2 ? '#FFFFFF' : theme.palette.text.primary,
                      borderColor: filterTab === 2 ? 'transparent' : theme.palette.divider,
                      '&:hover': {
                        bgcolor: filterTab === 2 ? theme.palette.error.dark : theme.palette.action.hover,
                      },
                    }}
                  >
                    Non-Compliant
                  </Button>
                </Box>
              </Box>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Zone</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredWorkers.map((worker) => {
                    const isSelected = selectedWorkerId === worker.id;
                    return (
                      <TableRow
                        key={worker.id}
                        hover
                        onClick={() => setSelectedWorkerId(worker.id)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: isSelected ? theme.palette.action.selected : 'transparent',
                          transition: 'background-color 0.15s ease',
                          '&:hover': {
                            bgcolor: isSelected ? theme.palette.action.selected : theme.palette.action.hover,
                          },
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: getAvatarColor(worker.name),
                                color: '#FFFFFF',
                                fontSize: 12,
                                fontWeight: 600,
                                borderRadius: '30%',
                              }}
                            >
                              {worker.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                                {worker.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {worker.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: theme.palette.text.primary }}>{worker.role}</TableCell>
                        <TableCell sx={{ color: theme.palette.text.primary }}>{worker.zone}</TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={worker.compliant ? 'OK' : 'Not OK'}
                            color={worker.compliant ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/workers?workerId=${worker.id}`);
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Worker Details - inside the same Paper */}
            <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <WorkerDetails worker={selectedWorker} />
            </Box>
          </Paper>
        </Grid>

        {/* Alerts Panel - Right side */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Alert Header with counts */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
                Alerts
              </Typography>
              {alertCounts.total > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {alertCounts.critical > 0 && (
                    <Chip
                      size="small"
                      label={`${alertCounts.critical} Critical`}
                      sx={{ 
                        bgcolor: theme.palette.error.main,
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '0.625rem',
                        height: 20,
                      }}
                    />
                  )}
                  {alertCounts.high > 0 && (
                    <Chip
                      size="small"
                      label={`${alertCounts.high} High`}
                      sx={{ 
                        bgcolor: theme.palette.warning.main,
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '0.625rem',
                        height: 20,
                      }}
                    />
                  )}
                  {alertCounts.medium > 0 && (
                    <Chip
                      size="small"
                      label={`${alertCounts.medium} Medium`}
                      sx={{ 
                        bgcolor: theme.palette.info.main,
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '0.625rem',
                        height: 20,
                      }}
                    />
                  )}
                  {alertCounts.low > 0 && (
                    <Chip
                      size="small"
                      label={`${alertCounts.low} Low`}
                      sx={{ 
                        bgcolor: theme.palette.success.main,
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '0.625rem',
                        height: 20,
                      }}
                    />
                  )}
                </Box>
              )}
            </Box>

            {/* Alert Filters */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={alertFilterSeverity}
                  label="Severity"
                  onChange={(e: SelectChangeEvent) => setAlertFilterSeverity(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
                <InputLabel>Worker</InputLabel>
                <Select
                  value={alertFilterWorker}
                  label="Worker"
                  onChange={(e: SelectChangeEvent) => setAlertFilterWorker(e.target.value)}
                >
                  <MenuItem value="all">All Workers</MenuItem>
                  {data.workers.map((worker) => (
                    <MenuItem key={worker.id} value={worker.id}>
                      {worker.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Alert List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {filteredAlerts.slice(0, 6).map((alert) => (
                <Paper
                  key={alert.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    mb: 1.5,
                    borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4],
                      borderLeftWidth: '6px',
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                      {alert.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {alert.time} • {alert.workerId}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip
                      size="small"
                      label={getSeverityLabel(alert.severity)}
                      sx={{
                        bgcolor: getSeverityColor(alert.severity) + '20',
                        color: getSeverityColor(alert.severity),
                        fontSize: '0.625rem',
                        height: 20,
                      }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAcknowledgeAlert(alert.id);
                      }}
                      sx={{
                        fontSize: '0.625rem',
                        minWidth: 40,
                        height: 24,
                        color: theme.palette.text.primary,
                        borderColor: theme.palette.divider,
                        '&:hover': {
                          borderColor: theme.palette.text.primary,
                        },
                      }}
                    >
                      Ack
                    </Button>
                  </Box>
                </Paper>
              ))}

              {filteredAlerts.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No alerts match the selected filters
                </Typography>
              )}

              {filteredAlerts.length > 6 && (
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    mt: 1,
                    color: theme.palette.text.primary,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  View all {filteredAlerts.length} alerts
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
        </React.Fragment>
      )}
    </Box>
  );
};

export default Dashboard;