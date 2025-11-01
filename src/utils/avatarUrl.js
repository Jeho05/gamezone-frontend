import {
  REMOTE_APP_ORIGIN,
  LEGACY_LOCAL_HOSTS
} from './remoteConfig';

/**
 * Résout l'URL complète d'un avatar
 * Les avatars doivent être chargés directement depuis l'origine distante
 * 
 * @param {string|null} avatarUrl - L'URL de l'avatar depuis l'API (peut être null ou relative)
 * @param {string} fallbackUsername - Nom d'utilisateur pour le fallback pravatar
 * @returns {string} URL complète de l'avatar
 */
export function resolveAvatarUrl(avatarUrl, fallbackUsername = 'user') {
  // Si pas d'avatar, utiliser pravatar comme fallback
  if (!avatarUrl || avatarUrl === '' || avatarUrl === null) {
    return `https://i.pravatar.cc/150?u=${encodeURIComponent(fallbackUsername)}`;
  }
  
  // Si l'URL est déjà complète (commence par http:// ou https://), la retourner telle quelle
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    try {
      const parsed = new URL(avatarUrl);
      if (LEGACY_LOCAL_HOSTS.has(parsed.hostname)) {
        return `${REMOTE_APP_ORIGIN}${parsed.pathname}`;
      }
      return parsed.toString().replace('http://', 'https://');
    } catch {
      return avatarUrl;
    }
  }
  
  const normalizedUrl = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
  return `${REMOTE_APP_ORIGIN}${normalizedUrl}`;
}

export default resolveAvatarUrl;
