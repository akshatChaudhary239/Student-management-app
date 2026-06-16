import { NicheConfig } from './types';

export const coachingConfig: NicheConfig = {
  id: 'COACHING',
  displayName: 'Coaching Center',
  icon: 'school', // e.g. Ionicons name
  terminology: {
    member: 'Student',
    members: 'Students',
    resource: 'Desk',
    resources: 'Desks',
    businessName: 'Center Name',
    batch: 'Batch',
  },
  features: {
    hasResources: false,
    hasBatches: true,
  },
};
