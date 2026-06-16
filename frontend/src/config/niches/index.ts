import { libraryConfig } from './library';
import { gymConfig } from './gym';
import { coachingConfig } from './coaching';
import { tuitionConfig } from './tuition';
import { danceConfig } from './dance';
import { yogaConfig } from './yoga';
import { trainingConfig } from './training';
import { studyConfig } from './study';
import { NicheType, NicheConfig } from './types';

export * from './types';

export const niches: Record<NicheType, NicheConfig> = {
  LIBRARY: libraryConfig,
  GYM: gymConfig,
  COACHING: coachingConfig,
  TUITION: tuitionConfig,
  DANCE: danceConfig,
  YOGA: yogaConfig,
  TRAINING: trainingConfig,
  STUDY: studyConfig,
};

export const getNicheConfig = (type: NicheType): NicheConfig => {
  return niches[type] || libraryConfig;
};

// Export individual configs for direct access if needed
export {
  libraryConfig,
  gymConfig,
  coachingConfig,
  tuitionConfig,
  danceConfig,
  yogaConfig,
  trainingConfig,
  studyConfig,
};
