const fs = require('fs');
const path = require('path');

const srcDirs = [
  path.join(__dirname, 'src'), // backend
  path.join(__dirname, '../frontend/src') // frontend
];

// We need to order the replaceMap so that longest/most specific matches are replaced first
const replaceMap = [
  { from: /\bLibrary\b/g, to: 'Organization' },
  { from: /\bLibraries\b/g, to: 'Organizations' },
  { from: /\blibraryId\b/g, to: 'organizationId' },
  { from: /\blibraries\b/g, to: 'organizations' },
  { from: /\blibrary\b/g, to: 'organization' },
  { from: /\bLIBRARY\b/g, to: 'ORGANIZATION' },

  { from: /\bStudent\b/g, to: 'Member' },
  { from: /\bStudents\b/g, to: 'Members' },
  { from: /\bstudentId\b/g, to: 'memberId' },
  { from: /\bstudents\b/g, to: 'members' },
  { from: /\bstudent\b/g, to: 'member' },
  { from: /\bSTUDENT\b/g, to: 'MEMBER' },

  { from: /\bSeat\b/g, to: 'Resource' },
  { from: /\bSeats\b/g, to: 'Resources' },
  { from: /\bseatId\b/g, to: 'resourceId' },
  { from: /\bseats\b/g, to: 'resources' },
  { from: /\bseat\b/g, to: 'resource' },
  { from: /\bSEAT\b/g, to: 'RESOURCE' },

  { from: /\btotalSeats\b/g, to: 'totalResources' },
  { from: /\bseatNumber\b/g, to: 'resourceName' },
];

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const mapping of replaceMap) {
        const newContent = content.replace(mapping.from, mapping.to);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

srcDirs.forEach(processDir);
console.log('Codebase renamed successfully.');
