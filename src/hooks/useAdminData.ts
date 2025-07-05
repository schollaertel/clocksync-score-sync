import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminData {
  totalUsers: number;
  totalOrganizations: number;
  totalFields: number;
  totalRevenue: number;
  activeGames: number;
  recentUsers: Array<{
    id: string;
    email: string;
    full_name: string;
    organization: string;
    created_at: string;
  }>;
  platformAnalytics: Array<{
    date: string;
    total_organizations: number;
    total_mrr: number;
    platform_revenue: number;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    admin_email: string;
    created_at: string;
    target_id: string;
  }>;
}

export const useAdminData = () => {
  const { toast } = useToast();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch platform-wide statistics with proper error handling
      const [usersResult, fieldsResult, gamesResult, platformResult, auditResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(10),
        supabase.from('fields').select('id', { count: 'exact' }),
        supabase.from('games').select('game_status', { count: 'exact' }),
        supabase.from('platform_analytics').select('*').order('date', { ascending: false }).limit(30),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      // Check for errors in parallel queries
      if (usersResult.error) throw usersResult.error;
      if (fieldsResult.error) throw fieldsResult.error;
      if (gamesResult.error) throw gamesResult.error;
      if (platformResult.error) throw platformResult.error;
      if (auditResult.error) throw auditResult.error;

      const activeGames = gamesResult.data?.filter(g => g.game_status === 'active').length || 0;
      const totalRevenue = platformResult.data?.reduce((sum, record) => sum + (record.platform_revenue || 0), 0) || 0;

      // Fix organization count logic - count distinct organizations
      const organizationTypes = ['facility', 'tournament_company'];
      const totalOrganizations = usersResult.data?.filter(u => 
        u.organization_type && organizationTypes.includes(u.organization_type)
      ).length || 0;

      const adminData: AdminData = {
        totalUsers: usersResult.count || 0,
        totalOrganizations,
        totalFields: fieldsResult.count || 0,
        totalRevenue,
        activeGames,
        recentUsers: usersResult.data?.map(user => ({
          id: user.id,
          email: user.email || '',
          full_name: user.full_name || '',
          organization: user.organization || '',
          created_at: user.created_at || ''
        })) || [],
        platformAnalytics: platformResult.data?.map(record => ({
          date: record.date,
          total_organizations: record.total_organizations || 0,
          total_mrr: record.total_mrr || 0,
          platform_revenue: record.platform_revenue || 0
        })) || [],
        auditLogs: auditResult.data?.map(log => ({
          id: log.id,
          action: log.action || '',
          admin_email: log.admin_email || '',
          created_at: log.created_at || '',
          target_id: log.target_id || ''
        })) || []
      };

      setData(adminData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive',
      });
      
      // Set empty data to prevent crashes
      setData({
        totalUsers: 0,
        totalOrganizations: 0,
        totalFields: 0,
        totalRevenue: 0,
        activeGames: 0,
        recentUsers: [],
        platformAnalytics: [],
        auditLogs: []
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    refetch: fetchAdminData
  };
};
