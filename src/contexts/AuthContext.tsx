
import React, { createContext, useContext } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { useProfileManager } from '@/hooks/useProfileManager';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { useAuthPermissions } from '@/hooks/useAuthPermissions';
import type { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, loading, setLoading } = useAuthState();
  const { profile, refreshProfile } = useProfileManager(user, setLoading);
  const { signUp, signIn, signOut } = useAuthOperations();
  const { canAccessScoreboard, canCreateAds } = useAuthPermissions(profile);

  console.log('AuthProvider: Current state', { 
    user: !!user, 
    profile: !!profile, 
    loading,
    userId: user?.id 
  });

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
