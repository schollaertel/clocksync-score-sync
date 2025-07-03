
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Field } from '@/types/game';

export const useGameOperations = (onGameCreated: () => void) => {
  const { toast } = useToast();
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [newGameHomeTeam, setNewGameHomeTeam] = useState('');
  const [newGameAwayTeam, setNewGameAwayTeam] = useState('');
  const [newGameDateTime, setNewGameDateTime] = useState('');

  const createGame = async () => {
    if (!selectedField || !newGameHomeTeam.trim() || !newGameAwayTeam.trim() || !newGameDateTime) {
      toast({
        title: 'Error',
        description: 'Please fill in all game details',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase
      .from('games')
      .insert([{
        field_id: selectedField.id,
        home_team: newGameHomeTeam.trim(),
        away_team: newGameAwayTeam.trim(),
        scheduled_time: newGameDateTime,
        game_status: 'scheduled',
        home_score: 0,
        away_score: 0,
        time_remaining: 720
      }]);

    if (error) {
      console.error('Error creating game:', error);
      toast({
        title: 'Error',
        description: 'Failed to create game',
        variant: 'destructive',
      });
      return;
    }

    setNewGameHomeTeam('');
    setNewGameAwayTeam('');
    setNewGameDateTime('');
    onGameCreated();
    toast({
      title: 'Success',
      description: 'Game scheduled successfully',
    });
  };

  return {
    selectedField,
    newGameHomeTeam,
    newGameAwayTeam,
    newGameDateTime,
    setSelectedField,
    setNewGameHomeTeam,
    setNewGameAwayTeam,
    setNewGameDateTime,
    createGame
  };
};
