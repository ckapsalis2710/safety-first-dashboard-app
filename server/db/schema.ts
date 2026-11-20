import { sql } from 'drizzle-orm';
import { boolean, check, date, doublePrecision, index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import type { AlertDto } from '../../shared/alerts.js';

const alertTypes = ['proximity', 'ppe_violation', 'fatigue', 'fall', 'temperature', 'gas_leak'] as const satisfies readonly AlertDto['type'][];
const severities = ['critical', 'high', 'medium', 'low'] as const satisfies readonly AlertDto['severity'][];

export const sites = pgTable('sites', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  timeZone: text('time_zone').notNull().default('UTC'),
});

export const workers = pgTable('workers', {
  id: text('id').primaryKey(),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  name: text('name').notNull(),
  role: text('role').notNull(),
  zoneLabel: text('zone_label'),
}, (t) => [index('workers_site_idx').on(t.siteId)]);

export const sources = pgTable('sources', {
  id: uuid('id').defaultRandom().primaryKey(),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  workerId: text('worker_id').references(() => workers.id),
  name: text('name').notNull(),
  kind: text('kind', { enum: ['wearable', 'environment', 'robot'] }).notNull(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true, precision: 3 }),
}, (t) => [
  check('sources_kind_check', sql`${t.kind} in ('wearable', 'environment', 'robot')`),
  check('sources_worker_wearable_check', sql`${t.workerId} is null or ${t.kind} = 'wearable'`),
  uniqueIndex('sources_assigned_worker_uidx').on(t.workerId).where(sql`${t.workerId} is not null`),
  index('sources_site_idx').on(t.siteId),
]);

// Event site IDs record where events happened, independent of current assignments.
export const alerts = pgTable('alerts', {
  id: text('id').primaryKey(),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  workerId: text('worker_id').references(() => workers.id),
  sourceId: uuid('source_id').references(() => sources.id),
  type: text('type', { enum: alertTypes }).notNull(),
  severity: text('severity', { enum: severities }).notNull(),
  message: text('message').notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true, precision: 3 }).notNull(),
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true, precision: 3 }),
}, (t) => [
  check('alerts_type_check', sql`${t.type} in (${sql.join(alertTypes.map((value) => sql`${value}`.inlineParams()), sql`, `)})`),
  check('alerts_severity_check', sql`${t.severity} in (${sql.join(severities.map((value) => sql`${value}`.inlineParams()), sql`, `)})`),
  check('alerts_message_nonblank_check', sql`${t.message} ~ '[^[:space:]]'`),
  index('alerts_order_idx').on(t.occurredAt.desc(), t.id),
  index('alerts_site_time_idx').on(t.siteId, t.occurredAt.desc()),
]);

export const incidents = pgTable('incidents', {
  id: uuid('id').defaultRandom().primaryKey(),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  workerId: text('worker_id').references(() => workers.id),
  roleAtOccurrence: text('role_at_occurrence'),
  occurredOn: date('occurred_on').notNull(),
  shift: text('shift', { enum: ['morning', 'afternoon', 'night'] }),
  type: text('type').notNull(),
  severity: text('severity', { enum: severities }).notNull(),
  description: text('description'),
  weather: text('weather'),
  temperatureC: doublePrecision('temperature_c'),
  ppeOk: boolean('ppe_ok'),
}, (t) => [
  check('incidents_shift_check', sql`${t.shift} in ('morning', 'afternoon', 'night')`),
  check('incidents_severity_check', sql`${t.severity} in (${sql.join(severities.map((value) => sql`${value}`.inlineParams()), sql`, `)})`),
  check('incidents_role_requires_worker_check', sql`${t.roleAtOccurrence} is null or ${t.workerId} is not null`),
  index('incidents_site_date_idx').on(t.siteId, t.occurredOn.desc()),
  index('incidents_worker_date_idx').on(t.workerId, t.occurredOn.desc()),
]);

export const sensorReadings = pgTable('sensor_readings', {
  id: uuid('id').defaultRandom().primaryKey(),
  sourceId: uuid('source_id').notNull().references(() => sources.id),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  workerId: text('worker_id').references(() => workers.id),
  metric: text('metric', { enum: ['heart_rate_bpm', 'battery_pct', 'ambient_temperature_c', 'co_ppm'] }).notNull(),
  value: doublePrecision('value').notNull(),
  observedAt: timestamp('observed_at', { withTimezone: true, precision: 3 }).notNull(),
}, (t) => [
  check('sensor_readings_finite_check', sql`${t.value} > '-Infinity'::double precision and ${t.value} < 'Infinity'::double precision`),
  check('sensor_readings_metric_range_check', sql`case ${t.metric}
    when 'heart_rate_bpm' then ${t.value} > 0 and ${t.workerId} is not null
    when 'battery_pct' then ${t.value} between 0 and 100
    when 'ambient_temperature_c' then true
    when 'co_ppm' then ${t.value} >= 0
    else false
  end`),
  index('sensor_readings_source_metric_time_idx').on(t.sourceId, t.metric, t.observedAt.desc()),
  index('sensor_readings_worker_metric_time_idx').on(t.workerId, t.metric, t.observedAt.desc()),
]);

export const ppeChecks = pgTable('ppe_checks', {
  id: uuid('id').defaultRandom().primaryKey(),
  workerId: text('worker_id').notNull().references(() => workers.id),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  checkedAt: timestamp('checked_at', { withTimezone: true, precision: 3 }).notNull(),
  helmet: boolean('helmet'),
  vest: boolean('vest'),
  gloves: boolean('gloves'),
  glasses: boolean('glasses'),
  shoes: boolean('shoes'),
}, (t) => [
  check('ppe_checks_observed_item_check', sql`num_nonnulls(${t.helmet}, ${t.vest}, ${t.gloves}, ${t.glasses}, ${t.shoes}) > 0`),
  index('ppe_checks_worker_time_idx').on(t.workerId, t.checkedAt.desc()),
  index('ppe_checks_site_time_idx').on(t.siteId, t.checkedAt.desc()),
]);
