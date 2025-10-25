import { createRoot } from 'react-dom/client';
import FullApp from './FullApp-NoLazy';

// Global error handling
window.addEventListener('error', (event) => {
  console.error('🚨 Global error caught:', event.error);
  console.error('Error stack:', event.error?.stack);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
});

// Initialiser l'application
console.log('🚀 Starting GameZone app...');
console.log('Environment:', process.env.NODE_ENV);

const rootElement = document.getElementById('root');
if (rootElement) {
  console.log('✅ Root element found, rendering app...');
  try {
    const root = createRoot(rootElement);
    console.log('✅ React root created');
    root.render(<FullApp />);
    console.log('✅ App rendered successfully!');
  } catch (error) {
    console.error('❌ Error rendering app:', error);
    console.error('Error stack:', error.stack);
    document.body.innerHTML = `<div style="color: white; background: red; text-align: center; margin-top: 50px; padding: 20px; font-family: monospace;">
      <h1>❌ ERREUR DE CHARGEMENT</h1>
      <pre style="background: #000; color: #f00; padding: 20px; border-radius: 5px; text-align: left; overflow: auto;">${error}\n\n${error.stack}</pre>
      <p>Ouvrez la console (F12) pour plus de détails</p>
    </div>`;
  }
} else {
  console.error('❌ Root element not found');
  document.body.innerHTML = `<div style="color: white; background: red; text-align: center; margin-top: 50px; padding: 20px; font-family: monospace;">
    <h1>❌ ERREUR</h1>
    <p>Element root introuvable dans le DOM</p>
  </div>`;
}
