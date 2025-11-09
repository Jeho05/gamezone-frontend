import API_BASE from './apiBase';

/**
 * Résout l'URL complète d'un avatar
 * Gère les data URLs (base64), URLs complètes et URLs relatives
 * 
 * @param {string|null} avatarUrl - L'URL de l'avatar depuis l'API (peut être null, data URL, relative ou complète)
 * @param {string} fallbackUsername - Nom d'utilisateur pour le fallback pravatar
 * @returns {string} URL complète de l'avatar
 */
export function resolveAvatarUrl(avatarUrl, fallbackUsername = 'user') {
  // Si pas d'avatar, utiliser pravatar comme fallback
  if (!avatarUrl || avatarUrl === '' || avatarUrl === null) {
    return `https://i.pravatar.cc/150?u=${encodeURIComponent(fallbackUsername)}`;
  }
  
  // Si c'est une data URL (base64), la retourner telle quelle
  if (avatarUrl.startsWith('data:')) {
    return avatarUrl;
  }
  
  // Si l'URL est déjà complète (commence par http:// ou https://), la retourner telle quelle
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  // Pour les URLs relatives, pointer vers l'API backend
  // Assurer que l'URL commence par /
  const normalizedUrl = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
  
  return `${API_BASE}${normalizedUrl}`;
}

export default resolveAvatarUrl;
