import { NicheConfig } from './types';

export const tuitionConfig: NicheConfig = {
  id: 'TUITION',
  displayName: 'Tuition Center',
  icon: 'easel', // e.g. Ionicons name
  terminology: {
    member: 'Student',
    members: 'Students',
    resource: 'Desk',
    resources: 'Desks',
    businessName: 'Tuition Name',
    batch: 'Batch',
  },
  features: {
    hasResources: false,
    hasBatches: true,
  },
};
