// Utilitaire pour résoudre les URLs d'images de jeux
// Similaire à avatarUrl.js mais pour les images de jeux

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

  // Si c'est déjà une URL complète (http:// ou https://), la retourner telle quelle
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Sinon, c'est une URL relative, la convertir vers le backend Apache
  // Le frontend Vite tourne sur localhost:4000
  // Le backend Apache tourne sur localhost/projet%20ismo
  const baseUrl = 'http://localhost/projet%20ismo';
  
  // Enlever le slash initial si présent
  const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
  
  return `${baseUrl}/${cleanPath}`;
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
