import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { Worker } from '@safety-first/shared';
import { DRIZZLE, type DrizzleDB } from '../database/database.module';
import { workers, type WorkerRow } from '../database/schema';

function toWorker(row: WorkerRow): Worker {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    site: row.site,
    zone: row.zone,
    ppe: row.ppe,
    compliant: row.compliant,
    heartRate: row.heartRate,
    fatigue: row.fatigue as Worker['fatigue'],
    battery: row.battery,
    connected: row.connected,
    complianceScore: row.complianceScore,
    shift: row.shift as Worker['shift'],
    experience: row.experience,
    incidentsCount: row.incidentsCount,
    lastIncident: row.lastIncident ?? undefined,
    weeklyCompliance: row.weeklyCompliance,
    hourlyHeartRate: row.hourlyHeartRate,
    avatar: row.avatar ?? undefined,
  };
}

@Injectable()
export class WorkersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(): Promise<Worker[]> {
    const rows = await this.db.select().from(workers);
    return rows.map(toWorker);
  }

  async findOne(id: string): Promise<Worker> {
    const [row] = await this.db.select().from(workers).where(eq(workers.id, id));
    if (!row) {
      throw new NotFoundException(`Worker ${id} not found`);
    }
    return toWorker(row);
  }
}
