
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAuthState: Setting up auth listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('useAuthState: Auth state changed:', event, session?.user?.email);
        
        // Update session and user synchronously
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          console.log('useAuthState: No user, setting loading to false');
          setLoading(false);
        }
      }
    );

    // Check for existing session
    console.log('useAuthState: Checking for existing session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('useAuthState: Initial session check', !!session?.user);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        console.log('useAuthState: No initial session');
        setLoading(false);
      }
    });

    return () => {
      console.log('useAuthState: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    loading,
    setLoading
  };
};
