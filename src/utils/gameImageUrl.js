import API_BASE from './apiBase';

// Utilitaire pour résoudre les URLs d'images de jeux
// Similaire à avatarUrl.js mais pour les images de jeux

const envImageBase =
  typeof import.meta !== 'undefined'
    ? import.meta.env?.NEXT_PUBLIC_IMAGE_BASE || import.meta.env?.VITE_IMAGE_BASE_URL
    : undefined;

const stripTrailingSlash = (value) => value?.replace(/\/+$/, '') ?? value;

const deriveImageBase = () => {
  if (envImageBase) {
    return stripTrailingSlash(envImageBase);
  }

  if (API_BASE && /^https?:\/\//.test(API_BASE)) {
    try {
      const apiUrl = new URL(API_BASE);
      apiUrl.pathname = apiUrl.pathname.replace(/\/api\/?$/, '/');
      return stripTrailingSlash(`${apiUrl.origin}${apiUrl.pathname}`);
    } catch (error) {
      console.warn('[Image Resolver] Impossible de parser API_BASE pour déterminer IMAGE_BASE:', error);
    }
  }

  if (typeof window !== 'undefined') {
    const { origin, pathname, hostname } = window.location;
    if (hostname.endsWith('vercel.app')) {
      return 'https://overflowing-fulfillment-production-36c6.up.railway.app';
    }
    if (pathname.includes('/projet%20ismo') || pathname.includes('/projet ismo')) {
      return `${origin}/projet%20ismo`;
    }
    return origin;
  }

  return 'http://localhost/projet%20ismo';
};

const IMAGE_BASE = deriveImageBase();

const ensureHttps = (url) => {
  if (!url || !url.startsWith('http://')) {
    return url;
  }
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return url;
    }
    parsed.protocol = 'https:';
    return parsed.toString();
  } catch {
    return url;
  }
};

/**
 * Résout l'URL d'une image de jeu
 * @param {string|null} imageUrl - URL de l'image du jeu
 * @param {string|null} gameSlug - Slug du jeu pour fallback
 * @returns {string} URL complète de l'image
 */
export function resolveGameImageUrl(imageUrl, gameSlug = null) {
  // Si pas d'image, utiliser un placeholder avec le slug
  if (!imageUrl) {
    // Placeholder coloré basé sur le slug
    const colors = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-red-500 to-pink-600',
      'from-yellow-500 to-orange-600',
      'from-indigo-500 to-blue-600',
    ];
    const colorIndex = gameSlug ? gameSlug.charCodeAt(0) % colors.length : 0;
    return `gradient-${colors[colorIndex]}`;
  }

  if (/^https?:\/\//.test(imageUrl)) {
    return ensureHttps(imageUrl);
  }

  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${IMAGE_BASE}${normalizedPath}`;
}

/**
 * Vérifie si l'URL est un gradient
 * @param {string} url - URL à vérifier
 * @returns {boolean}
 */
export function isGradient(url) {
  return url && url.startsWith('gradient-');
}

/**
 * Extrait la classe de gradient de l'URL
 * @param {string} url - URL du gradient
 * @returns {string} Classe Tailwind du gradient
 */
export function getGradientClass(url) {
  if (!isGradient(url)) return 'from-gray-400 to-gray-600';
  return url.replace('gradient-', '');
}

export default resolveGameImageUrl;