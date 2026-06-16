const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const modulesDir = path.join(srcDir, 'modules');

if (!fs.existsSync(modulesDir)) fs.mkdirSync(modulesDir);

const mapping = {
  'auth': ['auth'],
  'organizations': ['dashboard', 'subscription'],
  'members': ['student', 'seat'],
  'payments': ['fee'],
  'renewals': ['membership'],
  'notifications': ['notification'],
  'history': ['activity'],
  'imports': ['import']
};

const types = ['controllers', 'services', 'routes', 'validators'];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// 1. Determine moves BEFORE moving
const fileMoves = []; // { oldPath, newPath, content }
const movedFilesMap = {}; // oldRel -> newRel

for (const [mod, prefixes] of Object.entries(mapping)) {
  const modDir = path.join(modulesDir, mod);
  ensureDir(modDir);

  for (const prefix of prefixes) {
    for (const type of types) {
      const typeDir = path.join(srcDir, type);
      const ext = type === 'validators' ? 'validator.ts' : 
                  type === 'controllers' ? 'controller.ts' : 
                  type === 'services' ? 'service.ts' : 'routes.ts';
      const fileName = `${prefix}.${ext}`;
      const oldPath = path.join(typeDir, fileName);
      if (fs.existsSync(oldPath)) {
        const newPath = path.join(modDir, fileName);
        fileMoves.push({ oldPath, newPath });
        
        const oldRel = path.relative(srcDir, oldPath).replace(/\\/g, '/').replace('.ts', '');
        const newRel = path.relative(srcDir, newPath).replace(/\\/g, '/').replace('.ts', '');
        movedFilesMap[oldRel] = newRel;
      }
    }
  }
}

function getAllFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      getAllFiles(full, files);
    } else if (full.endsWith('.ts')) {
      files.push(full);
    }
  });
  return files;
}

const allFiles = getAllFiles(srcDir);

// Build memory representation of all files
const filesData = {};
allFiles.forEach(f => {
  filesData[f] = {
    oldPath: f,
    newPath: f, // default
    content: fs.readFileSync(f, 'utf8')
  };
});

fileMoves.forEach(m => {
  filesData[m.oldPath].newPath = m.newPath;
});

// Update imports
const importRegex = /from\s+['"]([^'"]+)['"]/g;

for (const oldPath of Object.keys(filesData)) {
  const data = filesData[oldPath];
  let newContent = data.content;

  newContent = newContent.replace(importRegex, (match, importPath) => {
    if (!importPath.startsWith('.')) return match; // skip non-relative

    // absolute path of the imported file based on OLD location
    const absImport = path.resolve(path.dirname(oldPath), importPath);
    const srcRelImport = path.relative(srcDir, absImport).replace(/\\/g, '/');

    // determine its new relative src path
    const newSrcRelImport = movedFilesMap[srcRelImport] || srcRelImport;
    const newAbsImport = path.join(srcDir, newSrcRelImport);

    // compute new relative path based on NEW location of current file
    let newImport = path.relative(path.dirname(data.newPath), newAbsImport).replace(/\\/g, '/');
    if (!newImport.startsWith('.')) newImport = './' + newImport;

    return `from '${newImport}'`;
  });

  data.content = newContent;
}

// Write everything to new locations
for (const oldPath of Object.keys(filesData)) {
  const data = filesData[oldPath];
  if (data.oldPath !== data.newPath) {
    fs.unlinkSync(data.oldPath); // remove old
  }
  ensureDir(path.dirname(data.newPath));
  fs.writeFileSync(data.newPath, data.content);
}

// Clean up empty dirs
types.forEach(type => {
  const typeDir = path.join(srcDir, type);
  if (fs.existsSync(typeDir) && fs.readdirSync(typeDir).length === 0) {
    fs.rmdirSync(typeDir);
  }
});

console.log('Backend architecture refactored successfully.');
