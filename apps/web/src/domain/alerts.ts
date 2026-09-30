import type { Alert } from '../types';

export const getAlertCounts = (alerts: Alert[]) => {
  const active = alerts.filter((alert) => !alert.acknowledged);

  return {
    critical: active.filter((alert) => alert.severity === 'critical').length,
    high: active.filter((alert) => alert.severity === 'high').length,
    medium: active.filter((alert) => alert.severity === 'medium').length,
    low: active.filter((alert) => alert.severity === 'low').length,
    total: active.length,
  };
};