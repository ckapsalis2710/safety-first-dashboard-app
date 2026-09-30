import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll() {
    return this.alertsService.findAll();
  }

  @Patch(':id/acknowledge')
  acknowledge(
    @Param('id') id: string,
    @Body() body?: { acknowledgedBy?: string },
  ) {
    return this.alertsService.acknowledge(id, body?.acknowledgedBy ?? 'API');
  }
}
