
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePlanPermissions = () => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const incrementGamesPlayed = async () => {
    if (!profile) return;
    
    try {
      // Update the total_games_played directly since we can't call the function
      const { error } = await supabase
        .from('profiles')
        .update({ 
          total_games_played: (profile.total_games_played || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      await refreshProfile();
      
      toast({
        title: "Game completed",
        description: `Games played: ${(profile.total_games_played || 0) + 1}`,
      });
    } catch (error) {
      console.error('Error incrementing games played:', error);
      toast({
        title: "Error",
        description: "Failed to update games played",
        variant: "destructive",
      });
    }
  };

  const updateUserCounts = async () => {
    if (!profile) return;
    
    try {
      // Count fields and active ads manually
      const [fieldsResult, adsResult] = await Promise.all([
        supabase
          .from('fields')
          .select('id', { count: 'exact' })
          .eq('organization_id', profile.id),
        supabase
          .from('advertisements')
          .select('id')
          .eq('is_active', true)
          .in('field_id', 
            supabase
              .from('fields')
              .select('id')
              .eq('organization_id', profile.id)
          )
      ]);

      const fieldsCount = fieldsResult.count || 0;
      const adsCount = adsResult.data?.length || 0;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          fields_count: fieldsCount,
          active_ads_count: adsCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      await refreshProfile();
    } catch (error) {
      console.error('Error updating user counts:', error);
    }
  };

  const updateUserPlan = async (planTier: 'covered_game' | 'game_day' | 'season_pass', commissionPct?: number) => {
    if (!profile) return;
    
    try {
      const newCommissionPct = commissionPct || (
        planTier === 'covered_game' ? 60 :
        planTier === 'game_day' ? 20 :
        planTier === 'season_pass' ? 10 : 60
      );

      const { error } = await supabase
        .from('profiles')
        .update({ 
          plan_tier: planTier,
          commission_pct: newCommissionPct,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      await refreshProfile();
      
      toast({
        title: "Plan updated",
        description: `Your plan has been updated to ${planTier}`,
      });
    } catch (error) {
      console.error('Error updating user plan:', error);
      toast({
        title: "Error",
        description: "Failed to update plan",
        variant: "destructive",
      });
    }
  };

  const canAccessFeature = (feature: 'scoreboard' | 'ads' | 'analytics') => {
    if (!profile) return false;

    switch (feature) {
      case 'scoreboard':
        return profile.plan_tier === 'game_day' || 
               profile.plan_tier === 'season_pass' ||
               (profile.plan_tier === 'covered_game' && 
                (profile.total_games_played < 2 || profile.active_ads_count >= profile.fields_count));
      
      case 'ads':
        return true; // All users can create ads
      
      case 'analytics':
        return profile.plan_tier === 'season_pass';
      
      default:
        return false;
    }
  };

  const getRemainingTrialGames = () => {
    if (!profile || profile.plan_tier !== 'covered_game') return 0;
    return Math.max(0, 2 - profile.total_games_played);
  };

  const needsSponsors = () => {
    if (!profile || profile.plan_tier !== 'covered_game') return false;
    return profile.total_games_played >= 2 && profile.active_ads_count < profile.fields_count;
  };

  return {
    profile,
    incrementGamesPlayed,
    updateUserCounts,
    updateUserPlan,
    canAccessFeature,
    getRemainingTrialGames,
    needsSponsors,
    refreshProfile
  };
};
