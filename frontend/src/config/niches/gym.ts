import { NicheConfig } from './types';

export const gymConfig: NicheConfig = {
  id: 'GYM',
  displayName: 'Gym',
  icon: 'barbell', // e.g. Ionicons name
  terminology: {
    member: 'Member',
    members: 'Members',
    resource: 'Locker',
    resources: 'Lockers',
    businessName: 'Gym Name',
    batch: 'Batch',
  },
  features: {
    hasResources: false,
    hasBatches: false,
  },
};
