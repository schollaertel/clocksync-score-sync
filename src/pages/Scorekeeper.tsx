import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, AlertCircle, CheckCircle } from "lucide-react";
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
  const { primaryRole, roles, loading: rolesLoading, error: rolesError } = useUserRoles();
  const { toast } = useToast();
  
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { game, isLoading: gameLoading } = useGameRealtime(selectedGameId);

  // Memoize permission check to prevent re-computation
  const canOperateScoreboard = useMemo(() => {
    if (!primaryRole) return false;
    return ['super_admin', 'admin', 'director', 'scorekeeper'].includes(primaryRole);
  }, [primaryRole]);

  // Memoize fetchScorekeeperData to prevent recreation
  const fetchScorekeeperData = useCallback(async () => {
    if (!user) return;
    
    console.log('Scorekeeper: Starting data fetch');
    setLoading(true);
    setError(null);

    try {
      console.log('Scorekeeper: Fetching all available games');
      
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select(`
          *,
          fields (
            name,
            location
          )
        `)
        .in('game_status', ['scheduled', 'active'])
        .order('scheduled_time', { ascending: true });

      if (gamesError) {
        console.error('Scorekeeper: Games fetch error:', gamesError);
        throw gamesError;
      }

      const games: Game[] = (gamesData || []).map(game => ({
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

      console.log('Scorekeeper: Games fetched successfully:', games.length);
      setAvailableGames(games);

    } catch (error) {
      console.error('Scorekeeper: Data fetch error:', error);
      setError('Failed to load scorekeeper data');
      toast({
        title: "Error",
        description: "Failed to load games. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Simplified useEffect with stable dependencies
  useEffect(() => {
    console.log('Scorekeeper: Main effect triggered', { 
      user: !!user, 
      rolesLoading, 
      primaryRole, 
      canOperate: canOperateScoreboard 
    });
    
    if (!user) {
      console.log('Scorekeeper: No user, redirecting to auth');
      navigate('/auth');
      return;
    }
    
    if (rolesLoading) {
      console.log('Scorekeeper: Roles still loading, waiting...');
      return;
    }

    if (rolesError) {
      console.log('Scorekeeper: Roles error detected:', rolesError);
      setError(rolesError);
      setLoading(false);
      return;
    }
    
    if (!canOperateScoreboard) {
      console.log('Scorekeeper: User cannot operate scoreboard');
      setError(`Access Denied: You currently have ${primaryRole || 'spectator'} access. Contact your administrator for scorekeeper permissions.`);
      setLoading(false);
      return;
    }

    console.log('Scorekeeper: User has scorekeeper access, fetching data');
    fetchScorekeeperData();
  }, [user, rolesLoading, rolesError, primaryRole, canOperateScoreboard, fetchScorekeeperData, navigate]);

  // Consolidated loading state
  const isLoading = loading || rolesLoading;

  // Show loading state
  if (isLoading) {
    console.log('Scorekeeper: Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-4 h-4 bg-white rounded-full animate-spin"></div>
          </div>
          <div className="text-white text-xl">Loading scorekeeper dashboard...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.log('Scorekeeper: Showing error state:', error);
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
                <h2 className="text-2xl font-bold mb-4">Access Issue</h2>
                <p className="text-gray-300 mb-4">{error}</p>
                <Button 
                  onClick={() => navigate('/')}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  console.log('Scorekeeper: Rendering main interface');
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

        {/* Status Info */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardContent className="pt-6">
            <div className="text-white">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p>Welcome, {user?.email}</p>
              </div>
              <p className="text-sm text-gray-300">Role: {primaryRole || 'Loading...'}</p>
              <p className="text-sm text-gray-300">Total roles: {roles.length}</p>
              <p className="text-sm text-gray-300">Available games: {availableGames.length}</p>
            </div>
          </CardContent>
        </Card>

        {/* Game Selection */}
        {availableGames.length > 0 && (
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
        )}

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
        {availableGames.length === 0 && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">No Games Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-300">
                <p>There are currently no games scheduled or active.</p>
                <p>Contact your administrator to schedule games or check back later.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedGameId && availableGames.length > 0 && (
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
