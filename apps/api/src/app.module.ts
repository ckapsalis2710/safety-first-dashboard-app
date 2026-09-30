import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { WorkersModule } from './workers/workers.module';
import { AlertsModule } from './alerts/alerts.module';
import { IncidentsModule } from './incidents/incidents.module';
import { StatsModule } from './stats/stats.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    DatabaseModule,
    WorkersModule,
    AlertsModule,
    IncidentsModule,
    StatsModule,
    HealthModule,
  ],
})
export class AppModule {}
