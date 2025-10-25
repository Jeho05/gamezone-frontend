/**
 * API Client centralisé avec gestion automatique de l'authentification
 * Cette solution règle les problèmes "unauthorized" de manière globale
 */

import API_BASE from './apiBase';

class ApiClient {
  constructor() {
    this.refreshing = false;
    this.refreshPromise = null;
  }

  /**
   * Wrapper autour de fetch avec gestion automatique de l'authentification
   */
  async fetch(url, options = {}) {
    // Toujours inclure les credentials pour les cookies de session
    const config = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      let response = await fetch(url, config);

      // Si 401, essayer de rafraîchir la session
      if (response.status === 401) {
        console.warn('Unauthorized request detected, attempting session refresh...');
        
        const refreshed = await this.refreshSession();
        
        if (refreshed) {
          // Retry la requête originale
          console.log('Session refreshed, retrying original request...');
          response = await fetch(url, config);
        } else {
          // Rediriger vers la page de connexion
          console.error('Session refresh failed, redirecting to login...');
          this.redirectToLogin();
          throw new Error('Unauthorized');
        }
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Tente de rafraîchir la session en appelant l'endpoint auth/check
   */
  async refreshSession() {
    // Éviter les appels concurrents
    if (this.refreshing) {
      return this.refreshPromise;
    }

    this.refreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/check.php`, {
          credentials: 'include',
        });
        
        const success = response.ok;
        return success;
      } catch (error) {
        console.error('Session refresh error:', error);
        return false;
      } finally {
        this.refreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Redirige vers la page de connexion
   */
  redirectToLogin() {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      // Ne pas rediriger si déjà sur une page d'auth
      if (!currentPath.includes('/auth/')) {
        window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const response = await this.fetch(url, {
      method: 'GET',
      ...options,
    });

    if (!response.ok) {
      const error = await this.handleError(response);
      throw error;
    }

    return response.json();
  }

  /**
   * POST request
   */
  async post(endpoint, data, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const response = await this.fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      const error = await this.handleError(response);
      throw error;
    }

    return response.json();
  }

  /**
   * PUT request
   */
  async put(endpoint, data, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const response = await this.fetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      const error = await this.handleError(response);
      throw error;
    }

    return response.json();
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const response = await this.fetch(url, {
      method: 'DELETE',
      ...options,
    });

    if (!response.ok) {
      const error = await this.handleError(response);
      throw error;
    }

    return response.json();
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const response = await this.fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      const error = await this.handleError(response);
      throw error;
    }

    return response.json();
  }

  /**
   * Gère les erreurs HTTP
   */
  async handleError(response) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const data = await response.json();
      if (data.error) {
        errorMessage = data.error;
      }
    } catch (e) {
      // Ignorer si pas de JSON
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.response = response;
    return error;
  }
}

// Export une instance singleton
const apiClient = new ApiClient();
export default apiClient;

// Export aussi des fonctions helper pour une utilisation simple
export const api = {
  get: (endpoint, options) => apiClient.get(endpoint, options),
  post: (endpoint, data, options) => apiClient.post(endpoint, data, options),
  put: (endpoint, data, options) => apiClient.put(endpoint, data, options),
  delete: (endpoint, options) => apiClient.delete(endpoint, options),
  patch: (endpoint, data, options) => apiClient.patch(endpoint, data, options),
};
