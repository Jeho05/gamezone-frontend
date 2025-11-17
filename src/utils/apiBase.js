// Central API base: prefer Vite env, fallback to Next-style env, then dev proxy or local Apache
let API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.NEXT_PUBLIC_API_BASE;

if (!API_BASE) {
  if (typeof window !== 'undefined' && (window.location.port === '4000' || window.location.port === '5173' || window.location.port === '5174')) {
    // Vite dev server: UTILISER LE PROXY pour éviter les problèmes CORS/NetworkError
    API_BASE = '/php-api';
    
    // Alternative: Accès direct (peut causer NetworkError)
    // API_BASE = 'http://localhost/EXAMEN/projet%20ismo/api';
  } else if (typeof window !== 'undefined') {
    // Served from Apache/XAMPP or another web server
    const origin = window.location.origin;
    const path = window.location.pathname;
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

    if (isLocalhost) {
      // En local (XAMPP), cibler explicitement le backend projet ismo
      API_BASE = origin + '/EXAMEN/projet%20ismo/api';
    } else if (path.includes('/EXAMEN/projet%20ismo/') || path.includes('/EXAMEN/projet ismo/')) {
      API_BASE = origin + '/EXAMEN/projet%20ismo/api';
    } else {
      // Par défaut en prod: backend monté sous /api sur le même domaine
      API_BASE = origin + '/api';
    }
  } else {
    // SSR or tools
    API_BASE = 'http://localhost/EXAMEN/projet%20ismo/api';
  }
}

// Debug: log API base in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log('[API Config] API_BASE:', API_BASE);
  console.log('[API Config] Window location:', window.location.href);
}

export { API_BASE };
export default API_BASE;
