import { workers, alerts, incidents, robotData, roleStats, siteStats } from './mockData';
import type { DashboardData, DashboardStats } from '../types';

export const getDashboardData = (): DashboardData => {
  const totalWorkers = workers.length;
  const compliantWorkers = workers.filter(w => w.compliant).length;
  const activeAlerts = alerts.filter(a => !a.acknowledged).length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;

  const workersBySite = workers.reduce((acc, w) => {
    acc[w.site] = (acc[w.site] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const alertsBySeverity = alerts.reduce((acc, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Compliance trend for the last 7 days (average across all workers)
  const complianceTrend = workers.reduce((acc, w) => {
    w.weeklyCompliance.forEach((val, idx) => {
      acc[idx] = (acc[idx] || 0) + val;
    });
    return acc;
  }, [] as number[]).map(sum => Math.round(sum / workers.length));

  const stats: DashboardStats = {
    totalWorkers,
    complianceRate: Math.round((compliantWorkers / totalWorkers) * 100),
    activeAlerts,
    criticalAlerts,
    workersBySite,
    alertsBySeverity,
    complianceTrend,
  };

  return {
    workers,
    alerts,
    incidents,
    stats,
  };
};

// Helper to get worker by ID
export const getWorkerById = (id: string) => {
  return workers.find(w => w.id === id);
};

// Helper to get alerts for a specific worker
export const getAlertsByWorkerId = (workerId: string) => {
  return alerts.filter(a => a.workerId === workerId);
};

// Helper to get incidents for a specific worker
export const getIncidentsByWorkerId = (workerId: string) => {
  return incidents.filter(i => i.workerId === workerId);
};

// Helper to get site statistics
export const getSiteStats = () => siteStats;

// Helper to get role statistics
export const getRoleStats = () => roleStats;

export const allData = {
  workers,
  alerts,
  incidents,
  robotData,
  roleStats,
  siteStats,
};