/**
 * Résout l'URL complète d'un avatar
 * Les avatars doivent être chargés directement depuis Apache, pas via le proxy Vite
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
    return avatarUrl;
  }
  
  // Pour les URLs relatives, pointer directement vers Apache
  // Ne pas utiliser window.location.origin car ça pointerait vers localhost:4000 (Vite)
  // Les avatars doivent être chargés depuis le serveur Apache
  const apacheBase = 'http://localhost/projet%20ismo';
  
  // Assurer que l'URL commence par /
  const normalizedUrl = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
  
  return `${apacheBase}${normalizedUrl}`;
}

export default resolveAvatarUrl;
