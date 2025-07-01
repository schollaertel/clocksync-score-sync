
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { PlanGate } from '@/components/PlanGate';
import { PlanBadge } from '@/components/PlanBadge';
import { FieldCard } from '@/components/field-manager/FieldCard';
import { GameCard } from '@/components/field-manager/GameCard';
import { AdvertisementCard } from '@/components/field-manager/AdvertisementCard';
import { CreateFieldForm } from '@/components/field-manager/CreateFieldForm';
import { CreateGameForm } from '@/components/field-manager/CreateGameForm';
import { CreateAdvertisementForm } from '@/components/field-manager/CreateAdvertisementForm';
import type { Game, Field, Advertisement } from '@/types/game';

const FieldManager: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [fields, setFields] = useState<Field[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState<Field | null>(null);

  // Form states
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLocation, setNewFieldLocation] = useState('');
  const [newGameHomeTeam, setNewGameHomeTeam] = useState('');
  const [newGameAwayTeam, setNewGameAwayTeam] = useState('');
  const [newGameDateTime, setNewGameDateTime] = useState('');
  const [newAdName, setNewAdName] = useState('');
  const [newAdRate, setNewAdRate] = useState('400');
  const [newAdPosition, setNewAdPosition] = useState('primary');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchFields(),
        fetchGames(),
        fetchAdvertisements()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFields = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .eq('organization_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching fields:', error);
      return;
    }

    setFields(data || []);
  };

  const fetchGames = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        fields!inner(
          organization_id
        )
      `)
      .eq('fields.organization_id', user.id)
      .order('scheduled_time', { ascending: false });

    if (error) {
      console.error('Error fetching games:', error);
      return;
    }

    // Transform the data to match our Game interface
    const transformedGames: Game[] = (data || []).map(game => ({
      id: game.id,
      field_id: game.field_id,
      home_team: game.home_team,
      away_team: game.away_team,
      home_team_logo_url: game.home_team_logo_url,
      away_team_logo_url: game.away_team_logo_url,
      home_score: game.home_score || 0,
      away_score: game.away_score || 0,
      scheduled_time: game.scheduled_time,
      game_status: (game.game_status === 'scheduled' || game.game_status === 'active' || game.game_status === 'completed' || game.game_status === 'cancelled') 
        ? game.game_status as Game['game_status']
        : 'scheduled',
      time_remaining: game.time_remaining || 720,
      created_at: game.created_at
    }));

    setGames(transformedGames);
  };

  const fetchAdvertisements = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('advertisements')
      .select(`
        *,
        fields!inner(
          organization_id
        )
      `)
      .eq('fields.organization_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching advertisements:', error);
      return;
    }

    setAdvertisements(data || []);
  };

  const createField = async () => {
    if (!user || !newFieldName.trim() || !newFieldLocation.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all field details',
        variant: 'destructive',
      });
      return;
    }

    const qrCode = `field_${user.id}_${Date.now()}`;

    const { error } = await supabase
      .from('fields')
      .insert([{
        name: newFieldName.trim(),
        location: newFieldLocation.trim(),
        organization_id: user.id,
        qr_code: qrCode
      }]);

    if (error) {
      console.error('Error creating field:', error);
      toast({
        title: 'Error',
        description: 'Failed to create field',
        variant: 'destructive',
      });
      return;
    }

    setNewFieldName('');
    setNewFieldLocation('');
    fetchFields();
    toast({
      title: 'Success',
      description: 'Field created successfully',
    });
  };

  const createGame = async () => {
    if (!selectedField || !newGameHomeTeam.trim() || !newGameAwayTeam.trim() || !newGameDateTime) {
      toast({
        title: 'Error',
        description: 'Please fill in all game details',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase
      .from('games')
      .insert([{
        field_id: selectedField.id,
        home_team: newGameHomeTeam.trim(),
        away_team: newGameAwayTeam.trim(),
        scheduled_time: newGameDateTime,
        game_status: 'scheduled',
        home_score: 0,
        away_score: 0,
        time_remaining: 720
      }]);

    if (error) {
      console.error('Error creating game:', error);
      toast({
        title: 'Error',
        description: 'Failed to create game',
        variant: 'destructive',
      });
      return;
    }

    setNewGameHomeTeam('');
    setNewGameAwayTeam('');
    setNewGameDateTime('');
    fetchGames();
    toast({
      title: 'Success',
      description: 'Game scheduled successfully',
    });
  };

  const createAdvertisement = async () => {
    if (!selectedField || !newAdName.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in advertisement details',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase
      .from('advertisements')
      .insert([{
        field_id: selectedField.id,
        advertiser_name: newAdName.trim(),
        position: newAdPosition,
        monthly_rate: parseFloat(newAdRate),
        is_active: true
      }]);

    if (error) {
      console.error('Error creating advertisement:', error);
      toast({
        title: 'Error',
        description: 'Failed to create advertisement',
        variant: 'destructive',
      });
      return;
    }

    setNewAdName('');
    setNewAdRate('400');
    fetchAdvertisements();
    toast({
      title: 'Success',
      description: 'Advertisement created successfully',
    });
  };

  const toggleAdvertisement = async (adId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('advertisements')
      .update({ is_active: !currentStatus })
      .eq('id', adId);

    if (error) {
      console.error('Error toggling advertisement:', error);
      toast({
        title: 'Error',
        description: 'Failed to update advertisement',
        variant: 'destructive',
      });
      return;
    }

    fetchAdvertisements();
    toast({
      title: 'Success',
      description: `Advertisement ${!currentStatus ? 'activated' : 'deactivated'}`,
    });
  };

  const deleteAdvertisement = async (adId: string) => {
    const { error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', adId);

    if (error) {
      console.error('Error deleting advertisement:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete advertisement',
        variant: 'destructive',
      });
      return;
    }

    fetchAdvertisements();
    toast({
      title: 'Success',
      description: 'Advertisement deleted successfully',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Field Management</h1>
            <p className="text-gray-300 flex items-center gap-2">
              Manage your fields, games, and advertisements
              <PlanBadge />
            </p>
          </div>
        </div>

        <Tabs defaultValue="fields" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger value="fields" className="text-white data-[state=active]:bg-slate-700">
              Fields ({fields.length})
            </TabsTrigger>
            <TabsTrigger value="games" className="text-white data-[state=active]:bg-slate-700">
              Games ({games.length})
            </TabsTrigger>
            <TabsTrigger value="ads" className="text-white data-[state=active]:bg-slate-700">
              Advertisements ({advertisements.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fields">
            <div className="space-y-6">
              <CreateFieldForm
                fieldName={newFieldName}
                fieldLocation={newFieldLocation}
                onFieldNameChange={setNewFieldName}
                onFieldLocationChange={setNewFieldLocation}
                onSubmit={createField}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fields.map((field) => (
                  <FieldCard
                    key={field.id}
                    field={field}
                    gameCount={games.filter(g => g.field_id === field.id).length}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="games">
            <PlanGate feature="scoreboard">
              <div className="space-y-6">
                <CreateGameForm
                  fields={fields}
                  selectedField={selectedField}
                  homeTeam={newGameHomeTeam}
                  awayTeam={newGameAwayTeam}
                  dateTime={newGameDateTime}
                  onFieldSelect={setSelectedField}
                  onHomeTeamChange={setNewGameHomeTeam}
                  onAwayTeamChange={setNewGameAwayTeam}
                  onDateTimeChange={setNewGameDateTime}
                  onSubmit={createGame}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {games.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </div>
            </PlanGate>
          </TabsContent>

          <TabsContent value="ads">
            <div className="space-y-6">
              <CreateAdvertisementForm
                fields={fields}
                selectedField={selectedField}
                advertiserName={newAdName}
                monthlyRate={newAdRate}
                position={newAdPosition}
                onFieldSelect={setSelectedField}
                onAdvertiserNameChange={setNewAdName}
                onMonthlyRateChange={setNewAdRate}
                onPositionChange={setNewAdPosition}
                onSubmit={createAdvertisement}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {advertisements.map((ad) => (
                  <AdvertisementCard
                    key={ad.id}
                    advertisement={ad}
                    fields={fields}
                    onToggle={toggleAdvertisement}
                    onDelete={deleteAdvertisement}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FieldManager;
