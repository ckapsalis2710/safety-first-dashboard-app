import { Inject, Injectable } from '@nestjs/common';
import type { Incident } from '@safety-first/shared';
import { DRIZZLE, type DrizzleDB } from '../database/database.module';
import { incidents, type IncidentRow } from '../database/schema';

function toIncident(row: IncidentRow): Incident {
  return {
    date: row.date,
    workerId: row.workerId,
    role: row.role,
    type: row.type,
    severity: row.severity as Incident['severity'],
    conditions: row.conditions,
    description: row.description ?? undefined,
  };
}

@Injectable()
export class IncidentsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(): Promise<Incident[]> {
    const rows = await this.db.select().from(incidents);
    return rows.map(toIncident);
  }
}
