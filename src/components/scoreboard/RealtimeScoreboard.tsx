import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Trophy, AlertCircle } from 'lucide-react';
import { useGameRealtime } from '@/hooks/useGameRealtime';
import { useGameCountdown } from '@/hooks/useGameCountdown';
import { supabase } from '@/integrations/supabase/client';
import type { Advertisement } from '@/types/game';

interface RealtimeScoreboardProps {
  gameId?: string;
  fieldId?: string;
  showAds?: boolean;
}

export const RealtimeScoreboard: React.FC<RealtimeScoreboardProps> = ({
  gameId,
  fieldId,
  showAds = false
}) => {
  const { game, isLoading, error } = useGameRealtime(gameId, fieldId);
  const { formattedTime, isActive } = useGameCountdown(game);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);

  useEffect(() => {
    if (showAds && (fieldId || game?.field_id)) {
      fetchAdvertisements(fieldId || game?.field_id);
    }
  }, [showAds, fieldId, game?.field_id]);

  const fetchAdvertisements = async (fId?: string) => {
    if (!fId) return;

    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('field_id', fId)
        .eq('is_active', true);

      if (error) throw error;
      setAdvertisements(data || []);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div className="text-white text-xl">Loading game...</div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="text-center text-white">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-2xl font-bold mb-4">No Active Game</h2>
            <p className="text-gray-300">
              {error || 'No game is currently scheduled or active for this field.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Scoreboard */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-2xl">
        <CardContent className="p-8">
          {/* Game Status */}
          <div className="text-center mb-6">
            <Badge className={`${isActive ? 'bg-red-500' : 'bg-gray-500'} text-white text-lg px-4 py-2`}>
              {isActive ? 'LIVE' : game.game_status.toUpperCase()}
            </Badge>
          </div>

          {/* Teams and Scores */}
          <div className="grid grid-cols-3 gap-8 items-center mb-8">
            {/* Home Team */}
            <div className="text-center">
              <div className="mb-4">
                {game.home_team_logo_url ? (
                  <img 
                    src={game.home_team_logo_url} 
                    alt={`${game.home_team} logo`}
                    className="w-20 h-20 mx-auto object-contain rounded-full bg-white/10 p-2"
                  />
                ) : (
                  <div className="w-20 h-20 mx-auto bg-blue-500 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{game.home_team}</h2>
              <div className="text-6xl font-bold text-blue-400">{game.home_score}</div>
            </div>

            {/* Clock and Period */}
            <div className="text-center">
              <div className="text-5xl font-mono font-bold text-white mb-2">
                {formattedTime}
              </div>
              <div className="text-gray-300">
                Period {game.current_period || 1} of {game.total_periods || 2}
              </div>
              {isActive && (
                <div className="flex items-center justify-center mt-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-red-400 text-sm">GAME IN PROGRESS</span>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="text-center">
              <div className="mb-4">
                {game.away_team_logo_url ? (
                  <img 
                    src={game.away_team_logo_url} 
                    alt={`${game.away_team} logo`}
                    className="w-20 h-20 mx-auto object-contain rounded-full bg-white/10 p-2"
                  />
                ) : (
                  <div className="w-20 h-20 mx-auto bg-red-500 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{game.away_team}</h2>
              <div className="text-6xl font-bold text-red-400">{game.away_score}</div>
            </div>
          </div>

          {/* Game Info */}
          <div className="text-center text-gray-300 text-sm">
            <div className="flex items-center justify-center space-x-4">
              <span>Scheduled: {new Date(game.scheduled_time).toLocaleString()}</span>
              {game.last_updated && (
                <span>Updated: {new Date(game.last_updated).toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advertisements */}
      {showAds && advertisements.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advertisements.map((ad) => (
            <Card key={ad.id} className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                {ad.ad_image_url ? (
                  <img 
                    src={ad.ad_image_url} 
                    alt={ad.advertiser_name}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-2">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                )}
                <h3 className="text-white font-semibold text-center">{ad.advertiser_name}</h3>
                <p className="text-gray-300 text-xs text-center mt-1">{ad.position}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ClockSynk Branding */}
      <div className="text-center mt-8 p-4">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            Clock<span className="text-green-400">Synk</span>
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Professional timing technology for every sport
        </p>
      </div>
    </div>
  );
};
