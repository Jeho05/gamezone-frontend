import { createRoot } from 'react-dom/client';
import TestPage from './app/test-page';

console.log('🚀 Starting GameZone TEST...');

const rootElement = document.getElementById('root');
if (rootElement) {
  console.log('✅ Root element found, rendering TEST app...');
  try {
    const root = createRoot(rootElement);
    console.log('✅ React root created');
    root.render(<TestPage />);
    console.log('✅ TEST App rendered successfully!');
  } catch (error) {
    console.error('❌ Error rendering TEST app:', error);
    console.error('Error stack:', error.stack);
    document.body.innerHTML = `<div style="color: white; background: red; text-align: center; margin-top: 50px; padding: 20px; font-family: monospace;">
      <h1>❌ TEST ERREUR DE CHARGEMENT</h1>
      <pre style="background: #000; color: #f00; padding: 20px; border-radius: 5px; text-align: left; overflow: auto;">${error.message || error}\n\n${error.stack || ''}</pre>
      <p>Ouvrez la console (F12) pour plus de détails</p>
    </div>`;
  }
} else {
  console.error('❌ Root element not found');
  document.body.innerHTML = `<div style="color: white; background: red; text-align: center; margin-top: 50px; padding: 20px; font-family: monospace;">
    <h1>❌ TEST ERREUR</h1>
    <p>Element root introuvable dans le DOM</p>
  </div>`;
}