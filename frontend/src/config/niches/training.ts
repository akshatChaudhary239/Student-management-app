import { NicheConfig } from './types';

export const trainingConfig: NicheConfig = {
  id: 'TRAINING',
  displayName: 'Training Institute',
  icon: 'laptop', // e.g. Ionicons name
  terminology: {
    member: 'Trainee',
    members: 'Trainees',
    resource: 'PC',
    resources: 'PCs',
    businessName: 'Institute Name',
    batch: 'Batch',
  },
  features: {
    hasResources: false,
    hasBatches: true,
  },
};
