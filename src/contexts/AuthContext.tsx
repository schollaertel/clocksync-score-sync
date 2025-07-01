
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type PlanTier = 'covered_game' | 'game_day' | 'season_pass';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  organization: string;
  plan_tier: PlanTier;
  commission_pct: number;
  total_games_played: number;
  active_ads_count: number;
  fields_count: number;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  signUp: (email: string, password: string, fullName: string, organization: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  canAccessScoreboard: boolean;
  canCreateAds: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      // Ensure all required fields are present with defaults
      const profileData: UserProfile = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        organization: data.organization,
        plan_tier: data.plan_tier || 'covered_game',
        commission_pct: data.commission_pct || 60,
        total_games_played: data.total_games_played || 0,
        active_ads_count: data.active_ads_count || 0,
        fields_count: data.fields_count || 0,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return profileData;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Calculate permissions based on plan tier and usage
  const canAccessScoreboard = React.useMemo(() => {
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

  const canCreateAds = React.useMemo(() => {
    if (!profile) return false;
    
    // All users can create ads, but covered_game users need them for unlimited access
    return true;
  }, [profile]);

  const signUp = async (email: string, password: string, fullName: string, organization: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          organization: organization,
        }
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      signUp,
      signIn,
      signOut,
      loading,
      canAccessScoreboard,
      canCreateAds,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
