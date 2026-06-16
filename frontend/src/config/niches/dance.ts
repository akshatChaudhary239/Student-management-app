import { NicheConfig } from './types';

export const danceConfig: NicheConfig = {
  id: 'DANCE',
  displayName: 'Dance Academy',
  icon: 'musical-notes', // e.g. Ionicons name
  terminology: {
    member: 'Student',
    members: 'Students',
    resource: 'Spot',
    resources: 'Spots',
    businessName: 'Academy Name',
    batch: 'Batch',
  },
  features: {
    hasResources: false,
    hasBatches: true,
  },
};
