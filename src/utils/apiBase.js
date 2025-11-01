// Central API base: prefer explicit environment variable, otherwise derive fallbacks
const envBase = import.meta.env.NEXT_PUBLIC_API_BASE || import.meta.env.VITE_API_BASE_URL;
const DEFAULT_REMOTE_API_BASE = 'https://overflowing-fulfillment-production-36c6.up.railway.app/api';
let API_BASE = envBase;

if (!API_BASE) {
  if (typeof window !== 'undefined') {
    const { hostname, port, origin, pathname } = window.location;
    if (port === '4000' || port === '5173' || port === '5174') {
      // Vite dev server: UTILISER LE PROXY pour éviter les problèmes CORS/NetworkError
      API_BASE = '/php-api';
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Accès direct via Apache local
      API_BASE = pathname.includes('/projet%20ismo') || pathname.includes('/projet ismo')
        ? `${origin.replace(/\/+$/, '')}/projet%20ismo/api`
        : `${origin.replace(/\/+$/, '')}/api`;
    } else if (hostname.endsWith('.vercel.app')) {
      API_BASE = DEFAULT_REMOTE_API_BASE;
    } else {
      API_BASE = `${origin.replace(/\/+$/, '')}/api`;
    }
  } else {
    // SSR or tools (ex: build, tests)
    API_BASE = DEFAULT_REMOTE_API_BASE;
  }
}

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log('[API Config] API_BASE:', API_BASE);
  console.log('[API Config] Window location:', window.location.href);
}

export { API_BASE };
export default API_BASE;