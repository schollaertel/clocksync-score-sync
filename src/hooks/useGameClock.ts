import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Game } from '@/types/game';

interface UseGameClockProps {
  game: Game | null;
  isScorekeeper?: boolean;
}

export const useGameClock = ({ game, isScorekeeper = false }: UseGameClockProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  
  // Use refs to avoid stale closure issues
  const gameRef = useRef(game);
  const timeRef = useRef(0);
  const isActiveRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dbUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Update refs when state changes
  useEffect(() => {
    gameRef.current = game;
    timeRef.current = timeRemaining;
    isActiveRef.current = isActive;
  }, [game, timeRemaining, isActive]);

  // Local timer functions (declared early to avoid dependency issues)
  const stopLocalTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (dbUpdateRef.current) {
      clearInterval(dbUpdateRef.current);
      dbUpdateRef.current = null;
    }
  }, []);

  const startLocalTimer = useCallback(() => {
    // Clear existing timer
    stopLocalTimer();

    // Start local countdown timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = Math.max(0, prev - 1);
        timeRef.current = newTime;
        
        // Auto-complete game when time reaches 0 (scorekeeper only)
        if (newTime === 0 && isScorekeeper && gameRef.current?.id) {
          supabase
            .from('games')
            .update({ 
              time_remaining: 0,
              game_status: 'completed'
            })
            .eq('id', gameRef.current.id)
            .then(({ error }) => {
              if (error) console.error('Error completing game:', error);
            });
          
          // Stop local timer
          stopLocalTimer();
        }
        
        return newTime;
      });
    }, 1000);

    // Scorekeeper: Periodic database updates
    if (isScorekeeper) {
      dbUpdateRef.current = setInterval(() => {
        if (gameRef.current?.id && isActiveRef.current && timeRef.current > 0) {
          supabase
            .from('games')
            .update({ time_remaining: timeRef.current })
            .eq('id', gameRef.current.id)
            .then(({ error }) => {
              if (error) console.error('Error updating game time:', error);
            });
        }
      }, 5000); // Update database every 5 seconds
    }
  }, [isScorekeeper, stopLocalTimer]);

  // Initialize time from game data
  useEffect(() => {
    if (game) {
      const newTime = game.time_remaining || 0;
      const newActive = game.game_status === 'active';
      
      setTimeRemaining(newTime);
      setIsActive(newActive);
      
      // Start local timer if game is active
      if (newActive && newTime > 0) {
        startLocalTimer();
      } else {
        stopLocalTimer();
      }
    }
  }, [game?.id, game?.time_remaining, game?.game_status, startLocalTimer, stopLocalTimer]);

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
          const newTime = updatedGame.time_remaining || 0;
          const newActive = updatedGame.game_status === 'active';
          
          // Sync local state with database state
          setTimeRemaining(newTime);
          setIsActive(newActive);
          
          // Restart timer with new state
          if (newActive && newTime > 0) {
            startLocalTimer();
          } else {
            stopLocalTimer();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      stopLocalTimer();
    };
  }, [game?.id, startLocalTimer, stopLocalTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocalTimer();
    };
  }, [stopLocalTimer]);

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
