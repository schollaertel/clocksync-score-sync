
import { useMemo } from 'react';
import type { UserProfile } from '@/types/auth';

export const useAuthPermissions = (profile: UserProfile | null) => {
  // Calculate permissions based on plan tier and usage
  const canAccessScoreboard = useMemo(() => {
    if (!profile) return false;
    
    switch (profile.plan_tier) {
      case 'game_day':
      case 'season_pass':
        return true;
      case 'covered_game':
        return profile.total_games_played < 2 || profile.active_ads_count >= profile.fields_count;
      default:
        return false;
    }
  }, [profile]);

  const canCreateAds = useMemo(() => {
    if (!profile) return false;
    return true;
  }, [profile]);

  return {
    canAccessScoreboard,
    canCreateAds
  };
};
