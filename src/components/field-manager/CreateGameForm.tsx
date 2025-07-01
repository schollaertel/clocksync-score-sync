
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import type { Field } from '@/types/game';

interface CreateGameFormProps {
  fields: Field[];
  selectedField: Field | null;
  homeTeam: string;
  awayTeam: string;
  dateTime: string;
  onFieldSelect: (field: Field | null) => void;
  onHomeTeamChange: (value: string) => void;
  onAwayTeamChange: (value: string) => void;
  onDateTimeChange: (value: string) => void;
  onSubmit: () => void;
}

export const CreateGameForm: React.FC<CreateGameFormProps> = ({
  fields,
  selectedField,
  homeTeam,
  awayTeam,
  dateTime,
  onFieldSelect,
  onHomeTeamChange,
  onAwayTeamChange,
  onDateTimeChange,
  onSubmit
}) => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Schedule New Game
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-gray-300">Select Field</Label>
          <Select value={selectedField?.id || ''} onValueChange={(value) => 
            onFieldSelect(fields.find(f => f.id === value) || null)
          }>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Choose a field" />
            </SelectTrigger>
            <SelectContent>
              {fields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.name} - {field.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="homeTeam" className="text-gray-300">Home Team</Label>
            <Input
              id="homeTeam"
              value={homeTeam}
              onChange={(e) => onHomeTeamChange(e.target.value)}
              placeholder="Home team name"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="awayTeam" className="text-gray-300">Away Team</Label>
            <Input
              id="awayTeam"
              value={awayTeam}
              onChange={(e) => onAwayTeamChange(e.target.value)}
              placeholder="Away team name"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="gameDateTime" className="text-gray-300">Date & Time</Label>
            <Input
              id="gameDateTime"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => onDateTimeChange(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>
        <Button onClick={onSubmit} className="bg-blue-600 hover:bg-blue-700">
          Schedule Game
        </Button>
      </CardContent>
    </Card>
  );
};
