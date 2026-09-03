import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Divider,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  People,
  Assessment,
  Business,
  SmartToy,
  Warning,
  Lightbulb,
  Security,
  MenuOpen,
  Menu,
} from '@mui/icons-material';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: Dashboard },
  { path: '/workers', label: 'Workers', icon: People },
  { path: '/roles', label: 'Role Analysis', icon: Assessment },
  { path: '/sites', label: 'Sites', icon: Business },
  { path: '/incidents', label: 'Incidents', icon: Warning },
  { path: '/robot', label: 'Robot Unitree', icon: SmartToy },
  { path: '/recommendations', label: 'Recommendations', icon: Lightbulb },
];

const Sidebar = ({ open, onToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const drawerWidth = 260;
  const collapsedWidth = 72;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedWidth,
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1200,
          whiteSpace: 'nowrap',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          p: 2,
          minHeight: 72,
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
          <Security
            sx={{
              color: theme.palette.text.primary,
              fontSize: 28,
              flexShrink: 0,
            }}
          />
          {open && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                whiteSpace: 'nowrap',
                transition: 'opacity 0.2s',
              }}
            >
              SafetyFirst
            </Typography>
          )}
        </Box>

        {/* Toggle button - next to logo when open */}
        {open && (
          <IconButton onClick={onToggle} size="small">
            <MenuOpen />
          </IconButton>
        )}
      </Box>

      {/* Toggle button - below logo when closed */}
      {!open && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 1,
            flexShrink: 0,
          }}
        >
          <IconButton onClick={onToggle} size="small">
            <Menu />
          </IconButton>
        </Box>
      )}

      {!open && <Divider />}

      {/* Navigation Items */}
      <List sx={{ flex: 1, px: 1, py: 2, overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip
                title={!open ? item.label : ''}
                placement="right"
                arrow
                disableHoverListener={open}
              >
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: open ? 2.5 : 1.5,
                    backgroundColor: isActive
                      ? theme.palette.error.main + '15'
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: isActive
                        ? theme.palette.error.main + '25'
                        : theme.palette.action.hover,
                    },
                    '& .MuiListItemIcon-root': {
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: isActive
                        ? theme.palette.error.main
                        : theme.palette.text.secondary,
                    },
                  }}
                >
                  <ListItemIcon>
                    <Icon />
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={item.label}
                      sx={{
                        '& .MuiTypography-root': {
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? theme.palette.error.main : theme.palette.text.primary,
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center', flexShrink: 0 }}>
        {open ? (
          <Box>
            <Typography
              variant="caption"
              color="success.main"
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
            >
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4CAF50' }} />
              System Online
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              v2.4.1
            </Typography>
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">
            v2.4
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;