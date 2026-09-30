import { Inject, Injectable } from '@nestjs/common';
import type { DashboardStats } from '@safety-first/shared';
import { DRIZZLE, type DrizzleDB } from '../database/database.module';
import { alerts, workers } from '../database/schema';

@Injectable()
export class StatsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const workerRows = await this.db.select().from(workers);
    const alertRows = await this.db.select().from(alerts);

    const totalWorkers = workerRows.length;
    const compliantWorkers = workerRows.filter((w) => w.compliant).length;
    const activeAlerts = alertRows.filter((a) => !a.acknowledged).length;
    const criticalAlerts = alertRows.filter(
      (a) => a.severity === 'critical' && !a.acknowledged,
    ).length;

    const workersBySite = workerRows.reduce(
      (acc, w) => {
        acc[w.site] = (acc[w.site] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const alertsBySeverity = alertRows.reduce(
      (acc, a) => {
        acc[a.severity] = (acc[a.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const complianceTrend =
      totalWorkers === 0
        ? []
        : workerRows
            .reduce((acc, w) => {
              w.weeklyCompliance.forEach((val, idx) => {
                acc[idx] = (acc[idx] || 0) + val;
              });
              return acc;
            }, [] as number[])
            .map((sum) => Math.round(sum / totalWorkers));

    return {
      totalWorkers,
      complianceRate:
        totalWorkers === 0
          ? 0
          : Math.round((compliantWorkers / totalWorkers) * 100),
      activeAlerts,
      criticalAlerts,
      workersBySite,
      alertsBySeverity,
      complianceTrend,
    };
  }
}
