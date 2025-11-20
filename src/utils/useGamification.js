// React hooks for gamification features
import { useState, useEffect, useCallback } from 'react';
import { GamificationAPI } from './gamification-api';
import { toast } from 'sonner';

/**
 * Hook to manage user gamification stats
 */
export function useGamificationStats(userId = null) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await GamificationAPI.getUserStats(userId);
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching gamification stats:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

/**
 * Hook to manage badges
 */
export function useUserBadges(userId) {
  const [badges, setBadges] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBadges = useCallback(async () => {
    try {
      // Attendre d'avoir un userId valide avant d'appeler l'API
      if (!userId) {
        setBadges(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await GamificationAPI.getUserBadges(userId);
      setBadges(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching badges:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  return { badges, loading, error, refetch: fetchBadges };
}

/**
 * Hook to manage level progression
 */
export function useLevelProgress(userId) {
  const [levelData, setLevelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLevelProgress = useCallback(async () => {
    try {
      // Nécessite un userId pour calculer une progression de niveau personnalisée
      if (!userId) {
        setLevelData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await GamificationAPI.getUserLevelProgress(userId);
      setLevelData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching level progress:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLevelProgress();
  }, [fetchLevelProgress]);

  return { levelData, loading, error, refetch: fetchLevelProgress };
}

/**
 * Hook to award points and handle notifications
 */
export function useAwardPoints() {
  const [isAwarding, setIsAwarding] = useState(false);

  const awardPoints = useCallback(async (actionType, options = {}) => {
    try {
      setIsAwarding(true);
      const result = await GamificationAPI.awardPoints(actionType);
      
      // Show notification
      if (options.showToast !== false) {
        toast.success(`+${result.points_awarded} points!`, {
          description: result.multiplier > 1 ? `Bonus x${result.multiplier}` : undefined,
        });
      }

      // Handle level up
      if (result.leveled_up && result.new_level) {
        toast.success(`🎉 Niveau supérieur: ${result.new_level.name}!`, {
          description: `Bonus de ${result.new_level.points_bonus} points`,
          duration: 5000,
        });
      }

      // Handle new badges
      if (result.badges_earned && result.badges_earned.length > 0) {
        result.badges_earned.forEach((badge) => {
          toast.success(`${badge.icon} Badge débloqué: ${badge.name}!`, {
            description: `+${badge.points_reward} points bonus`,
            duration: 5000,
          });
        });
      }

      return result;
    } catch (err) {
      console.error('Error awarding points:', err);
      if (options.showToast !== false) {
        toast.error('Erreur lors de l\'attribution des points');
      }
      throw err;
    } finally {
      setIsAwarding(false);
    }
  }, []);

  return { awardPoints, isAwarding };
}

/**
 * Hook to handle daily login streak
 */
export function useDailyLogin() {
  const [hasLoggedInToday, setHasLoggedInToday] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const [showRewardModal, setShowRewardModal] = useState(false);

  const recordLogin = useCallback(async () => {
    try {
      const result = await GamificationAPI.recordLogin();
      
      if (result.message === 'Déjà connecté aujourd\'hui') {
        setHasLoggedInToday(true);
        setStreakData(result);
        return result;
      }

      setHasLoggedInToday(true);
      setStreakData(result);

      // Show beautiful modal instead of simple toast
      setShowRewardModal(true);

      return result;
    } catch (err) {
      console.error('Error recording login:', err);
      throw err;
    }
  }, []);

  const closeRewardModal = useCallback(() => {
    setShowRewardModal(false);
  }, []);

  return { 
    recordLogin, 
    hasLoggedInToday, 
    streakData, 
    showRewardModal, 
    closeRewardModal 
  };
}

/**
 * Hook to handle reward redemption
 */
export function useRewards() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  const fetchRewards = useCallback(async () => {
    try {
      setLoading(true);
      const data = await GamificationAPI.getRewards();
      
      if (data.success === false) {
        console.warn('API rewards error:', data.error);
        setRewards([]);
      } else {
        setRewards(data.rewards || []);
      }
    } catch (err) {
      console.error('Error fetching rewards:', err);
      setRewards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const redeemReward = useCallback(async (rewardId) => {
    try {
      setRedeeming(true);
      const result = await GamificationAPI.redeemReward(rewardId);
      
      const title = result.message || 'Récompense échangée!';
      const rewardName = result.reward?.name || 'Échange réussi';

      let description = rewardName;

      if (typeof result.new_balance === 'number') {
        description += `\nNouveau solde: ${result.new_balance} points`;
      }

      if (result.game_time_added && result.game_time_added > 0) {
        const minutes = result.game_time_added;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const timeStr = hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}min` : ''}` : `${mins}min`;
        description += `\nTemps de jeu ajouté: +${timeStr}`;
      }

      toast.success(title, {
        description,
      });

      await fetchRewards();
      return result;
    } catch (err) {
      console.error('Error redeeming reward:', err);
      toast.error('Erreur lors de l\'échange', {
        description: err.message,
      });
      throw err;
    } finally {
      setRedeeming(false);
    }
  }, [fetchRewards]);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  return { rewards, loading, redeeming, redeemReward, refetch: fetchRewards };
}

/**
 * Hook to get active bonus multipliers
 */
export function useActiveMultipliers(userId = null) {
  const [multipliers, setMultipliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMultipliers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await GamificationAPI.getActiveMultipliers(userId);
      setMultipliers(data.multipliers || []);
    } catch (err) {
      console.error('Error fetching multipliers:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMultipliers();
  }, [fetchMultipliers]);

  return { multipliers, loading, refetch: fetchMultipliers };
}

/**
 * Hook to get comprehensive gamification dashboard (NEW)
 * This uses the new consolidated endpoint that returns everything in one call
 */
export function useGamificationDashboard(userId = null) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[useGamificationDashboard] Fetching dashboard...');
      const data = await GamificationAPI.getGamificationDashboard(userId);
      console.log('[useGamificationDashboard] Data received:', data);
      
      setDashboard(data);
    } catch (err) {
      console.error('[useGamificationDashboard] Error:', err);
      setError(err.message);
      // Set dashboard to error object so we can access error details
      setDashboard({ 
        success: false, 
        error: err.message,
        message: 'Erreur lors du chargement des données'
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboard, loading, error, refetch: fetchDashboard };
}

/**
 * Hook to get leaderboard data (NEW)
 * @param {string} period - 'weekly', 'monthly', or 'all'
 * @param {number} limit - Number of players to return
 */
export function useLeaderboard(period = 'weekly', limit = 50) {
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await GamificationAPI.getLeaderboard(period, limit);
      setLeaderboard(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [period, limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { leaderboard, loading, error, refetch: fetchLeaderboard };
}
