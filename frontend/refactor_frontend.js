const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const dirsToCreate = [
  'features/auth',
  'features/organization',
  'features/members',
  'features/renewals',
  'features/payments',
  'features/notifications',
  'features/settings',
  'components',
  'config/niches',
  'hooks',
  'services',
  'types'
];

dirsToCreate.forEach(dir => {
  const fullPath = path.join(srcDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

console.log('Frontend architecture scaffold created successfully.');
