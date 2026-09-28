import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  useTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { Alert, Worker } from '../../types';

interface AlertsPanelProps {
  alerts: Alert[];
  workers: Worker[];
  onAcknowledgeAlert: (alertId: string) => void;
}

const AlertsPanel = ({
  alerts,
  workers,
  onAcknowledgeAlert,
}: AlertsPanelProps) => {
  const theme = useTheme();

  const [alertFilterSeverity, setAlertFilterSeverity] =
    useState<string>('all');

  const [alertFilterWorker, setAlertFilterWorker] =
    useState<string>('all');

  const filteredAlerts = useMemo(() => {
    let filtered = alerts.filter((alert) => !alert.acknowledged);

    if (alertFilterSeverity !== 'all') {
      filtered = filtered.filter(
        (alert) => alert.severity === alertFilterSeverity
      );
    }

    if (alertFilterWorker !== 'all') {
      filtered = filtered.filter(
        (alert) => alert.workerId === alertFilterWorker
      );
    }

    return filtered;
  }, [alerts, alertFilterSeverity, alertFilterWorker]);

  const alertCounts = useMemo(() => {
    const active = alerts.filter((alert) => !alert.acknowledged);

    return {
      critical: active.filter((alert) => alert.severity === 'critical').length,
      high: active.filter((alert) => alert.severity === 'high').length,
      medium: active.filter((alert) => alert.severity === 'medium').length,
      low: active.filter((alert) => alert.severity === 'low').length,
      total: active.length,
    };
  }, [alerts]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return theme.palette.error.main;
      case 'high':
        return theme.palette.warning.main;
      case 'medium':
        return theme.palette.info.main;
      default:
        return theme.palette.success.main;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'Critical';
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      default:
        return 'Low';
    }
  };

  return (
    <Grid size={{ xs: 12, md: 4 }}>
      <Paper
        sx={{
          p: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Alert Header with counts */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: theme.palette.text.primary }}
          >
            Alerts
          </Typography>

          {alertCounts.total > 0 && (
            <Box
              sx={{
                display: 'flex',
                gap: 0.5,
                flexWrap: 'wrap',
              }}
            >
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
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 2,
            flexWrap: 'wrap',
          }}
        >
          <FormControl
            size="small"
            sx={{ minWidth: 120, flex: 1 }}
          >
            <InputLabel>Severity</InputLabel>

            <Select
              value={alertFilterSeverity}
              label="Severity"
              onChange={(event: SelectChangeEvent) =>
                setAlertFilterSeverity(event.target.value)
              }
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{ minWidth: 120, flex: 1 }}
          >
            <InputLabel>Worker</InputLabel>

            <Select
              value={alertFilterWorker}
              label="Worker"
              onChange={(event: SelectChangeEvent) =>
                setAlertFilterWorker(event.target.value)
              }
            >
              <MenuItem value="all">All Workers</MenuItem>

              {workers.map((worker) => (
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
                borderLeft: `4px solid ${getSeverityColor(
                  alert.severity
                )}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition:
                  'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                cursor: 'pointer',

                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                  borderLeftWidth: '6px',
                },
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                  }}
                >
                  {alert.message}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {alert.time} • {alert.workerId}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Chip
                  size="small"
                  label={getSeverityLabel(alert.severity)}
                  sx={{
                    bgcolor:
                      getSeverityColor(alert.severity) + '20',
                    color: getSeverityColor(alert.severity),
                    fontSize: '0.625rem',
                    height: 20,
                  }}
                />

                <Button
                  size="small"
                  variant="outlined"
                  onClick={(event) => {
                    event.stopPropagation();
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
            <Typography
              color="text.secondary"
              sx={{
                textAlign: 'center',
                py: 2,
              }}
            >
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

                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              View all {filteredAlerts.length} alerts
            </Typography>
          )}
        </Box>
      </Paper>
    </Grid>
  );
};

export default AlertsPanel;