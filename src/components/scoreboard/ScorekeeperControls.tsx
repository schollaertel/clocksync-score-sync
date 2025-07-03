import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, RotateCcw, Plus, Minus, AlertTriangle, Clock } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePenaltyTracking } from '@/hooks/usePenaltyTracking';
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
  const [showPenaltyDialog, setShowPenaltyDialog] = useState(false);
  const [penaltyForm, setPenaltyForm] = useState({
    team: 'home' as 'home' | 'away',
    player_name: '',
    penalty_type: '',
    duration_minutes: 2
  });

  const { penalties, addPenalty, expirePenalty } = usePenaltyTracking(game.id);

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
      time_remaining: (game.period_length_minutes || 15) * 60,
      game_status: 'scheduled'
    });
  };

  const adjustScore = (team: 'home' | 'away', delta: number) => {
    const currentScore = team === 'home' ? game.home_score : game.away_score;
    const newScore = Math.max(0, currentScore + delta);
    
    updateGame({
      [team === 'home' ? 'home_score' : 'away_score']: newScore
    });

    // Log goal event
    if (delta > 0) {
      supabase.from('game_events').insert([{
        game_id: game.id,
        event_type: 'goal',
        description: `Goal scored by ${team === 'home' ? game.home_team : game.away_team}`,
        metadata: { team, score: newScore }
      }]);
    }
  };

  const adjustTime = (delta: number) => {
    const newTime = Math.max(0, game.time_remaining + delta);
    updateGame({ time_remaining: newTime });
  };

  const handleAddPenalty = async () => {
    if (!penaltyForm.player_name || !penaltyForm.penalty_type) {
      toast({
        title: 'Error',
        description: 'Please fill in all penalty details',
        variant: 'destructive',
      });
      return;
    }

    await addPenalty(penaltyForm);
    setShowPenaltyDialog(false);
    setPenaltyForm({
      team: 'home',
      player_name: '',
      penalty_type: '',
      duration_minutes: 2
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeRemaining = (penalty: any) => {
    const now = new Date();
    const expires = new Date(penalty.expires_at);
    const remaining = Math.max(0, Math.floor((expires.getTime() - now.getTime()) / 1000));
    return formatTime(remaining);
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
            <Button onClick={() => adjustTime(-60)} disabled={isUpdating} size="sm" variant="outline" className="text-white border-white/20">-1:00</Button>
            <Button onClick={() => adjustTime(-10)} disabled={isUpdating} size="sm" variant="outline" className="text-white border-white/20">-0:10</Button>
            <Button onClick={() => adjustTime(10)} disabled={isUpdating} size="sm" variant="outline" className="text-white border-white/20">+0:10</Button>
            <Button onClick={() => adjustTime(60)} disabled={isUpdating} size="sm" variant="outline" className="text-white border-white/20">+1:00</Button>
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
                <Button onClick={() => adjustScore('home', -1)} disabled={isUpdating} size="sm" variant="outline" className="text-white border-white/20">
                  <Minus className="w-4 h-4" />
                </Button>
                <Button onClick={() => adjustScore('home', 1)} disabled={isUpdating} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
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
                <Button onClick={() => adjustScore('away', -1)} disabled={isUpdating} size="sm" variant="outline" className="text-white border-white/20">
                  <Minus className="w-4 h-4" />
                </Button>
                <Button onClick={() => adjustScore('away', 1)} disabled={isUpdating} size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Penalty Management */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Penalties</CardTitle>
          <Dialog open={showPenaltyDialog} onOpenChange={setShowPenaltyDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Add Penalty
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add Penalty</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Record a penalty for tracking and notifications
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Team</Label>
                  <Select value={penaltyForm.team} onValueChange={(value: 'home' | 'away') => setPenaltyForm(prev => ({...prev, team: value}))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">{game.home_team}</SelectItem>
                      <SelectItem value="away">{game.away_team}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">Player Name</Label>
                  <Input
                    value={penaltyForm.player_name}
                    onChange={(e) => setPenaltyForm(prev => ({...prev, player_name: e.target.value}))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter player name"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Penalty Type</Label>
                  <Select value={penaltyForm.penalty_type} onValueChange={(value) => setPenaltyForm(prev => ({...prev, penalty_type: value}))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select penalty type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor Penalty</SelectItem>
                      <SelectItem value="major">Major Penalty</SelectItem>
                      <SelectItem value="misconduct">Misconduct</SelectItem>
                      <SelectItem value="fighting">Fighting</SelectItem>
                      <SelectItem value="boarding">Boarding</SelectItem>
                      <SelectItem value="checking">Checking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={penaltyForm.duration_minutes}
                    onChange={(e) => setPenaltyForm(prev => ({...prev, duration_minutes: parseInt(e.target.value) || 2}))}
                    className="bg-slate-700 border-slate-600 text-white"
                    min="1"
                    max="20"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPenaltyDialog(false)}>Cancel</Button>
                <Button onClick={handleAddPenalty}>Add Penalty</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {penalties.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No active penalties</p>
          ) : (
            <div className="space-y-2">
              {penalties.map((penalty) => (
                <div key={penalty.id} className="flex items-center justify-between bg-white/5 rounded p-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={penalty.team === 'home' ? 'default' : 'destructive'}>
                      {penalty.team === 'home' ? game.home_team : game.away_team}
                    </Badge>
                    <span className="text-white font-medium">{penalty.player_name}</span>
                    <span className="text-gray-300">{penalty.penalty_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Clock className="w-4 h-4" />
                      <span className="font-mono">{getTimeRemaining(penalty)}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => expirePenalty(penalty.id)}
                      className="text-white border-white/20"
                    >
                      End
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
