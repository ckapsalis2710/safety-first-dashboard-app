import { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from './theme/theme';

import Layout from './components/common/Layout/Layout';
import Dashboard from './pages/Dashboard';
import WorkerHistoryPage from './pages/WorkerHistoryPage';
import RoleAnalysisPage from './pages/RoleAnalysisPage';
import SitesPage from './pages/SitesPage';
import RobotPage from './pages/RobotPage';
import IncidentsPage from './pages/IncidentsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import NotificationMenu from './components/common/NotificationMenu';
import { getDashboardData } from './data/enrichedData';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const data = getDashboardData();
  const [alerts, setAlerts] = useState(data.alerts);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleAcknowledge = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const currentTheme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );

  const notificationMenu = (
    <NotificationMenu alerts={alerts} onAcknowledge={handleAcknowledge} />
  );

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route 
              index 
              element={<Dashboard toggleTheme={toggleTheme} isDarkMode={isDarkMode} notificationMenu={notificationMenu} alerts={alerts} onAcknowledgeAlert={handleAcknowledge} />} 
            />
            <Route 
              path="workers" 
              element={<WorkerHistoryPage toggleTheme={toggleTheme} isDarkMode={isDarkMode} notificationMenu={notificationMenu} />} 
            />
            <Route 
              path="roles" 
              element={<RoleAnalysisPage toggleTheme={toggleTheme} isDarkMode={isDarkMode} notificationMenu={notificationMenu} />} 
            />
            <Route 
              path="sites" 
              element={<SitesPage toggleTheme={toggleTheme} isDarkMode={isDarkMode} notificationMenu={notificationMenu} />} 
            />
            <Route 
              path="incidents" 
              element={<IncidentsPage toggleTheme={toggleTheme} isDarkMode={isDarkMode} notificationMenu={notificationMenu} />} 
            />
            <Route 
              path="robot" 
              element={<RobotPage toggleTheme={toggleTheme} isDarkMode={isDarkMode} notificationMenu={notificationMenu} />} 
            />
            <Route 
              path="recommendations" 
              element={<RecommendationsPage toggleTheme={toggleTheme} isDarkMode={isDarkMode} notificationMenu={notificationMenu} />} 
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;