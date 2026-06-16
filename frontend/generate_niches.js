const fs = require('fs');

const configs = {
  coaching: {
    id: 'COACHING',
    displayName: 'Coaching Center',
    icon: 'school',
    terminology: {
      member: 'Student',
      members: 'Students',
      resource: 'Seat',
      resources: 'Seats',
      businessName: 'Institute Name'
    },
    features: {
      hasResources: false
    }
  },
  tuition: {
    id: 'TUITION',
    displayName: 'Tuition Center',
    icon: 'book-outline',
    terminology: {
      member: 'Student',
      members: 'Students',
      resource: 'Desk',
      resources: 'Desks',
      businessName: 'Center Name'
    },
    features: {
      hasResources: false
    }
  },
  dance: {
    id: 'DANCE',
    displayName: 'Dance Academy',
    icon: 'musical-notes',
    terminology: {
      member: 'Student',
      members: 'Students',
      resource: 'Spot',
      resources: 'Spots',
      businessName: 'Academy Name'
    },
    features: {
      hasResources: false
    }
  },
  yoga: {
    id: 'YOGA',
    displayName: 'Yoga Studio',
    icon: 'body',
    terminology: {
      member: 'Member',
      members: 'Members',
      resource: 'Mat',
      resources: 'Mats',
      businessName: 'Studio Name'
    },
    features: {
      hasResources: false
    }
  },
  training: {
    id: 'TRAINING',
    displayName: 'Training Institute',
    icon: 'business',
    terminology: {
      member: 'Trainee',
      members: 'Trainees',
      resource: 'Workstation',
      resources: 'Workstations',
      businessName: 'Institute Name'
    },
    features: {
      hasResources: false
    }
  },
  study: {
    id: 'STUDY',
    displayName: 'Study Center',
    icon: 'library',
    terminology: {
      member: 'Student',
      members: 'Students',
      resource: 'Seat',
      resources: 'Seats',
      businessName: 'Center Name'
    },
    features: {
      hasResources: true
    }
  }
};

for (const [name, config] of Object.entries(configs)) {
  fs.writeFileSync(`src/config/niches/${name}.ts`, `import { NicheConfig } from './types';\n\nexport const ${name}Config: NicheConfig = ${JSON.stringify(config, null, 2)};\n`);
}
