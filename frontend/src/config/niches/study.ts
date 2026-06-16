import { NicheConfig } from './types';

export const studyConfig: NicheConfig = {
  id: 'STUDY',
  displayName: 'Study Center',
  icon: 'library', // e.g. Ionicons name
  terminology: {
    member: 'Student',
    members: 'Students',
    resource: 'Seat',
    resources: 'Seats',
    businessName: 'Center Name',
    batch: 'Batch',
  },
  features: {
    hasResources: false,
    hasBatches: true,
  },
};
