import { NicheConfig } from './types';

export const libraryConfig: NicheConfig = {
  id: 'LIBRARY',
  displayName: 'Library',
  icon: 'book', // e.g. Ionicons name
  terminology: {
    member: 'Student',
    members: 'Students',
    resource: 'Seat',
    resources: 'Seats',
    businessName: 'Library Name',
    batch: 'Batch',
  },
  features: {
    hasResources: true,
    hasBatches: false,
  },
};
