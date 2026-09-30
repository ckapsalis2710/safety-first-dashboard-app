import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import type { PPE } from '@safety-first/shared';

export const workers = pgTable('workers', {
  id: varchar('id', { length: 32 }).primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  site: text('site').notNull(),
  zone: text('zone').notNull(),
  ppe: jsonb('ppe').$type<PPE>().notNull(),
  compliant: boolean('compliant').notNull(),
  heartRate: integer('heart_rate').notNull(),
  fatigue: varchar('fatigue', { length: 16 }).notNull(),
  battery: integer('battery').notNull(),
  connected: boolean('connected').notNull(),
  complianceScore: integer('compliance_score').notNull(),
  shift: varchar('shift', { length: 16 }).notNull(),
  experience: integer('experience').notNull(),
  incidentsCount: integer('incidents_count').notNull().default(0),
  lastIncident: varchar('last_incident', { length: 32 }),
  weeklyCompliance: jsonb('weekly_compliance').$type<number[]>().notNull(),
  hourlyHeartRate: jsonb('hourly_heart_rate').$type<number[]>().notNull(),
  avatar: text('avatar'),
});

export const alerts = pgTable('alerts', {
  id: varchar('id', { length: 32 }).primaryKey(),
  workerId: varchar('worker_id', { length: 32 })
    .notNull()
    .references(() => workers.id),
  type: varchar('type', { length: 32 }).notNull(),
  severity: varchar('severity', { length: 16 }).notNull(),
  message: text('message').notNull(),
  time: varchar('time', { length: 16 }).notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true, mode: 'string' }).notNull(),
  acknowledged: boolean('acknowledged').notNull().default(false),
  acknowledgedBy: text('acknowledged_by'),
  location: jsonb('location').$type<{
    zone: string;
    coordinates: { x: number; y: number };
  }>(),
});

export const incidents = pgTable('incidents', {
  id: varchar('id', { length: 32 }).primaryKey(),
  date: varchar('date', { length: 32 }).notNull(),
  workerId: varchar('worker_id', { length: 32 })
    .notNull()
    .references(() => workers.id),
  role: text('role').notNull(),
  type: text('type').notNull(),
  severity: varchar('severity', { length: 16 }).notNull(),
  conditions: jsonb('conditions')
    .$type<{
      weather: string;
      tempC: number;
      fatigue: 'low' | 'medium' | 'high';
      ppeOk: boolean;
      shift: string;
      humidity?: number;
      lighting?: string;
    }>()
    .notNull(),
  description: text('description'),
});

export const robots = pgTable('robots', {
  id: varchar('id', { length: 32 }).primaryKey().default('robot-1'),
  model: text('model').notNull(),
  battery: integer('battery').notNull(),
  mode: varchar('mode', { length: 32 }).notNull(),
  tempC: real('temp_c').notNull(),
  gas: varchar('gas', { length: 16 }).notNull(),
  detections: jsonb('detections').$type<unknown[]>().notNull(),
  route: jsonb('route').$type<unknown[]>().notNull(),
  status: varchar('status', { length: 16 }).notNull(),
  lastMaintenance: varchar('last_maintenance', { length: 32 }).notNull(),
  uptime: text('uptime').notNull(),
  firmware: text('firmware').notNull(),
});

export type WorkerRow = typeof workers.$inferSelect;
export type AlertRow = typeof alerts.$inferSelect;
export type IncidentRow = typeof incidents.$inferSelect;
export type RobotRow = typeof robots.$inferSelect;
