// Gamification API utilities
import API_BASE from './apiBase';

export class GamificationAPI {
  /**
   * Award points to a user for a specific action
   */
  static async awardPoints(actionType) {
    const response = await fetch(`${API_BASE}/gamification/award_points.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action_type: actionType }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to award points');
    }
    
    return response.json();
  }

  /**
   * Record daily login and get streak bonus
   */
  static async recordLogin() {
    const response = await fetch(`${API_BASE}/gamification/login_streak.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const data = await response.json();
      // 409 means already logged in today
      if (response.status === 409) {
        return data;
      }
      throw new Error('Failed to record login');
    }
    
    return response.json();
  }

  /**
   * Get all available levels
   */
  static async getLevels() {
    const response = await fetch(`${API_BASE}/gamification/levels.php`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch levels');
    }
    
    return response.json();
  }

  /**
   * Get level progression for a specific user
   */
  static async getUserLevelProgress(userId) {
    const response = await fetch(
      `${API_BASE}/gamification/levels.php?user_id=${userId}`,
      { credentials: 'include' }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch user level progress');
    }
    
    return response.json();
  }

  /**
   * Get all badges
   */
  static async getBadges() {
    const response = await fetch(`${API_BASE}/gamification/badges.php`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch badges');
    }
    
    return response.json();
  }

  /**
   * Get badges with progress for a specific user
   */
  static async getUserBadges(userId) {
    const response = await fetch(
      `${API_BASE}/gamification/badges.php?user_id=${userId}`,
      { credentials: 'include' }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch user badges');
    }
    
    return response.json();
  }

  /**
   * Check for new badges
   */
  static async checkBadges() {
    const response = await fetch(`${API_BASE}/gamification/check_badges.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to check badges');
    }
    
    return response.json();
  }

  /**
   * Get comprehensive user statistics
   */
  static async getUserStats(userId = null) {
    const url = userId
      ? `${API_BASE}/gamification/user_stats.php?user_id=${userId}`
      : `${API_BASE}/gamification/user_stats.php`;
    
    const response = await fetch(url, { credentials: 'include' });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }
    
    return response.json();
  }

  /**
   * Get comprehensive gamification dashboard (NEW ENDPOINT)
   * This is the new consolidated endpoint that returns all gamification data in one call
   */
  static async getGamificationDashboard(userId = null) {
    const url = userId
      ? `${API_BASE}/player/gamification.php?user_id=${userId}`
      : `${API_BASE}/player/gamification.php`;
    
    try {
      const response = await fetch(url, { credentials: 'include' });
      
      // Get response text first to debug
      const text = await response.text();
      console.log('[API] Raw response:', text.substring(0, 200));
      
      // Try to parse JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('[API] JSON parse error:', parseError);
        console.error('[API] Response text:', text);
        throw new Error(`Invalid JSON response from server. Check console for details.`);
      }
      
      // Check for error response
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch gamification dashboard');
      }
      
      return data;
    } catch (error) {
      console.error('[API] Fetch error:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard (NEW ENDPOINT)
   * @param {string} period - 'weekly', 'monthly', or 'all'
   * @param {number} limit - Number of players to return (default: 50)
   */
  static async getLeaderboard(period = 'weekly', limit = 50) {
    const response = await fetch(
      `${API_BASE}/player/leaderboard.php?period=${period}&limit=${limit}`,
      { credentials: 'include' }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    
    return response.json();
  }

  /**
   * Get active bonus multipliers for a user
   */
  static async getActiveMultipliers(userId = null) {
    const url = userId
      ? `${API_BASE}/gamification/bonus_multiplier.php?user_id=${userId}`
      : `${API_BASE}/gamification/bonus_multiplier.php`;
    
    const response = await fetch(url, { credentials: 'include' });
    
    if (!response.ok) {
      throw new Error('Failed to fetch multipliers');
    }
    
    return response.json();
  }

  /**
   * Claim daily bonus (existing endpoint)
   */
  static async claimDailyBonus() {
    const response = await fetch(`${API_BASE}/points/bonus.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const data = await response.json();
      // 409 means already claimed today
      if (response.status === 409) {
        return data;
      }
      throw new Error('Failed to claim daily bonus');
    }
    
    return response.json();
  }

  /**
   * Get rewards catalog
   */
  static async getRewards() {
    try {
      const response = await fetch(`${API_BASE}/rewards/index.php`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Si la table n'existe pas, retourner un objet vide avec message
      if (data.success === false) {
        console.warn('Rewards API error:', data.error);
        return {
          success: false,
          items: [],
          count: 0,
          error: data.error,
          message: data.message
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching rewards:', error);
      return {
        success: false,
        items: [],
        count: 0,
        error: error.message
      };
    }
  }

  /**
   * Redeem a reward
   */
  static async redeemReward(rewardId) {
    try {
      const response = await fetch(`${API_BASE}/rewards/redeem.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reward_id: rewardId }),
      });

      const text = await response.text();
      let data;

      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('[GamificationAPI.redeemReward] JSON parse error:', parseError);
        console.error('[GamificationAPI.redeemReward] Raw response:', text);
        throw new Error('Réponse invalide du serveur lors de l\'échange de la récompense');
      }

      if (!response.ok || data?.success === false) {
        const msg =
          data?.message ||
          data?.error ||
          `Échec de l'échange de la récompense (HTTP ${response.status})`;
        throw new Error(msg);
      }

      return data;
    } catch (error) {
      console.error('[GamificationAPI.redeemReward] Error:', error);
      throw error;
    }
  }
}

// Helper to format rarity colors
export function getRarityColor(rarity) {
  const colors = {
    common: 'text-gray-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400',
  };
  return colors[rarity] || colors.common;
}

// Helper to format rarity background
export function getRarityBg(rarity) {
  const colors = {
    common: 'bg-gray-500/20 border-gray-500/50',
    rare: 'bg-blue-500/20 border-blue-500/50',
    epic: 'bg-purple-500/20 border-purple-500/50',
    legendary: 'bg-yellow-500/20 border-yellow-500/50',
  };
  return colors[rarity] || colors.common;
}

export default GamificationAPI;
