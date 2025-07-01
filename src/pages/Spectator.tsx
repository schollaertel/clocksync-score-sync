import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, QrCode, Home, ExternalLink } from "lucide-react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Game {
  id: string;
  home_team: string;
  away_team: string;
  scheduled_time: string;
  field_id: string;
  game_status: string;
  home_score: number;
  away_score: number;
  time_remaining: number;
  fields?: {
    name: string;
    location: string;
  };
}

const Spectator = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const { toast } = useToast();
  
  // Extract parameters from URL hash and search params
  const getHashParams = () => {
    const hash = window.location.hash.substring(1); // Remove the #
    const params = new URLSearchParams(hash);
    return params;
  };

  const hashParams = getHashParams();
  const fieldId = searchParams.get('field') || hashParams.get('field') || params.fieldId;
  const gameIdFromQuery = searchParams.get('gameId') || hashParams.get('gameId');
  const gameIdFromParams = params.gameId;
  const gameId = gameIdFromParams || gameIdFromQuery;
  
  console.log('Spectator URL parameters:', { fieldId, gameId, gameIdFromQuery, gameIdFromParams });
  
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameTime, setGameTime] = useState(734); // Demo time
  const [period, setPeriod] = useState(2);
  const [homeScore, setHomeScore] = useState(42);
  const [awayScore, setAwayScore] = useState(38);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (gameId) {
      fetchSpecificGame(gameId);
    } else if (fieldId) {
      fetchFieldGames(fieldId);
    } else {
      setIsLoading(false);
    }
  }, [gameId, fieldId]);

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
        // Map database fields to our interface
        const gameData: Game = {
          id: data.id,
          home_team: data.home_team,
          away_team: data.away_team,
          scheduled_time: data.scheduled_time,
          field_id: data.field_id,
          game_status: data.game_status || 'scheduled',
          home_score: data.home_score || 0,
          away_score: data.away_score || 0,
          time_remaining: data.time_remaining || 900,
          fields: data.fields
        };
        
        setSelectedGame(gameData);
        setHomeScore(gameData.home_score || 42);
        setAwayScore(gameData.away_score || 38);
        setGameTime(gameData.time_remaining || 734);
        setIsRunning(gameData.game_status === 'active');
        
        console.log('Loaded specific game:', {
          id: gameData.id,
          homeTeam: gameData.home_team,
          awayTeam: gameData.away_team,
          isRunning: gameData.game_status === 'active',
          gameTime: gameData.time_remaining
        });
      }
    } catch (error) {
      console.error('Error fetching specific game:', error);
      toast({
        title: "Error",
        description: "Failed to load the selected game",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFieldGames = async (fieldId: string) => {
    try {
      // First try to get live games
      let { data, error } = await supabase
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
        .order('scheduled_time', { ascending: true })
        .limit(1);

      // If no live games, get the most recent scheduled game for this field
      if (!data || data.length === 0) {
        const { data: scheduledData, error: scheduledError } = await supabase
          .from('games')
          .select(`
            *,
            fields (
              name,
              location
            )
          `)
          .eq('field_id', fieldId)
          .order('scheduled_time', { ascending: false })
          .limit(1);
        
        data = scheduledData;
        error = scheduledError;
      }

      if (error) throw error;
      if (data && data.length > 0) {
        const game = data[0];
        // Map database fields to our interface
        const gameData: Game = {
          id: game.id,
          home_team: game.home_team,
          away_team: game.away_team,
          scheduled_time: game.scheduled_time,
          field_id: game.field_id,
          game_status: game.game_status || 'scheduled',
          home_score: game.home_score || 0,
          away_score: game.away_score || 0,
          time_remaining: game.time_remaining || 900,
          fields: game.fields
        };
        
        setSelectedGame(gameData);
        setHomeScore(gameData.home_score || 42);
        setAwayScore(gameData.away_score || 38);
        setGameTime(gameData.time_remaining || 734);
        setIsRunning(gameData.game_status === 'active');
        
        console.log('Loaded field game:', {
          id: gameData.id,
          homeTeam: gameData.home_team,
          awayTeam: gameData.away_team,
          isRunning: gameData.game_status === 'active',
          gameTime: gameData.time_remaining
        });
      } else {
        // No games found for this field, show demo content
        console.log('No games found for field:', fieldId);
      }
    } catch (error) {
      console.error('Error fetching field games:', error);
      toast({
        title: "Error",
        description: "Failed to load games for this field",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sync clock state from database for real-time updates
  const syncClockState = async () => {
    if (!selectedGame) return;
    
    try {
      console.log('Syncing clock state from database in Spectator view');
      
      const { data, error } = await supabase
        .from('games')
        .select('game_status, time_remaining, home_score, away_score')
        .eq('id', selectedGame.id)
        .single();

      if (error) throw error;
      if (!data) return;

      const isGameRunning = data.game_status === 'active';
      
      // Update isRunning state
      setIsRunning(isGameRunning);
      setGameTime(data.time_remaining || 900);

      // Update scores
      setHomeScore(data.home_score || 0);
      setAwayScore(data.away_score || 0);
      
      console.log('Clock state synced in Spectator view:', { 
        isRunning: isGameRunning, 
        gameTime: data.time_remaining,
        homeScore: data.home_score,
        awayScore: data.away_score
      });
    } catch (error) {
      console.error('Error syncing clock state in Spectator view:', error);
    }
  };

  useEffect(() => {
    if (!selectedGame) return;
    
    // Initial sync
    syncClockState();
    
    // Sync every 1 second for real-time updates
    console.log('Setting up sync interval every 1 second in Spectator view');
    const syncInterval = setInterval(syncClockState, 1000);
    
    return () => {
      console.log('Clearing sync interval in Spectator view');
      clearInterval(syncInterval);
    }
  }, [selectedGame]);

  // Local clock countdown for smooth updates between syncs
  useEffect(() => {
    let clockInterval: NodeJS.Timeout | null = null;
    
    if (selectedGame) {
      // Update clock every 100ms for smooth countdown
      clockInterval = setInterval(() => {
        setGameTime((prevTime) => {
          // Only decrement if clock is running
          if (isRunning && prevTime > 0) {
            return Math.max(0, prevTime - 0.1);
          }
          return prevTime;
        });
      }, 100);
      
      console.log('Setting up local clock countdown interval');
    }
    
    return () => {
      if (clockInterval) {
        console.log('Clearing local clock countdown interval');
        clearInterval(clockInterval);
      }
    };
  }, [selectedGame, isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sponsors = [
    { 
      name: "SportsCorp", 
      logo: "🏈", 
      website: "https://sportscorp.com",
      tagline: "Your Premier Sports Equipment Partner"
    },
    { 
      name: "FitLife Gym", 
      logo: "💪", 
      website: "https://fitlifegym.com",
      tagline: "Train Like a Champion"
    },
    { 
      name: "Metro Bank", 
      logo: "🏦", 
      website: "https://metrobank.com",
      tagline: "Supporting Local Sports"
    },
    { 
      name: "Pizza Palace", 
      logo: "🍕", 
      website: "https://pizzapalace.com",
      tagline: "Fuel Your Game"
    },
    { 
      name: "Sports Medicine Clinic", 
      logo: "🏥", 
      website: "https://sportsmed.com",
      tagline: "Keep Playing Strong"
    },
    { 
      name: "Athletic Gear Plus", 
      logo: "👕", 
      website: "https://athleticgear.com",
      tagline: "Gear Up for Victory"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white border-0"
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
              Clock<span className="text-green-400">Synk</span>
            </span>
          </div>
          <Badge className="bg-blue-500 text-white">
            SPECTATOR VIEW
          </Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Top Sponsor Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-4">
            {sponsors[0].logo.startsWith('data:') ? (
              <img 
                src={sponsors[0].logo} 
                alt={sponsors[0].name} 
                className="w-12 h-12 object-contain"
              />
            ) : (
              <div className="text-3xl">{sponsors[0].logo}</div>
            )}
            <div>
              <div className="text-white font-bold text-lg">{sponsors[0].name}</div>
              <div className="text-white/90 text-sm">{sponsors[0].tagline}</div>
            </div>
            <Button 
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={() => window.open(sponsors[0].website, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Visit
            </Button>
          </div>
        </div>

        {/* Main Scoreboard */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">
              {selectedGame ? `${selectedGame.home_team} vs ${selectedGame.away_team}` : 'Championship Game'}
            </CardTitle>
            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-red-500 text-white">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                LIVE
              </Badge>
              <Badge className="bg-blue-500 text-white">
                Period {period}
              </Badge>
              {selectedGame?.fields?.name && (
                <Badge className="bg-gray-500 text-white">
                  <QrCode className="w-4 h-4 mr-1" />
                  {selectedGame.fields.name}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Game Clock */}
            <div className="text-center mb-8">
              <div className="text-5xl md:text-7xl font-mono font-bold text-white mb-2">
                {formatTime(gameTime)}
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-semibold">LIVE SYNC</span>
              </div>
            </div>

            {/* Teams and Scores */}
            <div className="grid grid-cols-2 gap-8">
              {/* Home Team */}
              <div className="text-center">
                <div className="bg-white/10 rounded-lg p-6">
                  <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">
                    {selectedGame?.home_team || 'Thunder Hawks'}
                  </h3>
                  <div className="text-5xl font-bold text-white">{homeScore}</div>
                </div>
              </div>

              {/* Away Team */}
              <div className="text-center">
                <div className="bg-white/10 rounded-lg p-6">
                  <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">
                    {selectedGame?.away_team || 'Storm Eagles'}
                  </h3>
                  <div className="text-5xl font-bold text-white">{awayScore}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sponsor Showcase Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {sponsors.slice(1).map((sponsor, index) => (
            <Card 
              key={index} 
              className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all cursor-pointer"
              onClick={() => window.open(sponsor.website, '_blank')}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{sponsor.logo}</div>
                <div className="text-white font-semibold text-sm mb-1">{sponsor.name}</div>
                <div className="text-gray-300 text-xs mb-2">{sponsor.tagline}</div>
                <Button 
                  size="sm" 
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 h-auto border-0"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Visit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Sponsor Banner */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="text-3xl">{sponsors[1].logo}</div>
            <div>
              <div className="text-white font-bold text-lg">{sponsors[1].name}</div>
              <div className="text-white/90 text-sm">{sponsors[1].tagline}</div>
            </div>
            <Button 
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={() => window.open(sponsors[1].website, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Visit
            </Button>
          </div>
        </div>

        {/* Game Information */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardContent className="pt-4">
            <div className="text-center">
              <h3 className="text-white font-semibold mb-2">Game Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-300">Venue</div>
                  <div className="text-white">Metro Sports Complex</div>
                </div>
                <div>
                  <div className="text-gray-300">Field</div>
                  <div className="text-white">Championship Field A</div>
                </div>
                <div>
                  <div className="text-gray-300">League</div>
                  <div className="text-white">Youth Premier Division</div>
                </div>
                <div>
                  <div className="text-gray-300">Officials</div>
                  <div className="text-white">Certified Referees</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ClockSync Branding */}
        <div className="text-center mt-8 p-4">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Powered by Clock<span className="text-green-400">Sync</span>
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Professional timing technology for every sport
          </p>
        </div>
      </div>
    </div>
  );
};

export default Spectator;
