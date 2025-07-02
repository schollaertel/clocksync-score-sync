
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

  console.log('AuthProvider: Current state', { 
    user: !!user, 
    profile: !!profile, 
    loading,
    userId: user?.id 
  });

  const fetchProfile = async (userId: string) => {
    console.log('AuthProvider: fetchProfile called for user', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('AuthProvider: Error fetching profile:', error);
        // If profile doesn't exist, create a basic one
        if (error.code === 'PGRST116') {
          console.log('AuthProvider: Profile not found, user needs to complete setup');
          return null;
        }
        throw error;
      }

      console.log('AuthProvider: Profile fetched successfully', data);

      // Ensure all required fields are present with defaults
      const profileData: UserProfile = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        organization: data.organization,
        plan_tier: (data.plan_tier as PlanTier) || 'covered_game',
        commission_pct: data.commission_pct ?? 60,
        total_games_played: data.total_games_played ?? 0,
        active_ads_count: data.active_ads_count ?? 0,
        fields_count: data.fields_count ?? 0,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return profileData;
    } catch (error) {
      console.error('AuthProvider: Error in fetchProfile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    console.log('AuthProvider: refreshProfile called');
    if (!user) {
      console.log('AuthProvider: No user for profile refresh');
      return;
    }
    
    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
  };

  useEffect(() => {
    console.log('AuthProvider: Setting up auth listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthProvider: Auth state changed:', event, session?.user?.email);
        
        // Update session and user synchronously
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetching to avoid blocking auth state changes
        if (session?.user) {
          console.log('AuthProvider: User found, fetching profile...');
          setTimeout(() => {
            fetchProfile(session.user.id).then(profileData => {
              console.log('AuthProvider: Profile fetch completed', !!profileData);
              setProfile(profileData);
              setLoading(false);
            }).catch(error => {
              console.error('AuthProvider: Profile fetch failed:', error);
              setProfile(null);
              setLoading(false);
            });
          }, 0);
        } else {
          console.log('AuthProvider: No user, clearing profile');
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    console.log('AuthProvider: Checking for existing session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthProvider: Initial session check', !!session?.user);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('AuthProvider: Initial user found, fetching profile...');
        fetchProfile(session.user.id).then(profileData => {
          console.log('AuthProvider: Initial profile fetch completed', !!profileData);
          setProfile(profileData);
          setLoading(false);
        }).catch(error => {
          console.error('AuthProvider: Initial profile fetch failed:', error);
          setProfile(null);
          setLoading(false);
        });
      } else {
        console.log('AuthProvider: No initial session');
        setLoading(false);
      }
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth listener');
      subscription.unsubscribe();
    };
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
    return true;
  }, [profile]);

  const signUp = async (email: string, password: string, fullName: string, organization: string) => {
    console.log('AuthProvider: signUp called');
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
    
    console.log('AuthProvider: signUp result', { error });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: signIn called');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('AuthProvider: signIn result', { error });
    return { error };
  };

  const signOut = async () => {
    console.log('AuthProvider: signOut called');
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
