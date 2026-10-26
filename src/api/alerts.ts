import type { AlertDto, ApiError } from '../../shared/alerts';
import type { Alert } from '../types';

const alertTypes = [
  'proximity', 'ppe_violation', 'fatigue', 'fall', 'temperature', 'gas_leak',
] as const satisfies readonly AlertDto['type'][];
const severities = ['critical', 'high', 'medium', 'low'] as const satisfies readonly AlertDto['severity'][];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isAlertDto = (value: unknown): value is AlertDto => {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' && value.id.length > 0
    && typeof value.workerId === 'string' && value.workerId.length > 0
    && alertTypes.some((type) => type === value.type)
    && severities.some((severity) => severity === value.severity)
    && typeof value.message === 'string'
    && typeof value.timestamp === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value.timestamp)
    && Number.isFinite(Date.parse(value.timestamp))
    && typeof value.acknowledged === 'boolean';
};

const isApiError = (value: unknown): value is ApiError =>
  isRecord(value) && isRecord(value.error)
  && typeof value.error.code === 'string'
  && typeof value.error.message === 'string' && value.error.message.length > 0;

const displayTime = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
});

// Keep presentation time in the frontend. Optional location and attribution stay absent.
const toAlert = (dto: AlertDto): Alert => ({
  id: dto.id,
  workerId: dto.workerId,
  type: dto.type,
  severity: dto.severity,
  message: dto.message,
  timestamp: dto.timestamp,
  acknowledged: dto.acknowledged,
  time: `${displayTime.format(new Date(dto.timestamp))} UTC`,
});

const requestJson = async (url: string, options: RequestInit, action: string): Promise<unknown> => {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
  } catch (error) {
    // Cancellation is control flow for callers, rather than a connection failure.
    if (options.signal?.aborted) throw error;
    throw new Error(`${action}: unable to reach the Alerts API.`, { cause: error });
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    if (options.signal?.aborted) throw error;
    if (!response.ok) throw new Error(`${action} (HTTP ${response.status}).`, { cause: error });
    throw new Error(`${action}: the Alerts API returned invalid JSON.`, { cause: error });
  }

  if (!response.ok) {
    const message = isApiError(body) ? body.error.message : 'The Alerts API request failed.';
    throw new Error(`${action} (HTTP ${response.status}): ${message}`);
  }
  return body;
};

export const listAlerts = async (signal?: AbortSignal): Promise<Alert[]> => {
  const body = await requestJson('/api/alerts', { signal }, 'Unable to load alerts');
  if (!isRecord(body) || !Array.isArray(body.alerts) || !body.alerts.every(isAlertDto)) {
    throw new Error('Unable to load alerts: the Alerts API returned invalid alert data.');
  }
  return body.alerts.map(toAlert);
};

export const acknowledgeAlert = async (id: string): Promise<Alert> => {
  const body = await requestJson(
    `/api/alerts/${encodeURIComponent(id)}/acknowledge`,
    { method: 'PATCH' },
    'Unable to acknowledge alert',
  );
  if (!isRecord(body) || !isAlertDto(body.alert) || body.alert.id !== id || !body.alert.acknowledged) {
    throw new Error('Unable to acknowledge alert: the Alerts API returned invalid acknowledgement data.');
  }
  return toAlert(body.alert);
};
