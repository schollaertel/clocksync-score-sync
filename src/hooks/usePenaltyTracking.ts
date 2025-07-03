import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Penalty } from '@/types/game';

export const usePenaltyTracking = (gameId: string) => {
  const { toast } = useToast();
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(false);

  // Auto-expire penalties that have passed their expiration time
  const checkExpiredPenalties = useCallback(async () => {
    const now = new Date();
    const expiredPenalties = penalties.filter(p => 
      p.is_active && new Date(p.expires_at) <= now
    );

    for (const penalty of expiredPenalties) {
      await expirePenalty(penalty.id, true); // true = auto-expired
    }
  }, [penalties]);

  // Check for expired penalties every second
  useEffect(() => {
    const interval = setInterval(checkExpiredPenalties, 1000);
    return () => clearInterval(interval);
  }, [checkExpiredPenalties]);

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

      // Play audio alert
      playAudioAlert('penalty');

      // Send push notification
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'penalty',
            gameId: gameId,
            message: `${penaltyData.penalty_type} penalty on ${penaltyData.player_name} - ${penaltyData.duration_minutes} minutes`
          }
        });
      } catch (notificationError) {
        console.log('Failed to send push notification:', notificationError);
      }

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

  const expirePenalty = async (penaltyId: string, autoExpired = false) => {
    try {
      const { error } = await supabase
        .from('penalties')
        .update({ is_active: false })
        .eq('id', penaltyId);

      if (error) throw error;

      if (autoExpired) {
        playAudioAlert('penalty_end');
        
        // Send push notification for auto-expired penalty
        try {
          await supabase.functions.invoke('send-notification', {
            body: {
              type: 'penalty_end',
              gameId: gameId,
              message: 'Penalty time has expired - player can return to play'
            }
          });
        } catch (notificationError) {
          console.log('Failed to send penalty expiration notification:', notificationError);
        }

        toast({
          title: 'Penalty Expired',
          description: 'A penalty has automatically expired',
        });
      } else {
        toast({
          title: 'Penalty Ended',
          description: 'Penalty has been manually ended',
        });
      }
    } catch (error) {
      console.error('Error expiring penalty:', error);
      toast({
        title: 'Error',
        description: 'Failed to expire penalty',
        variant: 'destructive',
      });
    }
  };

  // Audio alert system
  const playAudioAlert = (type: 'penalty' | 'penalty_end' | 'goal') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const createBeep = (frequency: number, duration: number, volume: number = 0.5) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      };

      switch (type) {
        case 'penalty':
          // Two quick high beeps for penalty
          createBeep(800, 0.2);
          setTimeout(() => createBeep(800, 0.2), 300);
          break;
        case 'penalty_end':
          // Three descending beeps for penalty end
          createBeep(600, 0.3);
          setTimeout(() => createBeep(500, 0.3), 400);
          setTimeout(() => createBeep(400, 0.4), 800);
          break;
        case 'goal':
          // Ascending celebration sound for goal
          createBeep(400, 0.2);
          setTimeout(() => createBeep(500, 0.2), 200);
          setTimeout(() => createBeep(600, 0.3), 400);
          break;
      }
    } catch (error) {
      console.log('Audio alert failed:', error);
    }
  };

  return {
    penalties,
    loading,
    addPenalty,
    expirePenalty,
    refetch: fetchPenalties,
    playAudioAlert
  };
};
