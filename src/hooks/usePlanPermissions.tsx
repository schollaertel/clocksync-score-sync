
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const usePlanPermissions = () => {
  const { profile, refreshProfile } = useAuth();

  const incrementGamesPlayed = async () => {
    if (!profile) return;
    
    try {
      const { error } = await supabase.rpc('increment_games_played', {
        user_id: profile.id
      });
      
      if (error) {
        console.error('Error incrementing games played:', error);
        return;
      }
      
      // Refresh profile to get updated counts
      await refreshProfile();
    } catch (error) {
      console.error('Error incrementing games played:', error);
    }
  };

  const updateUserCounts = async () => {
    if (!profile) return;
    
    try {
      const { error } = await supabase.rpc('update_user_counts', {
        user_id: profile.id
      });
      
      if (error) {
        console.error('Error updating user counts:', error);
        return;
      }
      
      // Refresh profile to get updated counts
      await refreshProfile();
    } catch (error) {
      console.error('Error updating user counts:', error);
    }
  };

  const upgradePlan = async (newPlan: 'game_day' | 'season_pass') => {
    if (!profile) return;
    
    try {
      const { error } = await supabase.rpc('update_user_plan', {
        user_id: profile.id,
        new_plan_tier: newPlan
      });
      
      if (error) {
        console.error('Error upgrading plan:', error);
        return;
      }
      
      // Refresh profile to get updated plan
      await refreshProfile();
    } catch (error) {
      console.error('Error upgrading plan:', error);
    }
  };

  const getPlanLimits = () => {
    if (!profile) return null;
    
    return {
      canAccessScoreboard: profile.plan_tier !== 'covered_game' || 
        profile.total_games_played < 2 || 
        profile.active_ads_count >= profile.fields_count,
      gamesRemaining: profile.plan_tier === 'covered_game' ? 
        Math.max(0, 2 - profile.total_games_played) : Infinity,
      needsAds: profile.plan_tier === 'covered_game' && 
        profile.total_games_played >= 2 && 
        profile.active_ads_count < profile.fields_count,
      commissionRate: profile.commission_pct
    };
  };

  return {
    profile,
    incrementGamesPlayed,
    updateUserCounts,
    upgradePlan,
    getPlanLimits
  };
};
