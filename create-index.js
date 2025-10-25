import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildDir = path.join(__dirname, 'build', 'client');
const indexPath = path.join(buildDir, 'index.html');

// Lire le manifest pour trouver les fichiers générés
const manifestPath = path.join(buildDir, '.vite', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

// Trouver les fichiers d'entrée
const entryFile = manifest['src/entry.client.tsx'];
const rootFile = manifest['src/app/root.tsx'];

// Créer le HTML
const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GameZone - Arcade Management</title>
  <meta name="description" content="GameZone - Système de gestion d'arcade gaming">
  ${entryFile.css ? entryFile.css.map(css => `<link rel="stylesheet" href="/${css}">`).join('\n  ') : ''}
  ${rootFile?.css ? rootFile.css.map(css => `<link rel="stylesheet" href="/${css}">`).join('\n  ') : ''}
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/${entryFile.file}"></script>
</body>
</html>`;

fs.writeFileSync(indexPath, html);
console.log('✅ index.html created successfully!');
