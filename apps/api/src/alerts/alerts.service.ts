import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { Alert } from '@safety-first/shared';
import { DRIZZLE, type DrizzleDB } from '../database/database.module';
import { alerts, type AlertRow } from '../database/schema';

function toAlert(row: AlertRow): Alert {
  return {
    id: row.id,
    workerId: row.workerId,
    type: row.type as Alert['type'],
    severity: row.severity as Alert['severity'],
    message: row.message,
    time: row.time,
    timestamp: row.timestamp,
    acknowledged: row.acknowledged,
    acknowledgedBy: row.acknowledgedBy ?? undefined,
    location: row.location ?? undefined,
  };
}

@Injectable()
export class AlertsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(): Promise<Alert[]> {
    const rows = await this.db.select().from(alerts);
    return rows.map(toAlert);
  }

  async acknowledge(id: string, acknowledgedBy = 'API'): Promise<Alert> {
    const [existing] = await this.db.select().from(alerts).where(eq(alerts.id, id));
    if (!existing) {
      throw new NotFoundException(`Alert ${id} not found`);
    }

    const [updated] = await this.db
      .update(alerts)
      .set({
        acknowledged: true,
        acknowledgedBy,
      })
      .where(eq(alerts.id, id))
      .returning();

    return toAlert(updated);
  }
}
