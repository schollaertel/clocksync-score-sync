import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Game } from '@/types/game';

interface UseGameClockProps {
  game: Game | null;
  isScorekeeper?: boolean;
}

export const useGameClock = ({ game, isScorekeeper = false }: UseGameClockProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);

  // Initialize time from game data
  useEffect(() => {
    if (game) {
      setTimeRemaining(game.time_remaining || 0);
      setIsActive(game.game_status === 'active');
    }
  }, [game]);

  // Real-time sync - listen to database changes
  useEffect(() => {
    if (!game?.id) return;

    const channel = supabase
      .channel(`game_${game.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${game.id}`
        },
        (payload) => {
          const updatedGame = payload.new as Game;
          setTimeRemaining(updatedGame.time_remaining || 0);
          setIsActive(updatedGame.game_status === 'active');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [game?.id]);

  // Scorekeeper-only: Local countdown timer
  useEffect(() => {
    if (!isScorekeeper || !isActive || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = Math.max(0, prev - 1);
        
        // Update database every second when active
        if (game?.id) {
          supabase
            .from('games')
            .update({ time_remaining: newTime })
            .eq('id', game.id)
            .then(({ error }) => {
              if (error) console.error('Error updating game time:', error);
            });
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isScorekeeper, isActive, timeRemaining, game?.id]);

  // Format time for display
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Scorekeeper controls
  const startClock = useCallback(async () => {
    if (!game?.id || !isScorekeeper) return;
    
    const { error } = await supabase
      .from('games')
      .update({ 
        game_status: 'active',
        period_start_time: new Date().toISOString()
      })
      .eq('id', game.id);
      
    if (error) {
      console.error('Error starting clock:', error);
    }
  }, [game?.id, isScorekeeper]);

  const pauseClock = useCallback(async () => {
    if (!game?.id || !isScorekeeper) return;
    
    const { error } = await supabase
      .from('games')
      .update({ game_status: 'paused' })
      .eq('id', game.id);
      
    if (error) {
      console.error('Error pausing clock:', error);
    }
  }, [game?.id, isScorekeeper]);

  const resetClock = useCallback(async (newTime: number = 900) => {
    if (!game?.id || !isScorekeeper) return;
    
    const { error } = await supabase
      .from('games')
      .update({ 
        time_remaining: newTime,
        game_status: 'scheduled'
      })
      .eq('id', game.id);
      
    if (error) {
      console.error('Error resetting clock:', error);
    }
  }, [game?.id, isScorekeeper]);

  return {
    timeRemaining,
    isActive,
    formattedTime: formatTime(timeRemaining),
    startClock,
    pauseClock,
    resetClock
  };
};
