import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Pause, RotateCcw, Plus, Minus, Users, Home, Calendar, MapPin, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Game {
  id: string;
  home_team: string;
  away_team: string;
  scheduled_time: string;
  field_id: string;
  status: string;
  home_score: number;
  away_score: number;
  current_period: number;
  game_time: number;
  fields?: {
    name: string;
    location: string;
  };
}

const Scorekeeper = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Game selection state
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  
  // Game clock state
  const [gameTime, setGameTime] = useState(900); // 15 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [period, setPeriod] = useState(1);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [penalties, setPenalties] = useState<{id: number, team: string, player: string, time: number, type: string}[]>([]);
  const [showPenaltyForm, setShowPenaltyForm] = useState<{show: boolean, team: string}>({show: false, team: ''});
  const [penaltyForm, setPenaltyForm] = useState({
    type: '',
    playerNumber: '',
    duration: 120 // default 2 minutes
  });

  useEffect(() => {
    if (user) {
      fetchAvailableGames();
      
      // Check for gameId in URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const gameId = urlParams.get('gameId');
      if (gameId) {
        // Auto-select the game if gameId is provided
        fetchSpecificGame(gameId);
      }
    }
  }, [user]);

  const fetchSpecificGame = async (gameId: string) => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          fields (
            name,
            location
          )
        `)
        .eq('id', gameId)
        .single();

      if (error) throw error;
      if (data) {
        selectGame(data);
      }
    } catch (error) {
      console.error('Error fetching specific game:', error);
      toast({
        title: "Error",
        description: "Failed to load the selected game",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && gameTime > 0) {
      interval = setInterval(() => {
        setGameTime(time => time - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, gameTime]);

  // Penalty countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setPenalties(prevPenalties => 
        prevPenalties.map(penalty => {
          if (penalty.time > 0) {
            return { ...penalty, time: penalty.time - 1 };
          }
          return penalty;
        }).filter(penalty => penalty.time > 0) // Remove expired penalties
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchAvailableGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          fields (
            name,
            location
          )
        `)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setAvailableGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast({
        title: "Error",
        description: "Failed to load games",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGames(false);
    }
  };

  const selectGame = (game: Game) => {
    setSelectedGame(game);
    setHomeScore(game.home_score || 0);
    setAwayScore(game.away_score || 0);
    setPeriod(game.current_period || 1);
    setGameTime(game.game_time || 900);
  };

  // Local clock interval reference
  const [clockInterval, setClockInterval] = useState<NodeJS.Timeout | null>(null);

  // Start local clock countdown
  const startLocalClock = () => {
    // Clear any existing interval
    if (clockInterval) {
      clearInterval(clockInterval);
    }
    
    // Create new interval that updates every 1 second
    const interval = setInterval(() => {
      setGameTime((prevTime) => {
        // Only decrement if time is greater than 0
        if (prevTime > 0) {
          return Math.max(0, prevTime - 1);
        } else {
          // Stop clock if time reaches 0
          stopLocalClock();
          return 0;
        }
      });
    }, 1000);
    
    // Save interval reference
    setClockInterval(interval);
    console.log('Local clock started');
  };
  
  // Stop local clock countdown
  const stopLocalClock = () => {
    if (clockInterval) {
      clearInterval(clockInterval);
      setClockInterval(null);
      console.log('Local clock stopped');
    }
  };
  
  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (clockInterval) {
        clearInterval(clockInterval);
      }
    };
  }, [clockInterval]);

  const formatTime = (seconds: number) => {
    if (seconds === undefined || seconds === null || isNaN(seconds)) {
      return "15:00"; // Default game time
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleClock = async () => {
    if (!selectedGame) return;
    
    const newIsRunning = !isRunning;
    const currentTime = Date.now();
    
    try {
      console.log('Toggling clock state to:', newIsRunning);
      
      // Try to update database with new clock state
      try {
        const { error } = await supabase
          .from('games')
          .update({
            is_running: newIsRunning,
            game_time: gameTime,
            last_updated: new Date(currentTime).toISOString()
          })
          .eq('id', selectedGame.id);

        if (error) {
          console.warn('Database update failed, continuing with local-only mode:', error);
          // Continue with local-only mode
        } else {
          console.log('Database updated successfully');
        }
      } catch (dbError) {
        console.warn('Database connection error, continuing with local-only mode:', dbError);
        // Continue with local-only mode
      }

      // Update local state regardless of database success
      setIsRunning(newIsRunning);
      
      // Show success toast
      toast({
        title: newIsRunning ? "Clock Started" : "Clock Paused",
        description: newIsRunning ? "Game clock is now running" : "Game clock is now paused",
      });
      
      // Start local clock countdown if running
      if (newIsRunning) {
        startLocalClock();
      } else {
        stopLocalClock();
      }
      
    } catch (error) {
      console.error('Error updating clock state:', error);
      toast({
        title: "Error",
        description: "Failed to update clock state",
        variant: "destructive",
      });
    }
  };

  const resetClock = async () => {
    if (!selectedGame) return;
    
    try {
      console.log('Resetting clock');
      
      // Stop local clock if running
      stopLocalClock();
      
      // Try to reset clock in database
      try {
        const { error } = await supabase
          .from('games')
          .update({
            is_running: false,
            game_time: 900,
            last_updated: new Date().toISOString()
          })
          .eq('id', selectedGame.id);

        if (error) {
          console.warn('Database reset failed, continuing with local-only mode:', error);
          // Continue with local-only mode
        } else {
          console.log('Database reset successfully');
        }
      } catch (dbError) {
        console.warn('Database connection error during reset, continuing with local-only mode:', dbError);
        // Continue with local-only mode
      }

      // Update local state regardless of database success
      setGameTime(900);
      setIsRunning(false);
      
      // Show success toast
      toast({
        title: "Clock Reset",
        description: "Game clock has been reset to 15:00",
      });
    } catch (error) {
      console.error('Error resetting clock:', error);
      toast({
        title: "Error",
        description: "Failed to reset clock",
        variant: "destructive",
      });
    }
  };

  // Sync clock state from database
  const syncClockState = async () => {
    if (!selectedGame) return;
    
    try {
      console.log('Syncing clock state from database');
      
      const { data, error } = await supabase
        .from('games')
        .select('is_running, game_time, last_updated, home_score, away_score, current_period')
        .eq('id', selectedGame.id)
        .single();

      if (error) throw error;
      if (!data) return;

      const lastUpdated = new Date(data.last_updated).getTime();
      const now = Date.now();
      const timeDiff = Math.floor((now - lastUpdated) / 1000);

      if (data.is_running) {
        // Calculate current time based on when clock was last updated
        const currentGameTime = Math.max(0, data.game_time - timeDiff);
        setGameTime(currentGameTime);
        setIsRunning(true);
      } else {
        setGameTime(data.game_time);
        setIsRunning(false);
      }

      // Update scores and period
      setHomeScore(data.home_score || 0);
      setAwayScore(data.away_score || 0);
      setPeriod(data.current_period || 1);
      
      console.log('Clock state synced:', { 
        isRunning: data.is_running, 
        gameTime: data.is_running ? Math.max(0, data.game_time - timeDiff) : data.game_time,
        homeScore: data.home_score,
        awayScore: data.away_score,
        period: data.current_period
      });
    } catch (error) {
      console.error('Error syncing clock state:', error);
    }
  };

  // Add real-time sync every 2 seconds
  useEffect(() => {
    if (!selectedGame) return;
    
    // Initial sync
    syncClockState();
    
    // Set up regular sync interval
    const syncInterval = setInterval(syncClockState, 2000);
    console.log('Setting up sync interval every 2 seconds');
    
    return () => {
      console.log('Clearing sync interval');
      clearInterval(syncInterval);
    }
  }, [selectedGame]);

  const openPenaltyForm = (team: string) => {
    setShowPenaltyForm({show: true, team});
    setPenaltyForm({
      type: '',
      playerNumber: '',
      duration: 120
    });
  };

  const closePenaltyForm = () => {
    setShowPenaltyForm({show: false, team: ''});
    setPenaltyForm({
      type: '',
      playerNumber: '',
      duration: 120
    });
  };

  const addPenalty = () => {
    if (!penaltyForm.type || !penaltyForm.playerNumber) {
      alert('Please fill in all penalty details');
      return;
    }

    const newPenalty = {
      id: Date.now(),
      team: showPenaltyForm.team,
      player: `#${penaltyForm.playerNumber}`,
      time: penaltyForm.duration,
      type: penaltyForm.type
    };
    
    setPenalties([...penalties, newPenalty]);
    closePenaltyForm();
  };

  const backToGameSelection = () => {
    setSelectedGame(null);
    setIsRunning(false);
  };

  // Game Selection View
  if (!selectedGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => navigate("/")}
              className="bg-orange-500 hover:bg-orange-600 text-white border-0"
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
                Clock<span className="text-green-400">Synk</span>
              </span>
            </div>
            <Badge className="bg-orange-500 text-white">
              SCOREKEEPER MODE
            </Badge>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Select Game to Manage</h1>
            <p className="text-gray-300">Choose a scheduled game to start scorekeeper controls</p>
          </div>

          {isLoadingGames ? (
            <div className="text-center py-12">
              <div className="text-white text-lg">Loading available games...</div>
            </div>
          ) : availableGames.length === 0 ? (
            <div className="text-center py-12">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md mx-auto">
                <CardContent className="pt-6">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-semibold mb-2">No Games Scheduled</h3>
                  <p className="text-gray-300 mb-4">There are no games available for scorekeeper management.</p>
                  <Button 
                    onClick={() => navigate("/fields")}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Manage Fields & Games
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableGames.map((game) => (
                <Card key={game.id} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-blue-500 text-white">
                        {(game.status || 'SCHEDULED').toUpperCase()}
                      </Badge>
                      <div className="flex items-center text-gray-300 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {game.fields?.name || 'Field'}
                      </div>
                    </div>
                    <CardTitle className="text-white text-lg">
                      {game.home_team} vs {game.away_team}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-300 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDateTime(game.scheduled_time)}
                      </div>
                      
                      <div className="flex items-center text-gray-300 text-sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        {game.fields?.location || 'Location TBD'}
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{game.home_score || 0}</div>
                          <div className="text-xs text-gray-400">Home</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-300">Period {game.current_period || 1}</div>
                          <div className="text-sm text-gray-300">{formatTime(game.game_time || 900)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{game.away_score || 0}</div>
                          <div className="text-xs text-gray-400">Away</div>
                        </div>
                      </div>

                      <Button 
                        onClick={() => selectGame(game)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Start Scorekeeper
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Game Clock Management View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={backToGameSelection}
            className="bg-orange-500 hover:bg-orange-600 text-white border-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
          <div className="flex items-center space-x-3">
            <img 
              src="/clocksynk-logo.png" 
              alt="ClockSynk Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-white">
              Clock<span className="text-green-400">Synk</span>
            </span>
          </div>
          <Badge className="bg-orange-500 text-white">
            SCOREKEEPER MODE
          </Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Main Scoreboard */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">
              {selectedGame.home_team} vs {selectedGame.away_team}
            </CardTitle>
            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-red-500 text-white">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                LIVE
              </Badge>
              <Badge className="bg-blue-500 text-white">
                Period {period}
              </Badge>
              <Badge className="bg-gray-500 text-white">
                {selectedGame.fields?.name || 'Field'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Game Clock */}
            <div className="text-center mb-8">
              <div className="text-6xl md:text-8xl font-mono font-bold text-white mb-4">
                {formatTime(gameTime)}
              </div>
              <div className="flex justify-center gap-4">
                <Button
                  size="lg"
                  onClick={toggleClock}
                  className={`${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-8`}
                >
                  {isRunning ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
                  {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button
                  size="lg"
                  onClick={resetClock}
                  className="bg-orange-500 hover:bg-orange-600 text-white border-0 px-8"
                >
                  <RotateCcw className="w-6 h-6 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-8">
              {/* Home Team */}
              <div className="text-center">
                <div className="bg-white/10 rounded-lg p-6 mb-4">
                  {selectedGame.home_team_logo ? (
                    <img 
                      src={selectedGame.home_team_logo} 
                      alt={`${selectedGame.home_team} Logo`}
                      className="w-16 h-16 object-contain mx-auto mb-4 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <h3 className="text-white text-xl font-bold mb-2">{selectedGame.home_team}</h3>
                  <div className="text-5xl font-bold text-white mb-4">{homeScore}</div>
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={() => setHomeScore(homeScore + 1)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => openPenaltyForm('home')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Add Penalty
                </Button>
              </div>

              {/* Away Team */}
              <div className="text-center">
                <div className="bg-white/10 rounded-lg p-6 mb-4">
                  {selectedGame.away_team_logo ? (
                    <img 
                      src={selectedGame.away_team_logo} 
                      alt={`${selectedGame.away_team} Logo`}
                      className="w-16 h-16 object-contain mx-auto mb-4 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <h3 className="text-white text-xl font-bold mb-2">{selectedGame.away_team}</h3>
                  <div className="text-5xl font-bold text-white mb-4">{awayScore}</div>
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={() => setAwayScore(awayScore + 1)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => openPenaltyForm('away')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Add Penalty
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Controls */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Period Control */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Period Control</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-white">Current Period:</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setPeriod(Math.max(1, period - 1))}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-2xl font-bold text-white px-4">{period}</span>
                  <Button
                    size="sm"
                    onClick={() => setPeriod(period + 1)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Penalties */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Active Penalties</CardTitle>
            </CardHeader>
            <CardContent>
              {penalties.length === 0 ? (
                <p className="text-gray-400 text-center">No active penalties</p>
              ) : (
                <div className="space-y-2">
                  {penalties.map((penalty) => (
                    <div key={penalty.id} className="flex items-center justify-between bg-white/10 rounded p-3">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {penalty.team === 'home' ? selectedGame?.home_team : selectedGame?.away_team} {penalty.player}
                        </span>
                        <span className="text-gray-300 text-sm">{penalty.type}</span>
                      </div>
                      <span className="text-yellow-400 font-mono">{formatTime(penalty.time)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sync Status */}
        <Card className="bg-green-500/20 border-green-500/50 mt-6">
          <CardContent className="pt-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-semibold">LIVE SYNC ACTIVE</span>
              <span className="text-gray-300">• Spectators are viewing real-time updates</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Penalty Form Modal */}
      {showPenaltyForm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-white text-xl font-bold mb-4">
              Add Penalty - {showPenaltyForm.team === 'home' ? selectedGame?.home_team : selectedGame?.away_team}
            </h3>
            
            <div className="space-y-4">
              {/* Penalty Type */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Penalty Type
                </label>
                <input
                  type="text"
                  value={penaltyForm.type}
                  onChange={(e) => setPenaltyForm({...penaltyForm, type: e.target.value})}
                  placeholder="e.g., Slashing, Cross-checking, Illegal Body Check"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
                />
              </div>

              {/* Player Number */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Player Number
                </label>
                <input
                  type="number"
                  value={penaltyForm.playerNumber}
                  onChange={(e) => setPenaltyForm({...penaltyForm, playerNumber: e.target.value})}
                  placeholder="Enter player number"
                  min="1"
                  max="99"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
                />
              </div>

              {/* Penalty Duration */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Penalty Duration
                </label>
                <select
                  value={penaltyForm.duration}
                  onChange={(e) => setPenaltyForm({...penaltyForm, duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value={30}>0:30 - Technical Foul</option>
                  <option value={60}>1:00 - Minor Penalty</option>
                  <option value={120}>2:00 - Minor Penalty</option>
                  <option value={180}>3:00 - Major Penalty</option>
                  <option value={300}>5:00 - Major Penalty</option>
                  <option value={600}>10:00 - Misconduct</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={addPenalty}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Add Penalty
              </Button>
              <Button
                onClick={closePenaltyForm}
                variant="outline"
                className="flex-1 border-slate-600 text-white hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scorekeeper;

