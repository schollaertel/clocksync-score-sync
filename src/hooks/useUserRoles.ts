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

  console.log('useUserRoles: Hook called', { userId: user?.id, loading });

  useEffect(() => {
    console.log('useUserRoles: Effect triggered', { userId: user?.id });
    
    if (!user) {
      console.log('useUserRoles: No user, setting defaults');
      setRoles([]);
      setPrimaryRole('spectator'); // Default role for unauthenticated users
      setLoading(false);
      setError(null);
      return;
    }

    const fetchRoles = async () => {
      console.log('useUserRoles: Fetching roles for user', user.id);
      setLoading(true);
      
      try {
        // Simplified query without complex RLS
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id);

        console.log('useUserRoles: Raw query result', { data, error });

        if (error) {
          console.error('useUserRoles: Query error:', error);
          // Don't throw, just handle gracefully
          setRoles([]);
          setPrimaryRole('spectator'); // Default fallback role
          setError(null); // Don't show error to user for missing roles
          return;
        }

        const userRoles = data || [];
        console.log('useUserRoles: User roles found:', userRoles);
        setRoles(userRoles);
        
        // Determine primary role based on hierarchy
        let primary: AppRole = 'spectator'; // Default
        
        if (userRoles.length > 0) {
          // Role hierarchy: super_admin > admin > director > scorekeeper > spectator
          if (userRoles.some(r => r.role === 'super_admin')) {
            primary = 'super_admin';
          } else if (userRoles.some(r => r.role === 'admin')) {
            primary = 'admin';
          } else if (userRoles.some(r => r.role === 'director')) {
            primary = 'director';
          } else if (userRoles.some(r => r.role === 'scorekeeper')) {
            primary = 'scorekeeper';
          }
        }
        
        console.log('useUserRoles: Primary role determined:', primary);
        setPrimaryRole(primary);
        setError(null);
        
      } catch (error) {
        console.error('useUserRoles: Fetch error:', error);
        setError('Failed to load user roles');
        setRoles([]);
        setPrimaryRole('spectator'); // Safe fallback
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user?.id]); // Only depend on user ID

  const hasRole = (role: AppRole): boolean => {
    const result = roles.some(r => r.role === role);
    console.log('useUserRoles: hasRole check', { role, result });
    return result;
  };

  const canManageFields = (): boolean => {
    const result = hasRole('super_admin') || hasRole('admin') || hasRole('director');
    console.log('useUserRoles: canManageFields', result);
    return result;
  };

  const canManageGames = (): boolean => {
    const result = hasRole('super_admin') || hasRole('admin') || hasRole('director');
    console.log('useUserRoles: canManageGames', result);
    return result;
  };

  const canOperateScoreboard = (): boolean => {
    const result = hasRole('super_admin') || hasRole('admin') || hasRole('director') || hasRole('scorekeeper');
    console.log('useUserRoles: canOperateScoreboard', result);
    return result;
  };

  console.log('useUserRoles: Returning state', {
    rolesCount: roles.length,
    primaryRole,
    loading,
    error: !!error
  });

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
