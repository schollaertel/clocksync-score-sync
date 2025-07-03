
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload } from 'lucide-react';
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
  const [homeTeamLogo, setHomeTeamLogo] = React.useState<File | null>(null);
  const [awayTeamLogo, setAwayTeamLogo] = React.useState<File | null>(null);
  const [homeLogoPreview, setHomeLogoPreview] = React.useState<string>('');
  const [awayLogoPreview, setAwayLogoPreview] = React.useState<string>('');
  const [gameDuration, setGameDuration] = React.useState('720'); // 12 minutes default

  const handleHomeLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setHomeTeamLogo(file);
      const url = URL.createObjectURL(file);
      setHomeLogoPreview(url);
    }
  };

  const handleAwayLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAwayTeamLogo(file);
      const url = URL.createObjectURL(file);
      setAwayLogoPreview(url);
    }
  };

  const handleSubmitWithLogos = () => {
    // For now, call the original submit - we'll enhance this to handle logo uploads
    onSubmit();
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Schedule New Game
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
        
        {/* Teams Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Home Team */}
          <div className="space-y-3">
            <Label htmlFor="homeTeam" className="text-gray-300 text-lg font-semibold">Home Team</Label>
            <Input
              id="homeTeam"
              value={homeTeam}
              onChange={(e) => onHomeTeamChange(e.target.value)}
              placeholder="Home team name"
              className="bg-slate-700 border-slate-600 text-white"
            />
            <div>
              <Label className="text-gray-300 text-sm">Team Logo</Label>
              <div className="mt-2 flex items-center gap-3">
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white hover:bg-slate-600 transition-colors text-sm">
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHomeLogoUpload}
                    className="hidden"
                  />
                </label>
                {homeLogoPreview && (
                  <img
                    src={homeLogoPreview}
                    alt="Home team logo"
                    className="w-12 h-12 object-cover rounded border border-slate-600"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Away Team */}
          <div className="space-y-3">
            <Label htmlFor="awayTeam" className="text-gray-300 text-lg font-semibold">Away Team</Label>
            <Input
              id="awayTeam"
              value={awayTeam}
              onChange={(e) => onAwayTeamChange(e.target.value)}
              placeholder="Away team name"
              className="bg-slate-700 border-slate-600 text-white"
            />
            <div>
              <Label className="text-gray-300 text-sm">Team Logo</Label>
              <div className="mt-2 flex items-center gap-3">
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white hover:bg-slate-600 transition-colors text-sm">
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAwayLogoUpload}
                    className="hidden"
                  />
                </label>
                {awayLogoPreview && (
                  <img
                    src={awayLogoPreview}
                    alt="Away team logo"
                    className="w-12 h-12 object-cover rounded border border-slate-600"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Game Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gameDateTime" className="text-gray-300">Game Date & Time</Label>
            <Input
              id="gameDateTime"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => onDateTimeChange(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="gameDuration" className="text-gray-300">Game Duration (seconds)</Label>
            <Select value={gameDuration} onValueChange={setGameDuration}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="720">12 minutes (720s)</SelectItem>
                <SelectItem value="900">15 minutes (900s)</SelectItem>
                <SelectItem value="1200">20 minutes (1200s)</SelectItem>
                <SelectItem value="1800">30 minutes (1800s)</SelectItem>
                <SelectItem value="2700">45 minutes (2700s)</SelectItem>
                <SelectItem value="3600">60 minutes (3600s)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSubmitWithLogos} className="bg-blue-600 hover:bg-blue-700 w-full">
          Schedule Game
        </Button>
      </CardContent>
    </Card>
  );
};
