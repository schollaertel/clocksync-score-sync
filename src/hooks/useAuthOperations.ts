import { supabase } from '@/integrations/supabase/client';
import type { OrganizationType } from '@/types/auth';

export const useAuthOperations = () => {
  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    organization: string, 
    organizationType: OrganizationType = 'individual'
  ) => {
    console.log('useAuthOperations: signUp called');
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          organization: organization,
          organization_type: organizationType,
        }
      }
    });
    
    console.log('useAuthOperations: signUp result', { error });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('useAuthOperations: signIn called');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('useAuthOperations: signIn result', { error });
    return { error };
  };

  const signOut = async () => {
    console.log('useAuthOperations: signOut called');
    await supabase.auth.signOut();
  };

  return {
    signUp,
    signIn,
    signOut
  };
};
