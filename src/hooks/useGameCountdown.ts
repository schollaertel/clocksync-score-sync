import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Game } from '@/types/game';

export const useGameCountdown = (game: Game | null) => {
  const [localTimeRemaining, setLocalTimeRemaining] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());

  // Sync with database every 15 seconds
  const syncWithDatabase = useCallback(async () => {
    if (!game || game.game_status !== 'active') return;

    try {
      const { data, error } = await supabase
        .from('games')
        .select('time_remaining, last_updated')
        .eq('id', game.id)
        .single();

      if (error) {
        console.error('Failed to sync game time:', error);
        return;
      }

      if (data) {
        setLocalTimeRemaining(data.time_remaining || 0);
        setLastSyncTime(Date.now());
      }
    } catch (error) {
      console.error('Database sync error:', error);
    }
  }, [game]);

  // Update local countdown every second
  useEffect(() => {
    if (!game) {
      setLocalTimeRemaining(0);
      return;
    }

    setLocalTimeRemaining(game.time_remaining || 0);
    setLastSyncTime(Date.now());

    if (game.game_status !== 'active') {
      return;
    }

    const interval = setInterval(() => {
      setLocalTimeRemaining(prev => {
        const newTime = Math.max(0, prev - 1);
        
        // Update database every 15 seconds
        const timeSinceLastSync = Date.now() - lastSyncTime;
        if (timeSinceLastSync >= 15000) {
          supabase
            .from('games')
            .update({ 
              time_remaining: newTime,
              last_updated: new Date().toISOString()
            })
            .eq('id', game.id)
            .then(() => {
              setLastSyncTime(Date.now());
            })
            .catch(error => {
              console.error('Failed to update game time:', error);
            });
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [game, lastSyncTime]);

  // Sync with database every 15 seconds
  useEffect(() => {
    if (!game || game.game_status !== 'active') return;

    const syncInterval = setInterval(syncWithDatabase, 15000);
    return () => clearInterval(syncInterval);
  }, [syncWithDatabase, game]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeRemaining: localTimeRemaining,
    formattedTime: formatTime(localTimeRemaining),
    isActive: game?.game_status === 'active'
  };
};
