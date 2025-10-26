const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'src', 'app', 'admin');
const componentsDir = path.join(__dirname, 'src', 'components', 'admin');

function fixLabelsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix 1: block text-sm font-semibold mb-2 (sans text-gray-900)
  const regex1 = /className="block text-sm font-semibold mb-2"/g;
  if (content.match(regex1)) {
    content = content.replace(regex1, 'className="block text-sm font-semibold text-gray-900 mb-2"');
    modified = true;
    console.log(`✅ Fixed "block text-sm..." in ${path.basename(filePath)}`);
  }
  
  // Fix 2: text-sm font-semibold (sans text-gray-900, dans span)
  const regex2 = /<span className="text-sm font-semibold">([^<]+)<\/span>/g;
  if (content.match(regex2)) {
    content = content.replace(regex2, '<span className="text-sm font-semibold text-gray-900">$1</span>');
    modified = true;
    console.log(`✅ Fixed spans in ${path.basename(filePath)}`);
  }
  
  // Fix 3: text-sm font-medium (sans couleur)
  const regex3 = /className="text-sm font-medium mb-/g;
  if (content.match(regex3)) {
    content = content.replace(regex3, 'className="text-sm font-medium text-gray-900 mb-');
    modified = true;
    console.log(`✅ Fixed "text-sm font-medium" in ${path.basename(filePath)}`);
  }
  
  // Fix 4: text-sm (seul, sans couleur après)
  const regex4 = /className="text-sm">([^<]+)<\/label>/g;
  if (content.match(regex4)) {
    content = content.replace(regex4, 'className="text-sm text-gray-900">$1</label>');
    modified = true;
    console.log(`✅ Fixed "text-sm" alone in ${path.basename(filePath)}`);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

function fixAllFiles(directory) {
  const files = fs.readdirSync(directory);
  let totalFixed = 0;
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      totalFixed += fixAllFiles(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      if (fixLabelsInFile(filePath)) {
        totalFixed++;
      }
    }
  });
  
  return totalFixed;
}

console.log('🔧 Fixing all invisible labels...\n');

let fixed = 0;
fixed += fixAllFiles(adminDir);
fixed += fixAllFiles(componentsDir);

console.log(`\n✅ Fixed ${fixed} files total!`);
