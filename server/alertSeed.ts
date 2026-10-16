import type { AlertDto } from '../shared/alerts.js';

// Synthetic industrial safety demo records, independent of the frontend fixtures.
// Worker IDs match the existing demo workers; no worker data is imported at runtime.
// Future server instances should copy this seed before changing acknowledgement state.
export const alertSeed: AlertDto[] = [
  {
    id: 'alert-7f2a91c4',
    workerId: 'W-101',
    type: 'ppe_violation',
    severity: 'high',
    message: 'Safety gloves missing during electrical equipment handling',
    timestamp: '2026-07-14T08:15:00Z',
    acknowledged: false,
  },
  {
    id: 'alert-b8d403e1',
    workerId: 'W-103',
    type: 'fatigue',
    severity: 'medium',
    message: 'Elevated fatigue reported during forklift operation; supervisor review requested',
    timestamp: '2026-07-14T08:40:00Z',
    acknowledged: false,
  },
  {
    id: 'alert-2ce670af',
    workerId: 'W-107',
    type: 'fall',
    severity: 'critical',
    message: 'Fall detected near scaffolding; emergency response requested',
    timestamp: '2026-07-14T09:05:00Z',
    acknowledged: true,
  },
  {
    id: 'alert-91a5f30d',
    workerId: 'W-109',
    type: 'proximity',
    severity: 'low',
    message: 'Worker approaching a marked vehicle exclusion zone',
    timestamp: '2026-07-14T09:20:00Z',
    acknowledged: false,
  },
  {
    id: 'alert-4db182c9',
    workerId: 'W-105',
    type: 'gas_leak',
    severity: 'critical',
    message: 'Gas alarm near the welding area; evacuation requested',
    timestamp: '2026-07-14T09:35:00Z',
    acknowledged: false,
  },
  {
    id: 'alert-e0637ab2',
    workerId: 'W-108',
    type: 'temperature',
    severity: 'medium',
    message: 'High ambient temperature reported in the equipment inspection area',
    timestamp: '2026-07-14T09:50:00Z',
    acknowledged: true,
  },
];
