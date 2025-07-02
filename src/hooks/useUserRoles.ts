
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRole, UserRole } from '@/types/user';

export const useUserRoles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [primaryRole, setPrimaryRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setPrimaryRole(null);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        setRoles(data || []);
        
        // Get primary role using the database function
        const { data: roleData, error: roleError } = await supabase
          .rpc('get_user_role', { _user_id: user.id });

        if (!roleError && roleData) {
          setPrimaryRole(roleData as AppRole);
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
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
    hasRole,
    canManageFields,
    canManageGames,
    canOperateScoreboard
  };
};
