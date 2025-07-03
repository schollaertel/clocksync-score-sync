
import React from 'react';
import { GameCard } from './GameCard';
import { CreateGameForm } from './CreateGameForm';
import type { Field, Game } from '@/types/game';

interface GamesTabProps {
  fields: Field[];
  games: Game[];
  selectedField: Field | null;
  homeTeam: string;
  awayTeam: string;
  dateTime: string;
  onFieldSelect: (field: Field | null) => void;
  onHomeTeamChange: (value: string) => void;
  onAwayTeamChange: (value: string) => void;
  onDateTimeChange: (value: string) => void;
  onCreateGame: () => void;
}

export const GamesTab: React.FC<GamesTabProps> = ({
  fields,
  games,
  selectedField,
  homeTeam,
  awayTeam,
  dateTime,
  onFieldSelect,
  onHomeTeamChange,
  onAwayTeamChange,
  onDateTimeChange,
  onCreateGame
}) => {
  return (
    <div className="space-y-6">
      <CreateGameForm
        fields={fields}
        selectedField={selectedField}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        dateTime={dateTime}
        onFieldSelect={onFieldSelect}
        onHomeTeamChange={onHomeTeamChange}
        onAwayTeamChange={onAwayTeamChange}
        onDateTimeChange={onDateTimeChange}
        onSubmit={onCreateGame}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {games.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No games scheduled yet. Create your first game above!</p>
        </div>
      )}
    </div>
  );
};
