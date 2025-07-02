
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRole, UserRole } from '@/types/user';

export const useUserRoles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [primaryRole, setPrimaryRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useUserRoles: user changed', user?.id);
    
    if (!user) {
      console.log('useUserRoles: no user, setting defaults');
      setRoles([]);
      setPrimaryRole(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchRoles = async () => {
      try {
        console.log('useUserRoles: fetching roles for user', user.id);
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('useUserRoles: error fetching roles', error);
          throw error;
        }

        console.log('useUserRoles: roles data', data);
        setRoles(data || []);
        
        // Get primary role using the database function
        const { data: roleData, error: roleError } = await supabase
          .rpc('get_user_role', { _user_id: user.id });

        if (roleError) {
          console.error('useUserRoles: error fetching primary role', roleError);
          // Don't throw here, just log it and continue
        } else {
          console.log('useUserRoles: primary role', roleData);
          setPrimaryRole(roleData as AppRole);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setError('Failed to load user roles');
        // Set default role as spectator if no roles found
        setRoles([]);
        setPrimaryRole('spectator');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  const hasRole = (role: AppRole): boolean => {
    return roles.some(r => r.role === role);
  };

  const canManageFields = (): boolean => {
    return hasRole('super_admin') || hasRole('admin') || hasRole('director');
  };

  const canManageGames = (): boolean => {
    return hasRole('super_admin') || hasRole('admin') || hasRole('director');
  };

  const canOperateScoreboard = (): boolean => {
    return hasRole('super_admin') || hasRole('admin') || hasRole('director') || hasRole('scorekeeper');
  };

  return {
    roles,
    primaryRole,
    loading,
    error,
    hasRole,
    canManageFields,
    canManageGames,
    canOperateScoreboard
  };
};
