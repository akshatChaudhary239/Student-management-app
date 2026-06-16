const fs = require('fs');
let c = fs.readFileSync('src/modules/auth/auth.service.ts', 'utf8');
c = c.replace(/name: `\${name}'s Organization`,/g, "businessName: `${name}'s Organization`,");
c = c.replace(/businessName: result.organization.name/g, 'businessName: result.organization.businessName');
c = c.replace(/name: result.organization.name/g, 'businessName: result.organization.businessName');
fs.writeFileSync('src/modules/auth/auth.service.ts', c);
