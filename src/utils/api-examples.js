/**
 * Exemples d'utilisation du nouveau client API
 * 
 * Ces exemples montrent comment utiliser le client API centralisé
 * pour remplacer les appels fetch() existants
 */

import { api } from './api-client';

// ============================================================================
// EXEMPLE 1 : Récupérer la liste des jeux
// ============================================================================

export async function getGames(category = null) {
  try {
    const endpoint = category 
      ? `/shop/games.php?category=${category}`
      : '/shop/games.php';
    
    const data = await api.get(endpoint);
    return data.games || [];
  } catch (error) {
    console.error('Error loading games:', error);
    throw error;
  }
}

// ============================================================================
// EXEMPLE 2 : Créer un achat
// ============================================================================

export async function createPurchase(purchaseData) {
  try {
    const result = await api.post('/shop/create_purchase.php', purchaseData);
    return result;
  } catch (error) {
    console.error('Error creating purchase:', error);
    throw error;
  }
}

// ============================================================================
// EXEMPLE 3 : Mettre à jour le profil utilisateur
// ============================================================================

export async function updateProfile(profileData) {
  try {
    const result = await api.put('/users/profile.php', profileData);
    return result;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// ============================================================================
// EXEMPLE 4 : Récupérer les statistiques de gamification
// ============================================================================

export async function getUserStats() {
  try {
    const data = await api.get('/gamification/user_stats.php');
    return data.stats;
  } catch (error) {
    console.error('Error loading stats:', error);
    throw error;
  }
}

// ============================================================================
// EXEMPLE 5 : Vérifier la disponibilité d'une réservation
// ============================================================================

export async function checkAvailability(gameId, packageId, scheduledStart) {
  try {
    const params = new URLSearchParams({
      game_id: gameId,
      package_id: packageId,
      scheduled_start: scheduledStart
    });
    
    const data = await api.get(`/shop/check_availability.php?${params}`);
    return data;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
}

// ============================================================================
// EXEMPLE 6 : Utilisation dans un composant React
// ============================================================================

/*
import React, { useState, useEffect } from 'react';
import { getGames } from '@/utils/api-examples';

function GamesComponent() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadGames() {
      try {
        setLoading(true);
        const data = await getGames();
        setGames(data);
      } catch (err) {
        setError(err.message);
        // Si c'est une erreur 401, l'utilisateur sera automatiquement
        // redirigé vers la page de connexion par le client API
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {games.map(game => (
        <div key={game.id}>{game.name}</div>
      ))}
    </div>
  );
}
*/

// ============================================================================
// EXEMPLE 7 : Gestion avancée des erreurs
// ============================================================================

export async function advancedExample() {
  try {
    const data = await api.get('/some/endpoint.php');
    return data;
  } catch (error) {
    // L'erreur contient des informations utiles
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    
    // Gérer différents codes d'erreur
    switch (error.status) {
      case 400:
        // Mauvaise requête
        alert('Données invalides');
        break;
      case 401:
        // Unauthorized - le client API redirige automatiquement
        // donc ce cas ne devrait pas arriver ici
        break;
      case 403:
        // Forbidden
        alert('Vous n\'avez pas les permissions nécessaires');
        break;
      case 404:
        // Not found
        alert('Ressource non trouvée');
        break;
      case 500:
        // Erreur serveur
        alert('Erreur serveur, veuillez réessayer plus tard');
        break;
      default:
        alert('Une erreur est survenue');
    }
    
    throw error;
  }
}

// ============================================================================
// EXEMPLE 8 : Appel avec options personnalisées
// ============================================================================

export async function customHeadersExample() {
  try {
    const data = await api.post('/some/endpoint.php', 
      { data: 'value' },
      {
        headers: {
          'X-Custom-Header': 'custom-value',
          // Le Content-Type: application/json est déjà ajouté automatiquement
        }
      }
    );
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// ============================================================================
// MIGRATION : Avant/Après
// ============================================================================

/* 
// AVANT (ancien code avec fetch)
async function oldWay() {
  const res = await fetch(`${API_BASE}/shop/games.php`, {
    credentials: 'include'
  });
  
  if (!res.ok) {
    if (res.status === 401) {
      // Gérer le cas non authentifié
      window.location.href = '/auth/login';
      return;
    }
    throw new Error('Request failed');
  }
  
  const data = await res.json();
  return data.games;
}

// APRÈS (nouveau code avec api client)
async function newWay() {
  const data = await api.get('/shop/games.php');
  return data.games;
  // L'authentification et la gestion des erreurs sont automatiques !
}
*/
