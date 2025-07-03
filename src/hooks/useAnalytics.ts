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

      // Fetch basic counts with proper queries
      const [fieldsResult, gamesResult, spectatorResult, revenueResult] = await Promise.all([
        // Total fields owned by user
        supabase.from('fields').select('id', { count: 'exact' }).eq('organization_id', user.id),
        
        // Games for user's fields with proper JOIN
        supabase
          .from('games')
          .select('*, fields!inner(organization_id)', { count: 'exact' })
          .eq('fields.organization_id', user.id),
        
        // Spectator analytics for user's fields
        supabase
          .from('spectator_analytics')
          .select('page_views, fields!inner(organization_id)', { count: 'exact' })
          .eq('fields.organization_id', user.id),
        
        // Revenue data
        supabase
          .from('revenue_analytics')
          .select('subscription_revenue, sponsor_revenue, platform_fees')
          .eq('organization_id', user.id)
          .gte('month_year', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 7))
      ]);

      // Get QR scans for today for user's fields
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const scansResult = await supabase
        .from('qr_code_scans')
        .select('id, fields!inner(organization_id)', { count: 'exact' })
        .eq('fields.organization_id', user.id)
        .gte('scan_time', todayStart.toISOString());

      // Calculate active games
      const activeGames = gamesResult.data?.filter(g => g.game_status === 'active').length || 0;

      // Calculate total revenue
      const totalRevenue = revenueResult.data?.reduce((sum, record) => 
        sum + (record.subscription_revenue || 0) + (record.sponsor_revenue || 0), 0) || 0;

      // Get fields with advertisements for top fields calculation
      const fieldsWithAds = await supabase
        .from('fields')
        .select(`
          id,
          name,
          advertisements(monthly_rate, is_active)
        `)
        .eq('organization_id', user.id);

      // Calculate top fields by getting scan counts and revenue separately
      const topFieldsData = await Promise.all(
        (fieldsWithAds.data || []).map(async (field) => {
          const scansCount = await supabase
            .from('qr_code_scans')
            .select('id', { count: 'exact' })
            .eq('field_id', field.id);

          const revenue = field.advertisements
            ?.filter((ad: any) => ad.is_active)
            ?.reduce((sum: number, ad: any) => sum + (ad.monthly_rate || 0), 0) || 0;

          return {
            name: field.name,
            scans: scansCount.count || 0,
            revenue
          };
        })
      );

      const analyticsData: AnalyticsData = {
        totalFields: fieldsResult.count || 0,
        totalGames: gamesResult.count || 0,
        activeGames,
        totalSpectatorViews: spectatorResult.data?.reduce((sum, record) => sum + (record.page_views || 0), 0) || 0,
        qrScansToday: scansResult.count || 0,
        revenueThisMonth: totalRevenue,
        topFields: topFieldsData.sort((a, b) => (b.scans + b.revenue) - (a.scans + a.revenue)).slice(0, 5),
        monthlyGrowth: [] // Would need historical data implementation
      };

      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
      
      // Set empty data to prevent crashes
      setData({
        totalFields: 0,
        totalGames: 0,
        activeGames: 0,
        totalSpectatorViews: 0,
        qrScansToday: 0,
        revenueThisMonth: 0,
        topFields: [],
        monthlyGrowth: []
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
