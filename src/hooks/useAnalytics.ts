import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalFields: number;
  totalGames: number;
  activeGames: number;
  totalSpectatorViews: number;
  qrScansToday: number;
  revenueThisMonth: number;
  topFields: Array<{
    name: string;
    scans: number;
    revenue: number;
  }>;
  monthlyGrowth: Array<{
    month: string;
    games: number;
    revenue: number;
    spectators: number;
  }>;
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch basic counts
      const [fieldsResult, gamesResult, spectatorResult, scansResult] = await Promise.all([
        supabase.from('fields').select('id', { count: 'exact' }).eq('organization_id', user.id),
        supabase.from('games').select('id, game_status', { count: 'exact' }).eq('fields.organization_id', user.id),
        supabase.from('spectator_analytics').select('page_views', { count: 'exact' }).eq('field_id', 'in').select('fields.organization_id').eq('fields.organization_id', user.id),
        supabase.from('qr_code_scans').select('id', { count: 'exact' }).gte('scan_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Fetch revenue data
      const revenueResult = await supabase
        .from('revenue_analytics')
        .select('subscription_revenue, sponsor_revenue, platform_fees')
        .eq('organization_id', user.id)
        .gte('month_year', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      // Calculate totals
      const totalRevenue = revenueResult.data?.reduce((sum, record) => 
        sum + (record.subscription_revenue || 0) + (record.sponsor_revenue || 0), 0) || 0;

      // Fetch top performing fields
      const topFieldsResult = await supabase
        .from('fields')
        .select(`
          name,
          qr_code_scans!inner(count),
          advertisements!inner(monthly_rate)
        `)
        .eq('organization_id', user.id)
        .limit(5);

      const analyticsData: AnalyticsData = {
        totalFields: fieldsResult.count || 0,
        totalGames: gamesResult.count || 0,
        activeGames: gamesResult.data?.filter(g => g.game_status === 'active').length || 0,
        totalSpectatorViews: spectatorResult.count || 0,
        qrScansToday: scansResult.count || 0,
        revenueThisMonth: totalRevenue,
        topFields: topFieldsResult.data?.map(field => ({
          name: field.name,
          scans: field.qr_code_scans?.length || 0,
          revenue: field.advertisements?.reduce((sum: number, ad: any) => sum + (ad.monthly_rate || 0), 0) || 0
        })) || [],
        monthlyGrowth: [] // Would need more complex query for historical data
      };

      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    refetch: fetchAnalytics
  };
};
