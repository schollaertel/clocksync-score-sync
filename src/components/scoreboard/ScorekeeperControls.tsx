
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Plus, Minus } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Game } from '@/types/game';

interface ScorekeeperControlsProps {
  game: Game;
  onGameUpdate?: (game: Game) => void;
}

export const ScorekeeperControls: React.FC<ScorekeeperControlsProps> = ({ 
  game: initialGame, 
  onGameUpdate 
}) => {
  const { toast } = useToast();
  const [game, setGame] = useState(initialGame);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setGame(initialGame);
  }, [initialGame]);

  const updateGame = async (updates: Partial<Game>) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('games')
        .update(updates)
        .eq('id', game.id);

      if (error) throw error;

      const updatedGame = { ...game, ...updates };
      setGame(updatedGame);
      onGameUpdate?.(updatedGame);

      console.log('Game updated successfully:', updates);
    } catch (error) {
      console.error('Error updating game:', error);
      toast({
        title: "Error",
        description: "Failed to update game",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleClock = () => {
    const newStatus = game.game_status === 'active' ? 'scheduled' : 'active';
    updateGame({ game_status: newStatus });
  };

  const resetClock = () => {
    updateGame({ 
      time_remaining: 900, // 15 minutes default
      game_status: 'scheduled'
    });
  };

  const adjustScore = (team: 'home' | 'away', delta: number) => {
    const currentScore = team === 'home' ? game.home_score : game.away_score;
    const newScore = Math.max(0, currentScore + delta);
    
    updateGame({
      [team === 'home' ? 'home_score' : 'away_score']: newScore
    });
  };

  const adjustTime = (delta: number) => {
    const newTime = Math.max(0, game.time_remaining + delta);
    updateGame({ time_remaining: newTime });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Game Status */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center">
            {game.home_team} vs {game.away_team}
          </CardTitle>
          <div className="flex justify-center">
            <Badge className={`${game.game_status === 'active' ? 'bg-red-500' : 'bg-gray-500'} text-white`}>
              {game.game_status === 'active' ? 'LIVE' : 'PAUSED'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Clock Controls */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Game Clock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-mono font-bold text-white mb-4">
              {formatTime(game.time_remaining)}
            </div>
            <div className="flex justify-center gap-2">
              <Button
                onClick={toggleClock}
                disabled={isUpdating}
                className={`${game.game_status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
              >
                {game.game_status === 'active' ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {game.game_status === 'active' ? 'Pause' : 'Start'}
              </Button>
              <Button
                onClick={resetClock}
                disabled={isUpdating}
                variant="outline"
                className="text-white border-white/20"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
          
          {/* Time Adjustment */}
          <div className="flex justify-center gap-2">
            <Button
              onClick={() => adjustTime(-60)}
              disabled={isUpdating}
              size="sm"
              variant="outline"
              className="text-white border-white/20"
            >
              -1:00
            </Button>
            <Button
              onClick={() => adjustTime(-10)}
              disabled={isUpdating}
              size="sm"
              variant="outline"
              className="text-white border-white/20"
            >
              -0:10
            </Button>
            <Button
              onClick={() => adjustTime(10)}
              disabled={isUpdating}
              size="sm"
              variant="outline"
              className="text-white border-white/20"
            >
              +0:10
            </Button>
            <Button
              onClick={() => adjustTime(60)}
              disabled={isUpdating}
              size="sm"
              variant="outline"
              className="text-white border-white/20"
            >
              +1:00
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Score Controls */}
      <div className="grid grid-cols-2 gap-4">
        {/* Home Team */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center">{game.home_team}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-4">{game.home_score}</div>
              <div className="flex justify-center gap-2">
                <Button
                  onClick={() => adjustScore('home', -1)}
                  disabled={isUpdating}
                  size="sm"
                  variant="outline"
                  className="text-white border-white/20"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => adjustScore('home', 1)}
                  disabled={isUpdating}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Away Team */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center">{game.away_team}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-4">{game.away_score}</div>
              <div className="flex justify-center gap-2">
                <Button
                  onClick={() => adjustScore('away', -1)}
                  disabled={isUpdating}
                  size="sm"
                  variant="outline"
                  className="text-white border-white/20"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => adjustScore('away', 1)}
                  disabled={isUpdating}
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
