import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test, type TestContext } from 'node:test';
import type { AlertDto } from '../shared/alerts.js';
import { createApp } from './app.ts';
import { alertSeed } from './alertSeed.ts';

const startServer = async (t: TestContext, initialAlerts: AlertDto[]) => {
  const server = createApp(initialAlerts).listen(0, '127.0.0.1');
  t.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  return `http://127.0.0.1:${address.port}`;
};

const getAlerts = async (baseUrl: string) => {
  const response = await fetch(`${baseUrl}/api/alerts`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  return (await response.json() as { alerts: AlertDto[] }).alerts;
};

const acknowledge = (baseUrl: string, id: string) =>
  fetch(`${baseUrl}/api/alerts/${encodeURIComponent(id)}/acknowledge`, { method: 'PATCH' });

test('GET returns all alerts newest-first, with an ascending ID tie-breaker', async (t) => {
  const initial: AlertDto[] = [
    { ...alertSeed[0], id: 'tie-b', timestamp: '2026-07-14T09:00:00Z' },
    { ...alertSeed[1], id: 'oldest', timestamp: '2026-07-14T08:00:00Z' },
    { ...alertSeed[2], id: 'tie-a', timestamp: '2026-07-14T09:00:00.000Z' },
    { ...alertSeed[3], id: 'newest', timestamp: '2026-07-14T10:00:00Z' },
  ];
  const baseUrl = await startServer(t, initial);
  assert.deepEqual(await getAlerts(baseUrl), [initial[3], initial[2], initial[0], initial[1]]);
  assert.equal(initial[2].acknowledged, true);
});

test('GET returns an empty collection', async (t) => {
  const baseUrl = await startServer(t, []);
  assert.deepEqual(await getAlerts(baseUrl), []);
});

test('PATCH changes only the matching acknowledgement and subsequent GET reflects it', async (t) => {
  const initial = structuredClone(alertSeed);
  const baseUrl = await startServer(t, initial);
  const before = await getAlerts(baseUrl);
  const target = initial[0];
  const response = await acknowledge(baseUrl, target.id);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { alert: { ...target, acknowledged: true } });
  assert.deepEqual(await getAlerts(baseUrl), before.map((alert) =>
    alert.id === target.id ? { ...alert, acknowledged: true } : alert
  ));
});

test('PATCH is idempotent for new and already acknowledged records', async (t) => {
  const baseUrl = await startServer(t, structuredClone(alertSeed));
  for (const target of [alertSeed[0], alertSeed[2]]) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await acknowledge(baseUrl, target.id);
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { alert: { ...target, acknowledged: true } });
    }
  }
});

test('PATCH returns the documented 404 error for an unknown ID without changing records', async (t) => {
  const baseUrl = await startServer(t, structuredClone(alertSeed));
  const before = await getAlerts(baseUrl);
  const response = await acknowledge(baseUrl, 'unknown-alert');
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  assert.deepEqual(body, {
    error: { code: 'ALERT_NOT_FOUND', message: 'Alert not found.' },
  });
  assert.deepEqual(await getAlerts(baseUrl), before);
});

test('requests never mutate the original seed', async (t) => {
  const original = structuredClone(alertSeed);
  const baseUrl = await startServer(t, alertSeed);
  await getAlerts(baseUrl);
  const response = await acknowledge(baseUrl, alertSeed[0].id);
  assert.equal(response.status, 200);
  await response.json();
  assert.deepEqual(alertSeed, original);
});

test('separate applications do not share acknowledgement state', async (t) => {
  const initial = structuredClone(alertSeed);
  const firstUrl = await startServer(t, initial);
  const secondUrl = await startServer(t, initial);
  const target = initial[0];
  const response = await acknowledge(firstUrl, target.id);
  assert.equal(response.status, 200);
  await response.json();
  assert.equal((await getAlerts(firstUrl)).find((alert) => alert.id === target.id)?.acknowledged, true);
  assert.equal((await getAlerts(secondUrl)).find((alert) => alert.id === target.id)?.acknowledged, false);
  assert.equal(target.acknowledged, false);
});
