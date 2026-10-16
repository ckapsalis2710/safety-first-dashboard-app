export interface AlertDto {
  /** Stable opaque identifier; consumers must not infer meaning from its format. */
  id: string;
  workerId: string;
  type: 'proximity' | 'ppe_violation' | 'fatigue' | 'fall' | 'temperature' | 'gas_leak';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  /** Occurrence time as an ISO 8601 UTC timestamp, for example 2026-07-14T09:34:00Z. */
  timestamp: string;
  /** Acknowledgement records receipt of the alert, not resolution of the hazard. */
  acknowledged: boolean;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
