import { useState } from 'react';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  Chip,
  IconButton,
  Badge,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Notifications, Check } from '@mui/icons-material';
import type { Alert } from '../../types';

interface NotificationMenuProps {
  alerts: Alert[];
  alertsStatus: 'loading' | 'success' | 'error';
  pendingAlertIds: ReadonlySet<string>;
  onRetryAlerts: () => void;
  onAcknowledge: (alertId: string) => void;
}

const NotificationMenu = ({ alerts, alertsStatus, pendingAlertIds, onRetryAlerts, onAcknowledge }: NotificationMenuProps) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      default: return theme.palette.success.main;
    }
  };

  return (
    <>
      <IconButton onClick={handleClick} size="small" aria-label={alertsStatus === 'loading' ? 'Loading alerts' : alertsStatus === 'error' ? 'Alerts unavailable' : `${unacknowledgedAlerts.length} unacknowledged alerts`}>
        <Badge badgeContent={alertsStatus === 'success' ? unacknowledgedAlerts.length : alertsStatus === 'error' ? '!' : undefined} color="error">
          {alertsStatus === 'loading' ? <CircularProgress size={20} /> : <Notifications />}
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxHeight: 400,
              p: 0,
              mt: 2, // ← Increased margin-top
              ml: 1, // ← Small left margin to align better
            },
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>

        {alertsStatus === 'loading' ? (
          <Box role="status" sx={{ p: 3 }}>
            <Typography color="text.secondary">Loading alerts…</Typography>
          </Box>
        ) : alertsStatus === 'error' ? (
          <Box sx={{ p: 3 }}>
            <Typography color="text.secondary">Alerts could not be loaded.</Typography>
            <Button onClick={onRetryAlerts}>Retry</Button>
          </Box>
        ) : unacknowledgedAlerts.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No new notifications</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {unacknowledgedAlerts.slice(0, 10).map((alert) => (
              <ListItem
                key={alert.id}
                sx={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  alignItems: 'flex-start',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip
                      size="small"
                      label={alert.severity.toUpperCase()}
                      sx={{
                        bgcolor: getSeverityColor(alert.severity) + '20',
                        color: getSeverityColor(alert.severity),
                        fontSize: '0.625rem',
                        height: 20,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {alert.time}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{alert.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {alert.workerId} • {alert.type.replace('_', ' ')}
                  </Typography>
                </Box>
                <IconButton
                  disabled={pendingAlertIds.has(alert.id)}
                  aria-label={`Acknowledge alert: ${alert.message}`}
                  size="small"
                  onClick={() => onAcknowledge(alert.id)}
                  sx={{ mt: 0.5 }}
                >
                  {pendingAlertIds.has(alert.id) ? <CircularProgress size={16} /> : <Check fontSize="small" />}
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};

export default NotificationMenu;
