
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Game } from '@/types/game';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-lg">
          {game.home_team} vs {game.away_team}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {new Date(game.scheduled_time).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Score:</span>
            <span className="text-white font-mono">
              {game.home_score} - {game.away_score}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Status:</span>
            <Badge variant={
              game.game_status === 'active' ? 'default' :
              game.game_status === 'completed' ? 'secondary' : 'outline'
            }>
              {game.game_status}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Time:</span>
            <span className="text-white">
              {Math.floor(game.time_remaining / 60)}:{(game.time_remaining % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
