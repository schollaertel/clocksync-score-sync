
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock } from "lucide-react";
import { useGameRealtime } from '@/hooks/useGameRealtime';
import { supabase } from '@/integrations/supabase/client';
import type { Advertisement } from '@/types/game';
import { formatTime } from '@/lib/formatTime';

interface RealtimeScoreboardProps {
  gameId?: string;
  fieldId?: string;
  showAds?: boolean;
}

export const RealtimeScoreboard: React.FC<RealtimeScoreboardProps> = ({ 
  gameId, 
  fieldId, 
  showAds = true 
}) => {
  const { game, isLoading, error } = useGameRealtime(gameId, fieldId);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [period, setPeriod] = useState(2);

  useEffect(() => {
    if (!game?.field_id || !showAds) return;

    const fetchAds = async () => {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('field_id', game.field_id)
        .eq('is_active', true);

      if (!error && data) {
        setAdvertisements(data);
      }
    };

    fetchAds();

    // Set up real-time subscription for ads
    const adsChannel = supabase
      .channel('ads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'advertisements',
          filter: `field_id=eq.${game.field_id}`
        },
        () => {
          fetchAds(); // Refetch ads when they change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(adsChannel);
    };
  }, [game?.field_id, showAds]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Loading scoreboard...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">No active game found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Advertisement Banner */}
      {showAds && advertisements.filter(ad => ad.position === 'primary').length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-center">
          <div className="text-white font-bold text-lg">
            {advertisements.filter(ad => ad.position === 'primary')[0].advertiser_name}
          </div>
        </div>
      )}

      {/* Main Scoreboard */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-2xl">
            {game.home_team} vs {game.away_team}
          </CardTitle>
          <div className="flex items-center justify-center gap-4">
            <Badge className={`${game.game_status === 'active' ? 'bg-red-500' : 'bg-gray-500'} text-white`}>
              {game.game_status === 'active' && (
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              )}
              {game.game_status === 'active' ? 'LIVE' : game.game_status.toUpperCase()}
            </Badge>
            <Badge className="bg-blue-500 text-white">
              Period {period}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Game Clock */}
          <div className="text-center mb-8">
            <div className="text-5xl md:text-7xl font-mono font-bold text-white mb-2">
              {formatTime(game.time_remaining)}
            </div>
            {game.game_status === 'active' && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-semibold">LIVE SYNC</span>
              </div>
            )}
          </div>

          {/* Teams and Scores */}
          <div className="grid grid-cols-2 gap-8">
            {/* Home Team */}
            <div className="text-center">
              <div className="bg-white/10 rounded-lg p-6">
                {game.home_team_logo_url ? (
                  <img 
                    src={game.home_team_logo_url} 
                    alt={game.home_team}
                    className="w-16 h-16 mx-auto mb-4 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                )}
                <h3 className="text-white text-xl font-bold mb-2">{game.home_team}</h3>
                <div className="text-5xl font-bold text-white">{game.home_score}</div>
              </div>
            </div>

            {/* Away Team */}
            <div className="text-center">
              <div className="bg-white/10 rounded-lg p-6">
                {game.away_team_logo_url ? (
                  <img 
                    src={game.away_team_logo_url} 
                    alt={game.away_team}
                    className="w-16 h-16 mx-auto mb-4 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                )}
                <h3 className="text-white text-xl font-bold mb-2">{game.away_team}</h3>
                <div className="text-5xl font-bold text-white">{game.away_score}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advertisement Grid */}
      {showAds && advertisements.filter(ad => ad.position !== 'primary').length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {advertisements.filter(ad => ad.position !== 'primary').map((ad) => (
            <Card 
              key={ad.id}
              className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all"
            >
              <CardContent className="p-4 text-center">
                <div className="text-white font-semibold text-sm mb-1">{ad.advertiser_name}</div>
                <div className="text-gray-300 text-xs">${ad.monthly_rate}/month</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
  );
};
