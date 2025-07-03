import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RevenueData {
  monthlyRevenue: number;
  yearlyRevenue: number;
  sponsorRevenue: number;
  subscriptionRevenue: number;
  platformFees: number;
  growthRate: number;
  revenueByField: Array<{
    fieldName: string;
    revenue: number;
    sponsors: number;
  }>;
  monthlyBreakdown: Array<{
    month: string;
    subscription: number;
    sponsor: number;
    total: number;
  }>;
}

export const useRevenue = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRevenue();
    }
  }, [user]);

  const fetchRevenue = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch revenue analytics
      const { data: revenueData, error } = await supabase
        .from('revenue_analytics')
        .select('*')
        .eq('organization_id', user.id)
        .order('month_year', { ascending: false });

      if (error) throw error;

      // Calculate current month revenue (fix date comparison)
      const currentMonth = new Date();
      const currentMonthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-01`;
      
      const currentMonthData = revenueData?.find(r => 
        r.month_year === currentMonthStr
      );

      // Calculate yearly revenue
      const currentYear = new Date().getFullYear();
      const yearlyData = revenueData?.filter(r => {
        const recordYear = new Date(r.month_year).getFullYear();
        return recordYear === currentYear;
      }) || [];

      const yearlyRevenue = yearlyData.reduce((sum, record) => 
        sum + (record.subscription_revenue || 0) + (record.sponsor_revenue || 0), 0);

      // Fetch field-specific revenue with proper error handling
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('fields')
        .select(`
          name,
          advertisements(monthly_rate, is_active)
        `)
        .eq('organization_id', user.id);

      if (fieldsError) throw fieldsError;

      const revenueByField = fieldsData?.map(field => ({
        fieldName: field.name,
        revenue: field.advertisements
          ?.filter((ad: any) => ad.is_active)
          ?.reduce((sum: number, ad: any) => sum + (ad.monthly_rate || 0), 0) || 0,
        sponsors: field.advertisements?.filter((ad: any) => ad.is_active).length || 0
      })) || [];

      const revenue: RevenueData = {
        monthlyRevenue: (currentMonthData?.subscription_revenue || 0) + (currentMonthData?.sponsor_revenue || 0),
        yearlyRevenue,
        sponsorRevenue: currentMonthData?.sponsor_revenue || 0,
        subscriptionRevenue: currentMonthData?.subscription_revenue || 0,
        platformFees: currentMonthData?.platform_fees || 0,
        growthRate: 0, // Would need previous month data to calculate
        revenueByField,
        monthlyBreakdown: revenueData?.slice(0, 12).map(record => ({
          month: new Date(record.month_year).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          subscription: record.subscription_revenue || 0,
          sponsor: record.sponsor_revenue || 0,
          total: (record.subscription_revenue || 0) + (record.sponsor_revenue || 0)
        })) || []
      };

      setData(revenue);
    } catch (error) {
      console.error('Error fetching revenue:', error);
      toast({
        title: 'Error',
        description: 'Failed to load revenue data',
        variant: 'destructive',
      });
      
      // Set empty data to prevent crashes
      setData({
        monthlyRevenue: 0,
        yearlyRevenue: 0,
        sponsorRevenue: 0,
        subscriptionRevenue: 0,
        platformFees: 0,
        growthRate: 0,
        revenueByField: [],
        monthlyBreakdown: []
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    refetch: fetchRevenue
  };
};
