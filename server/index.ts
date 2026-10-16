import { createApp } from './app.ts';
import { alertSeed } from './alertSeed.ts';

const port = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error('PORT must be an integer between 0 and 65535.');
}

const app = createApp(alertSeed);
const server = app.listen(port, () => {
  const address = server.address();
  if (address && typeof address !== 'string') {
    console.log(`Alerts API listening at http://localhost:${address.port}`);
  }
});

server.on('error', (error) => {
  console.error('Unable to start Alerts API:', error);
  process.exitCode = 1;
});
