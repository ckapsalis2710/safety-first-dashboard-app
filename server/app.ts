import express, { type ErrorRequestHandler } from 'express';
import type { AlertDto, ApiError } from '../shared/alerts.js';

export const createApp = (initialAlerts: readonly AlertDto[]) => {
  const app = express();
  const alerts: AlertDto[] = structuredClone([...initialAlerts]);

  app.disable('x-powered-by');
  app.disable('etag');
  app.use('/api', (_request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.get('/api/alerts', (_request, response) => {
    const orderedAlerts = [...alerts].sort((a, b) => {
      const timeDifference = Date.parse(b.timestamp) - Date.parse(a.timestamp);
      if (timeDifference !== 0) return timeDifference;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });
    response.json({ alerts: orderedAlerts });
  });

  app.patch('/api/alerts/:id/acknowledge', (request, response) => {
    const alert = alerts.find((item) => item.id === request.params.id);
    if (!alert) {
      response.status(404).json({
        error: { code: 'ALERT_NOT_FOUND', message: 'Alert not found.' },
      } satisfies ApiError);
      return;
    }

    alert.acknowledged = true;
    response.json({ alert });
  });

  const handleError: ErrorRequestHandler = (error, _request, response, next) => {
    console.error(error);
    if (response.headersSent) {
      next(error);
      return;
    }
    response.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected server error occurred.' },
    } satisfies ApiError);
  };
  app.use(handleError);

  return app;
};
