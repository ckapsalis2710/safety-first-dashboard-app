import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import {
  People,
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import WorkersSection from '../components/dashboard/WorkersSection';
import { DashboardSkeleton } from '../components/skeletons/DashboardSkeleton';
import { getDashboardData } from '../data/enrichedData';
import { useSimulatedLoading } from '../hooks/useSimulatedLoading';
import type { ReactNode } from 'react';
import { getAlertCounts } from '../domain/alerts';

interface DashboardProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
  notificationMenu?: ReactNode;
  alerts: import('../types').Alert[];
  alertsStatus: 'loading' | 'success' | 'error';
  pendingAlertIds: ReadonlySet<string>;
  onRetryAlerts: () => void;
  onAcknowledgeAlert: (alertId: string) => void;
}

const Dashboard = ({ toggleTheme, isDarkMode, notificationMenu, alerts, alertsStatus, pendingAlertIds, onRetryAlerts, onAcknowledgeAlert }: DashboardProps) => {
  const theme = useTheme();
  const data = getDashboardData();
  const loading = useSimulatedLoading(700);

  // Alert counts by severity
  const alertCounts = getAlertCounts(alerts);

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
      value: alertsStatus === 'success' ? alertCounts.total : '—',
      helperText: alertsStatus === 'loading' ? 'Loading alerts…' : alertsStatus === 'error' ? 'Alerts unavailable' : undefined,
      icon: Warning,
      color: theme.palette.warning.main,
    },
    {
      label: 'Critical',
      value: alertsStatus === 'success' ? alertCounts.critical : '—',
      helperText: alertsStatus === 'loading' ? 'Loading alerts…' : alertsStatus === 'error' ? 'Alerts unavailable' : undefined,
      icon: Error,
      color: theme.palette.error.main,
    },
  ];

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
                {kpi.helperText && <Typography variant="caption" color="text.secondary">{kpi.helperText}</Typography>}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Workers Table and Alerts Panel */}
      <Grid container spacing={3}>
        {/* Workers Table with Details inside */}
        <WorkersSection workers={data.workers} />

        {/* Alerts Panel - Right side */}
        <AlertsPanel
          alerts={alerts}
          alertsStatus={alertsStatus}
          pendingAlertIds={pendingAlertIds}
          onRetryAlerts={onRetryAlerts}
          workers={data.workers}
          onAcknowledgeAlert={onAcknowledgeAlert}
        />
      </Grid>
        </React.Fragment>
      )}
    </Box>
  );
};

export default Dashboard;
