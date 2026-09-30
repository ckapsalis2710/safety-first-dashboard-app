import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../database/schema';
import { workers, alerts, incidents, robotData } from './mock-data';

async function seed() {
  const url =
    process.env.DATABASE_URL ??
    'postgresql://safety:safety@localhost:5432/safety_first';

  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  console.log('Seeding SafetyFirst database...');

  // Clear in FK-safe order
  await db.delete(schema.alerts);
  await db.delete(schema.incidents);
  await db.delete(schema.robots);
  await db.delete(schema.workers);

  await db.insert(schema.workers).values(
    workers.map((w) => ({
      id: w.id,
      name: w.name,
      role: w.role,
      site: w.site,
      zone: w.zone,
      ppe: w.ppe,
      compliant: w.compliant,
      heartRate: w.heartRate,
      fatigue: w.fatigue,
      battery: w.battery,
      connected: w.connected,
      complianceScore: w.complianceScore,
      shift: w.shift,
      experience: w.experience,
      incidentsCount: w.incidentsCount,
      lastIncident: w.lastIncident ?? null,
      weeklyCompliance: w.weeklyCompliance,
      hourlyHeartRate: w.hourlyHeartRate,
      avatar: w.avatar ?? null,
    })),
  );

  await db.insert(schema.alerts).values(
    alerts.map((a) => ({
      id: a.id,
      workerId: a.workerId,
      type: a.type,
      severity: a.severity,
      message: a.message,
      time: a.time,
      timestamp: a.timestamp,
      acknowledged: a.acknowledged,
      acknowledgedBy: a.acknowledgedBy ?? null,
      location: a.location ?? null,
    })),
  );

  await db.insert(schema.incidents).values(
    incidents.map((inc, idx) => ({
      id: `INC-${String(idx + 1).padStart(3, '0')}`,
      date: inc.date,
      workerId: inc.workerId,
      role: inc.role,
      type: inc.type,
      severity: inc.severity,
      conditions: inc.conditions,
      description: inc.description ?? null,
    })),
  );

  await db.insert(schema.robots).values({
    id: 'robot-1',
    model: robotData.model,
    battery: robotData.battery,
    mode: robotData.mode,
    tempC: robotData.tempC,
    gas: robotData.gas,
    detections: robotData.detections,
    route: robotData.route,
    status: robotData.status,
    lastMaintenance: robotData.lastMaintenance,
    uptime: robotData.uptime,
    firmware: robotData.firmware,
  });

  console.log(
    `Seeded ${workers.length} workers, ${alerts.length} alerts, ${incidents.length} incidents, 1 robot.`,
  );

  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
