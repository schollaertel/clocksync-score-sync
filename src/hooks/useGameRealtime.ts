import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Game } from '@/types/game';

export interface GameRealtimeData {
  game: Game | null;
  isLoading: boolean;
  error: string | null;
}

export const useGameRealtime = (gameId?: string, fieldId?: string): GameRealtimeData => {
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId && !fieldId) {
      setIsLoading(false);
      return;
    }

    const fetchGame = async () => {
      try {
        let query = supabase
          .from('games')
          .select(`
            *,
            fields (
              name,
              location
            )
          `);

        if (gameId) {
          query = query.eq('id', gameId);
        } else if (fieldId) {
          // Get the most recent active game for this field, or the latest scheduled game
          const { data: activeGames } = await supabase
            .from('games')
            .select(`
              *,
              fields (
                name,
                location
              )
            `)
            .eq('field_id', fieldId)
            .eq('game_status', 'active')
            .order('scheduled_time', { ascending: false })
            .limit(1);

          if (activeGames && activeGames.length > 0) {
            const gameData = activeGames[0];
            const transformedGame: Game = {
              id: gameData.id,
              field_id: gameData.field_id || '',
              home_team: gameData.home_team,
              away_team: gameData.away_team,
              home_team_logo_url: gameData.home_team_logo_url || undefined,
              away_team_logo_url: gameData.away_team_logo_url || undefined,
              home_score: gameData.home_score || 0,
              away_score: gameData.away_score || 0,
              scheduled_time: gameData.scheduled_time,
              game_status: gameData.game_status as Game['game_status'],
              time_remaining: gameData.time_remaining || 900,
              created_at: gameData.created_at || new Date().toISOString(),
              current_period: gameData.current_period || 1,
              total_periods: gameData.total_periods || 2,
              period_length_minutes: gameData.period_length_minutes || 15,
              intermission_length_minutes: gameData.intermission_length_minutes || 5,
              period_start_time: gameData.period_start_time || undefined,
              last_updated: gameData.last_updated || undefined
            };
            setGame(transformedGame);
            setIsLoading(false);
            return;
          }

          // If no active games, get the most recent game for this field
          query = query.eq('field_id', fieldId).order('scheduled_time', { ascending: false }).limit(1);
        }

        const { data, error } = await query.single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No game found
            setGame(null);
            setError('No game found');
          } else {
            throw error;
          }
        } else if (data) {
          const transformedGame: Game = {
            id: data.id,
            field_id: data.field_id || '',
            home_team: data.home_team,
            away_team: data.away_team,
            home_team_logo_url: data.home_team_logo_url || undefined,
            away_team_logo_url: data.away_team_logo_url || undefined,
            home_score: data.home_score || 0,
            away_score: data.away_score || 0,
            scheduled_time: data.scheduled_time,
            game_status: data.game_status as Game['game_status'],
            time_remaining: data.time_remaining || 900,
            created_at: data.created_at || new Date().toISOString(),
            current_period: data.current_period || 1,
            total_periods: data.total_periods || 2,
            period_length_minutes: data.period_length_minutes || 15,
            intermission_length_minutes: data.intermission_length_minutes || 5,
            period_start_time: data.period_start_time || undefined,
            last_updated: data.last_updated || undefined
          };
          setGame(transformedGame);
        }
      } catch (err) {
        console.error('Error fetching game:', err);
        setError('Failed to load game');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGame();

    // Set up real-time subscription
    const gameChannel = supabase
      .channel('game-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: gameId ? `id=eq.${gameId}` : `field_id=eq.${fieldId}`
        },
        (payload) => {
          console.log('Real-time game update:', payload);
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedGame = payload.new as any;
            const transformedGame: Game = {
              id: updatedGame.id,
              field_id: updatedGame.field_id || '',
              home_team: updatedGame.home_team,
              away_team: updatedGame.away_team,
              home_team_logo_url: updatedGame.home_team_logo_url || undefined,
              away_team_logo_url: updatedGame.away_team_logo_url || undefined,
              home_score: updatedGame.home_score || 0,
              away_score: updatedGame.away_score || 0,
              scheduled_time: updatedGame.scheduled_time,
              game_status: updatedGame.game_status as Game['game_status'],
              time_remaining: updatedGame.time_remaining || 900,
              created_at: updatedGame.created_at || new Date().toISOString(),
              current_period: updatedGame.current_period || 1,
              total_periods: updatedGame.total_periods || 2,
              period_length_minutes: updatedGame.period_length_minutes || 15,
              intermission_length_minutes: updatedGame.intermission_length_minutes || 5,
              period_start_time: updatedGame.period_start_time || undefined,
              last_updated: updatedGame.last_updated || undefined
            };
            setGame(transformedGame);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [gameId, fieldId]);

  return { game, isLoading, error };
};
