import { NicheConfig } from './types';

export const yogaConfig: NicheConfig = {
  id: 'YOGA',
  displayName: 'Yoga Studio',
  icon: 'body', // e.g. Ionicons name
  terminology: {
    member: 'Member',
    members: 'Members',
    resource: 'Mat',
    resources: 'Mats',
    businessName: 'Studio Name',
    batch: 'Batch',
  },
  features: {
    hasResources: false,
    hasBatches: true,
  },
};
