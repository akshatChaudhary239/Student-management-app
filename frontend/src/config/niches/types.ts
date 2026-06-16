export type NicheType = 'LIBRARY' | 'GYM' | 'COACHING' | 'TUITION' | 'DANCE' | 'YOGA' | 'TRAINING' | 'STUDY';

export interface NicheTerminology {
  member: string; // e.g. "Student", "Member"
  members: string; // e.g. "Students", "Members"
  resource: string; // e.g. "Seat", "Locker"
  resources: string; // e.g. "Seats", "Lockers"
  businessName: string; // e.g. "Library Name", "Gym Name"
  batch: string; // e.g. "Batch", "Class"
}

export interface NicheConfig {
  id: NicheType;
  displayName: string;
  icon: string;
  terminology: NicheTerminology;
  features: {
    hasResources: boolean; // Does this niche track physical resources like seats/lockers?
    hasBatches: boolean; // Does this niche track batches/classes?
  };
}
