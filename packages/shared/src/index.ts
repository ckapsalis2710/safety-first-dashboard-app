export interface PPE {
  helmet: boolean;
  vest: boolean;
  gloves: boolean;
  glasses?: boolean;
  shoes?: boolean;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  site: string;
  zone: string;
  ppe: PPE;
  compliant: boolean;
  heartRate: number;
  fatigue: 'low' | 'medium' | 'high';
  battery: number;
  connected: boolean;
  complianceScore: number;
  shift: 'morning' | 'afternoon' | 'night';
  experience: number; // years
  incidentsCount: number;
  lastIncident?: string;
  weeklyCompliance: number[];
  hourlyHeartRate: number[];
  avatar?: string;
}

export interface Alert {
  id: string;
  workerId: string;
  type: 'proximity' | 'ppe_violation' | 'fatigue' | 'fall' | 'temperature' | 'gas_leak';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  time: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  location?: {
    zone: string;
    coordinates: { x: number; y: number };
  };
}

export interface Incident {
  date: string;
  workerId: string;
  role: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  conditions: {
    weather: string;
    tempC: number;
    fatigue: 'low' | 'medium' | 'high';
    ppeOk: boolean;
    shift: string;
    humidity?: number;
    lighting?: string;
  };
  description?: string;
}

export interface Robot {
  model: string;
  battery: number;
  mode: 'patrol' | 'standby' | 'charging' | 'maintenance';
  tempC: number;
  gas: 'normal' | 'warning' | 'critical';
  detections: Detection[];
  route: RoutePoint[];
  status: 'active' | 'inactive' | 'error';
  lastMaintenance: string;
  uptime: string;
  firmware: string;
}

export interface Detection {
  type: 'no_helmet' | 'no_vest' | 'no_gloves' | 'no_glasses' | 'obstacle' | 'fall' | 'unauthorized';
  zone: string;
  time: string;
  image?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
}

export interface RoutePoint {
  zone: string;
  time: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ViolationItem {
  name: string;
  count?: number;
}

export interface RoleStats {
  role: string;
  workers: number;
  complianceRate: number;
  topViolations: (string | ViolationItem)[];
  incidents: number;
  trend: 'up' | 'down' | 'stable';
  monthlyData?: number[];
}

export interface SiteStats {
  site: string;
  workers: number;
  complianceRate: number;
  activeAlerts: number;
  criticalAlerts: number;
  monthlyTrend: number[];
  riskZones: {
    zone: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    incidents: number;
  }[];
}

export interface DashboardStats {
  totalWorkers: number;
  complianceRate: number;
  activeAlerts: number;
  criticalAlerts: number;
  workersBySite: Record<string, number>;
  alertsBySeverity: Record<string, number>;
  complianceTrend: number[];
}

export interface DashboardData {
  workers: Worker[];
  alerts: Alert[];
  incidents: Incident[];
  stats: DashboardStats;
}