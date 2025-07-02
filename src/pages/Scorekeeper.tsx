import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useGameRealtime } from '@/hooks/useGameRealtime';
import { ScorekeeperControls } from '@/components/scoreboard/ScorekeeperControls';
import { RealtimeScoreboard } from '@/components/scoreboard/RealtimeScoreboard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Game, Field } from '@/types/game';

const Scorekeeper = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canOperateScoreboard, loading: rolesLoading, error: rolesError } = useUserRoles();
  const { toast } = useToast();
  
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const [assignedFields, setAssignedFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { game, isLoading: gameLoading } = useGameRealtime(selectedGameId);

  useEffect(() => {
    console.log('Scorekeeper: auth/roles state', { user: !!user, rolesLoading, canOperate: canOperateScoreboard() });
    
    if (!user) {
      console.log('Scorekeeper: no user, redirecting to auth');
      navigate('/auth');
      return;
    }
    
    if (rolesLoading) {
      console.log('Scorekeeper: roles still loading');
      return;
    }

    if (rolesError) {
      console.log('Scorekeeper: roles error', rolesError);
      setError(rolesError);
      setLoading(false);
      return;
    }
    
    if (!canOperateScoreboard()) {
      console.log('Scorekeeper: user cannot operate scoreboard');
      toast({
        title: "Access Denied",
        description: "You don't have permission to operate the scoreboard. Contact your administrator for scorekeeper access.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    console.log('Scorekeeper: fetching assigned fields');
    fetchAssignedFields();
  }, [user, canOperateScoreboard, rolesLoading, rolesError]);

  useEffect(() => {
    if (assignedFields.length > 0) {
      console.log('Scorekeeper: fetching games for fields', assignedFields.length);
      fetchAvailableGames();
    }
  }, [assignedFields]);

  const fetchAssignedFields = async () => {
    if (!user) return;

    try {
      console.log('Scorekeeper: fetching field assignments for user', user.id);
      
      // Get field assignments for this scorekeeper
      const { data: assignments, error: assignmentError } = await supabase
        .from('field_assignments')
        .select(`
          *,
          fields (*)
        `)
        .eq('scorekeeper_id', user.id)
        .eq('is_active', true);

      if (assignmentError) {
        console.error('Scorekeeper: assignment error', assignmentError);
        throw assignmentError;
      }

      console.log('Scorekeeper: field assignments', assignments);
      const fields = assignments?.map(a => a.fields).filter(Boolean) || [];
      setAssignedFields(fields as Field[]);

      console.log('Scorekeeper: assigned fields', fields);
    } catch (error) {
      console.error('Error fetching assigned fields:', error);
      setError('Failed to load assigned fields');
      toast({
        title: "Error",
        description: "Failed to load assigned fields",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableGames = async () => {
    if (assignedFields.length === 0) return;

    try {
      const fieldIds = assignedFields.map(f => f.id);
      console.log('Scorekeeper: fetching games for field IDs', fieldIds);
      
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          fields (
            name,
            location
          )
        `)
        .in('field_id', fieldIds)
        .in('game_status', ['scheduled', 'active'])
        .order('scheduled_time', { ascending: true });

      if (error) {
        console.error('Scorekeeper: games fetch error', error);
        throw error;
      }

      const games: Game[] = (data || []).map(game => ({
        id: game.id,
        field_id: game.field_id,
        home_team: game.home_team,
        away_team: game.away_team,
        home_team_logo_url: game.home_team_logo_url,
        away_team_logo_url: game.away_team_logo_url,
        home_score: game.home_score || 0,
        away_score: game.away_score || 0,
        scheduled_time: game.scheduled_time,
        game_status: game.game_status as Game['game_status'],
        time_remaining: game.time_remaining || 900,
        created_at: game.created_at
      }));

      setAvailableGames(games);
      console.log('Scorekeeper: available games', games);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast({
        title: "Error",
        description: "Failed to load games",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading scorekeeper dashboard...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => navigate("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="pt-6">
              <div className="text-center text-white">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                <h2 className="text-2xl font-bold mb-4">Error Loading Dashboard</h2>
                <p className="text-gray-300 mb-4">{error}</p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show no field assignments state
  if (assignedFields.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => navigate("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="pt-6">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-4">No Field Assignments</h2>
                <p className="text-gray-300">
                  You haven't been assigned to any fields yet. Contact your administrator to get field assignments.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => navigate("/")}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center space-x-3">
            <img 
              src="/clocksynk-logo.png" 
              alt="ClockSynk Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-white">
              Scorekeeper Dashboard
            </span>
          </div>
        </div>

        {/* Game Selection */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Select Game to Manage</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedGameId} onValueChange={setSelectedGameId}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Choose a game to manage..." />
              </SelectTrigger>
              <SelectContent>
                {availableGames.map((game) => (
                  <SelectItem key={game.id} value={game.id}>
                    {game.home_team} vs {game.away_team} - {new Date(game.scheduled_time).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Scorekeeper Controls and Live Preview */}
        {selectedGameId && game && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <div>
              <h3 className="text-white text-xl font-bold mb-4">Controls</h3>
              <ScorekeeperControls 
                game={game} 
                onGameUpdate={(updatedGame) => {
                  console.log('Game updated:', updatedGame);
                }}
              />
            </div>
            
            {/* Live Preview */}
            <div>
              <h3 className="text-white text-xl font-bold mb-4">Live Preview</h3>
              <div className="bg-black/20 rounded-lg p-4">
                <RealtimeScoreboard 
                  gameId={selectedGameId}
                  showAds={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!selectedGameId && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-300 space-y-2">
                <p>• Select a game from the dropdown above to start managing the scoreboard</p>
                <p>• Use the controls to start/pause the clock and adjust scores in real-time</p>
                <p>• The scoreboard updates live for all spectators viewing this game</p>
                <p>• The clock continues running even if you close this page</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Scorekeeper;
