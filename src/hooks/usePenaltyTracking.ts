import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Penalty } from '@/types/game';

export const usePenaltyTracking = (gameId: string) => {
  const { toast } = useToast();
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    fetchPenalties();

    // Set up real-time subscription
    const channel = supabase
      .channel('penalty-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'penalties',
          filter: `game_id=eq.${gameId}`
        },
        () => {
          fetchPenalties();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const fetchPenalties = async () => {
    try {
      const { data, error } = await supabase
        .from('penalties')
        .select('*')
        .eq('game_id', gameId)
        .eq('is_active', true)
        .order('started_at', { ascending: false });

      if (error) throw error;
      
      const transformedPenalties: Penalty[] = (data || []).map(p => ({
        id: p.id,
        game_id: p.game_id,
        team: p.team as 'home' | 'away',
        player_name: p.player_name,
        penalty_type: p.penalty_type,
        duration_minutes: p.duration_minutes,
        started_at: p.started_at,
        expires_at: p.expires_at,
        is_active: p.is_active,
        created_at: p.created_at
      }));

      setPenalties(transformedPenalties);
    } catch (error) {
      console.error('Error fetching penalties:', error);
    }
  };

  const addPenalty = async (penaltyData: {
    team: 'home' | 'away';
    player_name: string;
    penalty_type: string;
    duration_minutes: number;
  }) => {
    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + penaltyData.duration_minutes);

      const { error } = await supabase
        .from('penalties')
        .insert([{
          game_id: gameId,
          ...penaltyData,
          expires_at: expiresAt.toISOString()
        }]);

      if (error) throw error;

      // Log game event
      await supabase.from('game_events').insert([{
        game_id: gameId,
        event_type: 'penalty',
        description: `${penaltyData.penalty_type} penalty on ${penaltyData.player_name}`,
        metadata: { penaltyData }
      }]);

      toast({
        title: 'Penalty Added',
        description: `${penaltyData.penalty_type} penalty for ${penaltyData.player_name}`,
      });
    } catch (error) {
      console.error('Error adding penalty:', error);
      toast({
        title: 'Error',
        description: 'Failed to add penalty',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const expirePenalty = async (penaltyId: string) => {
    try {
      const { error } = await supabase
        .from('penalties')
        .update({ is_active: false })
        .eq('id', penaltyId);

      if (error) throw error;

      toast({
        title: 'Penalty Expired',
        description: 'Penalty has been manually expired',
      });
    } catch (error) {
      console.error('Error expiring penalty:', error);
      toast({
        title: 'Error',
        description: 'Failed to expire penalty',
        variant: 'destructive',
      });
    }
  };

  return {
    penalties,
    loading,
    addPenalty,
    expirePenalty,
    refetch: fetchPenalties
  };
};
