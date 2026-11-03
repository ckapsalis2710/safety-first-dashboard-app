import { useEffect, useState, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Alert as ErrorAlert, Box, Button } from '@mui/material';
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
import { acknowledgeAlert, listAlerts } from './api/alerts';
import type { Alert } from './types';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsStatus, setAlertsStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  // State holds a snapshot for rendering pending indicators in both alert views.
  const [pendingAlertIds, setPendingAlertIds] = useState<ReadonlySet<string>>(() => new Set());
  const [acknowledgementErrors, setAcknowledgementErrors] = useState<Record<string, string>>({});
  // The mutable ref provides synchronous duplicate protection before React renders that snapshot.
  const pendingRequests = useRef(new Set<string>());
  const requestScope = useRef<object | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const inFlight = pendingRequests.current;
    // Every effect setup gets a unique object identity token, including StrictMode's repeated setup.
    const scope = {};
    requestScope.current = scope;

    listAlerts(controller.signal).then((loadedAlerts) => {
      if (controller.signal.aborted) return;
      setAlerts(loadedAlerts);
      setAlertsStatus('success');
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      setLoadError(error instanceof Error ? error.message : 'Unable to load alerts. Please retry.');
      setAlertsStatus('error');
    });

    return () => {
      // Abort the obsolete GET; its signal checks also prevent late results from updating state.
      controller.abort();
      // Invalidate this lifecycle's token so its PATCH handlers ignore late responses.
      if (requestScope.current === scope) requestScope.current = null;
      // This clears bookkeeping only; PATCH requests already received by the backend are not cancelled.
      inFlight.clear();
    };
  }, [loadAttempt]);

  const retryAlertLoad = () => {
    setAlertsStatus('loading');
    setLoadError('');
    setLoadAttempt((previous) => previous + 1);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleAcknowledge = async (alertId: string) => {
    // Capture the active identity token before awaiting; only this same lifecycle may apply the response.
    const scope = requestScope.current;
    if (!scope || alertsStatus !== 'success' || pendingRequests.current.has(alertId)) return;
    if (!alerts.some((alert) => alert.id === alertId && !alert.acknowledged)) return;

    pendingRequests.current.add(alertId);
    setPendingAlertIds(new Set(pendingRequests.current));
    setAcknowledgementErrors((previous) => {
      const next = { ...previous };
      delete next[alertId];
      return next;
    });

    try {
      // Pessimistic update: keep the existing alert until the backend confirms acknowledgement.
      const updatedAlert = await acknowledgeAlert(alertId);
      if (requestScope.current !== scope) return;
      // Apply to the latest state so concurrent acknowledgements of other alerts are preserved.
      setAlerts((previous) => previous.map((alert) => alert.id === alertId ? updatedAlert : alert));
    } catch (error) {
      if (requestScope.current !== scope) return;
      setAcknowledgementErrors((previous) => ({
        ...previous,
        [alertId]: error instanceof Error ? error.message : 'Unable to acknowledge alert. Please retry.',
      }));
    } finally {
      // An obsolete handler must not release a newer lifecycle's pending-request protection for this alert.
      if (requestScope.current === scope) {
        pendingRequests.current.delete(alertId);
        setPendingAlertIds(new Set(pendingRequests.current));
      }
    }
  };

  const currentTheme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );

  const notificationMenu = (
    <NotificationMenu
      alerts={alerts}
      alertsStatus={alertsStatus}
      pendingAlertIds={pendingAlertIds}
      onRetryAlerts={retryAlertLoad}
      onAcknowledge={handleAcknowledge}
    />
  );

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route 
              index 
              element={<Dashboard toggleTheme={toggleTheme} isDarkMode={isDarkMode} notificationMenu={notificationMenu} alerts={alerts} alertsStatus={alertsStatus} pendingAlertIds={pendingAlertIds} onRetryAlerts={retryAlertLoad} onAcknowledgeAlert={handleAcknowledge} />}
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
      <Box sx={{ position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: (theme) => theme.zIndex.snackbar, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {alertsStatus === 'error' && (
          <ErrorAlert severity="error" action={<Button color="inherit" onClick={retryAlertLoad}>Retry</Button>}>
            {loadError}
          </ErrorAlert>
        )}
        {Object.entries(acknowledgementErrors).map(([alertId, message]) => (
          <ErrorAlert key={alertId} severity="error" action={
            <Button color="inherit" disabled={pendingAlertIds.has(alertId)} onClick={() => void handleAcknowledge(alertId)}>Retry</Button>
          }>
            {alerts.find((alert) => alert.id === alertId)?.message}: {message}
          </ErrorAlert>
        ))}
      </Box>
    </ThemeProvider>
  );
}

export default App;
