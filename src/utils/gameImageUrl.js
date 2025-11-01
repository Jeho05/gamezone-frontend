import API_BASE from './apiBase';

// Utilitaire pour résoudre les URLs d'images de jeux
// Similaire à avatarUrl.js mais pour les images de jeux

const envImageBase =
  typeof import.meta !== 'undefined'
    ? import.meta.env?.NEXT_PUBLIC_IMAGE_BASE || import.meta.env?.VITE_IMAGE_BASE_URL
    : undefined;

const DEFAULT_REMOTE_BASE = 'https://overflowing-fulfillment-production-36c6.up.railway.app';

const stripTrailingSlash = (value) => value?.replace(/\/+$/, '') ?? value;
const ensureTrailingSlash = (value) => (value?.endsWith('/') ? value : `${value}/`);
const isAbsoluteUrl = (value) => typeof value === 'string' && /^https?:\/\//.test(value);

const expandAbsoluteBase = (base) => {
  if (!isAbsoluteUrl(base)) return [];

  const trimmed = stripTrailingSlash(base);
  const candidates = [trimmed];

  if (trimmed.endsWith('/api')) {
    candidates.push(stripTrailingSlash(trimmed.slice(0, -4)));
  }

  return candidates;
};

const buildBaseCandidates = () => {
  const ordered = [];

  expandAbsoluteBase(envImageBase).forEach((candidate) => ordered.push(candidate));
  expandAbsoluteBase(API_BASE).forEach((candidate) => ordered.push(candidate));

  // Toujours ajouter la base distante connue en priorité si aucune des précédentes n'est fournie
  ordered.push(DEFAULT_REMOTE_BASE);

  if (typeof window !== 'undefined') {
    const { origin, hostname, pathname } = window.location;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      ordered.push('http://localhost/projet%20ismo');
      ordered.push(origin);
    } else {
      if (pathname.includes('/projet%20ismo') || pathname.includes('/projet ismo')) {
        ordered.push(stripTrailingSlash(`${origin}/projet%20ismo`));
      }
      ordered.push(origin);
    }
  }

  // Supprimer valeurs falsy et doublons en conservant l'ordre
  const seen = new Set();
  return ordered.filter((candidate) => {
    if (!candidate) return false;
    const trimmed = stripTrailingSlash(candidate);
    if (seen.has(trimmed)) return false;
    seen.add(trimmed);
    return true;
  });
};

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

  const relativePath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
  const baseCandidates = buildBaseCandidates();

  for (const base of baseCandidates) {
    try {
      const absoluteUrl = new URL(relativePath, ensureTrailingSlash(base)).toString();
      return ensureHttps(absoluteUrl);
    } catch (error) {
      // Continuer sur le prochain candidat
    }
  }

  // En dernier recours, retourner l'URL telle quelle (peut échouer mais laisse une chance au navigateur)
  return relativePath;
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