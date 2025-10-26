// Script pour corriger tous les labels invisibles dans toutes les pages admin
const fs = require('fs');
const path = require('path');

const adminPagesDir = './src/app/admin';

// Patterns à corriger
const patterns = [
  {
    // Labels sans couleur
    search: /className="block text-sm font-semibold mb-2"/g,
    replace: 'className="block text-sm font-semibold text-gray-900 mb-2"'
  },
  {
    // Labels avec font-medium
    search: /className="block text-sm font-medium mb-2"/g,
    replace: 'className="block text-sm font-medium text-gray-900 mb-2"'
  },
  {
    // Labels basiques
    search: /className="block mb-2 text-sm font-semibold"/g,
    replace: 'className="block mb-2 text-sm font-semibold text-gray-900"'
  }
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  patterns.forEach(pattern => {
    const before = content;
    content = content.replace(pattern.search, pattern.replace);
    if (content !== before) {
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixedCount += walkDir(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      if (fixFile(filePath)) {
        fixedCount++;
      }
    }
  });
  
  return fixedCount;
}

console.log('🔄 Correction de tous les labels invisibles...\n');
const fixed = walkDir(adminPagesDir);
console.log(`\n✅ ${fixed} fichiers corrigés !`);
