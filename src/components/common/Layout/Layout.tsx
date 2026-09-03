import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Sidebar from './Sidebar';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const drawerWidth = sidebarOpen ? 260 : 72;

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} onToggle={handleToggleSidebar} />

      <Box
        component="main"
        sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          ml: `${drawerWidth}px`,
          transition: theme.transitions.create('margin-left', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;