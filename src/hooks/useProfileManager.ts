import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { UserProfile, OrganizationType } from '@/types/auth';

export const useProfileManager = (user: User | null, setLoading: (loading: boolean) => void) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    console.log('useProfileManager: fetchProfile called for user', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('useProfileManager: Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          console.log('useProfileManager: Profile not found, waiting for creation...');
          return null;
        }
        throw error;
      }

      console.log('useProfileManager: Profile fetched successfully', data);

      // Ensure all required fields are present with defaults
      const profileData: UserProfile = {
        id: data.id,
        email: data.email,
        full_name: data.full_name || '',
        organization: data.organization || '',
        organization_type: (data.organization_type as OrganizationType) || 'individual',
        plan_tier: (data.plan_tier as UserProfile['plan_tier']) || 'covered_game',
        commission_pct: data.commission_pct ?? 60,
        total_games_played: data.total_games_played ?? 0,
        active_ads_count: data.active_ads_count ?? 0,
        fields_count: data.fields_count ?? 0,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };

      return profileData;
    } catch (error) {
      console.error('useProfileManager: Error in fetchProfile:', error);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    console.log('useProfileManager: refreshProfile called');
    if (!user) {
      console.log('useProfileManager: No user for profile refresh');
      return;
    }
    
    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
  }, [user, fetchProfile]);

  useEffect(() => {
    if (user) {
      console.log('useProfileManager: User found, fetching profile...');
      
      // Give a brief delay to allow profile creation trigger to complete
      const timeoutId = setTimeout(async () => {
        try {
          let profileData = await fetchProfile(user.id);
          
          // If profile doesn't exist yet, wait a bit and try again
          if (!profileData) {
            console.log('useProfileManager: Profile not found, retrying in 2 seconds...');
            setTimeout(async () => {
              profileData = await fetchProfile(user.id);
              setProfile(profileData);
              setLoading(false);
            }, 2000);
          } else {
            setProfile(profileData);
            setLoading(false);
          }
        } catch (error) {
          console.error('useProfileManager: Profile fetch failed:', error);
          setProfile(null);
          setLoading(false);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      console.log('useProfileManager: No user, clearing profile');
      setProfile(null);
      // Don't set loading to false here - let useAuthState handle it
    }
  }, [user, fetchProfile, setLoading]);

  return {
    profile,
    refreshProfile
  };
};
