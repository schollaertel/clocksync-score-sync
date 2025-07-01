import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { PlanGate } from '@/components/PlanGate';
import { PlanBadge } from '@/components/PlanBadge';
import { Calendar, MapPin, Users, DollarSign, Zap, Settings, Plus, Edit, Trash2, Eye, EyeOff, Upload, Download, Clock, Trophy, Target, Gamepad2 } from 'lucide-react';
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
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create New Field
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fieldName" className="text-gray-300">Field Name</Label>
                      <Input
                        id="fieldName"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        placeholder="Enter field name"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fieldLocation" className="text-gray-300">Location</Label>
                      <Input
                        id="fieldLocation"
                        value={newFieldLocation}
                        onChange={(e) => setNewFieldLocation(e.target.value)}
                        placeholder="Enter field location"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <Button onClick={createField} className="bg-green-600 hover:bg-green-700">
                    Create Field
                  </Button>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fields.map((field) => (
                  <Card key={field.id} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                        {field.name}
                        <Badge variant="outline" className="text-gray-300 border-gray-600">
                          {games.filter(g => g.field_id === field.id).length} games
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-gray-400 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {field.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <QRCodeGenerator 
                          value={`${window.location.origin}/spectator?field=${field.qr_code}`}
                          size={120}
                        />
                        <p className="text-sm text-gray-400">
                          Spectators can scan this QR code to view live games
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="games">
            <PlanGate feature="scoreboard">
              <div className="space-y-6">
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
                        setSelectedField(fields.find(f => f.id === value) || null)
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
                          value={newGameHomeTeam}
                          onChange={(e) => setNewGameHomeTeam(e.target.value)}
                          placeholder="Home team name"
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="awayTeam" className="text-gray-300">Away Team</Label>
                        <Input
                          id="awayTeam"
                          value={newGameAwayTeam}
                          onChange={(e) => setNewGameAwayTeam(e.target.value)}
                          placeholder="Away team name"
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gameDateTime" className="text-gray-300">Date & Time</Label>
                        <Input
                          id="gameDateTime"
                          type="datetime-local"
                          value={newGameDateTime}
                          onChange={(e) => setNewGameDateTime(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                    <Button onClick={createGame} className="bg-blue-600 hover:bg-blue-700">
                      Schedule Game
                    </Button>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {games.map((game) => (
                    <Card key={game.id} className="bg-slate-800 border-slate-700">
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
                  ))}
                </div>
              </div>
            </PlanGate>
          </TabsContent>

          <TabsContent value="ads">
            <div className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create Advertisement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Select Field</Label>
                    <Select value={selectedField?.id || ''} onValueChange={(value) => 
                      setSelectedField(fields.find(f => f.id === value) || null)
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
                      <Label htmlFor="adName" className="text-gray-300">Advertiser Name</Label>
                      <Input
                        id="adName"
                        value={newAdName}
                        onChange={(e) => setNewAdName(e.target.value)}
                        placeholder="Company or sponsor name"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="adRate" className="text-gray-300">Monthly Rate ($)</Label>
                      <Input
                        id="adRate"
                        type="number"
                        value={newAdRate}
                        onChange={(e) => setNewAdRate(e.target.value)}
                        placeholder="400"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Position</Label>
                      <Select value={newAdPosition} onValueChange={setNewAdPosition}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="secondary">Secondary</SelectItem>
                          <SelectItem value="banner">Banner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={createAdvertisement} className="bg-purple-600 hover:bg-purple-700">
                    Create Advertisement
                  </Button>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {advertisements.map((ad) => (
                  <Card key={ad.id} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                        {ad.advertiser_name}
                        <div className="flex items-center gap-2">
                          <Badge variant={ad.is_active ? 'default' : 'secondary'}>
                            {ad.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleAdvertisement(ad.id, ad.is_active)}
                            className="text-gray-400 hover:text-white p-1"
                          >
                            {ad.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteAdvertisement(ad.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {fields.find(f => f.id === ad.field_id)?.name} - {ad.position}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Monthly Rate:</span>
                        <span className="text-green-400 font-semibold">
                          ${ad.monthly_rate || 400}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
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
