import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, MapPin, Calendar, Clock, Users, Home } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Field {
  id: string;
  name: string;
  location: string;
  qr_code: string;
  created_at: string;
}
interface Game {
  id: string;
  home_team: string;
  away_team: string;
  home_team_logo?: string;
  away_team_logo?: string;
  scheduled_time: string;
  field_id: string;
  status?: string;
  fields?: {
    name: string;
    location: string;
  };
}

const FieldManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [fields, setFields] = useState<Field[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [newField, setNewField] = useState({ name: '', location: '' });
  const [showNewFieldForm, setShowNewFieldForm] = useState(false);
  
  // Game creation state
  const [showNewGameForm, setShowNewGameForm] = useState(false);
  const [newGame, setNewGame] = useState({
    home_team: '',
    away_team: '',
    home_team_logo: '',
    away_team_logo: '',
    scheduled_time: '',
    scheduled_date: '',
    scheduled_time_only: '15:00',
    field_id: '',
    game_duration: 15
  });

  // Game sorting state
  const [gameSortBy, setGameSortBy] = useState<'scheduled_time' | 'status' | 'field'>('scheduled_time');
  const [gameSortOrder, setGameSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sponsor management state
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [newSponsor, setNewSponsor] = useState({
    name: '',
    logo: '',
    website: '',
    tagline: '',
    field_ids: [] as string[]
  });

  useEffect(() => {
    if (user) {
      fetchFields();
      fetchGames();
      fetchSponsors();
    }
  }, [user]);

  const fetchFields = async () => {
    try {
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .eq('organization_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFields(data || []);
    } catch (error) {
      console.error('Error fetching fields:', error);
      toast({
        title: "Error",
        description: "Failed to load fields",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGames = async () => {
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
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast({
        title: "Error",
        description: "Failed to load games",
        variant: "destructive",
      });
    }
  };

  // Sort games based on current sorting preferences
  const sortedGames = React.useMemo(() => {
    if (!games.length) return [];
    
    const sorted = [...games].sort((a, b) => {
      let aValue, bValue;
      
      switch (gameSortBy) {
        case 'scheduled_time':
          aValue = new Date(a.scheduled_time).getTime();
          bValue = new Date(b.scheduled_time).getTime();
          break;
        case 'status':
          // Prioritize live games, then scheduled, then completed
          const statusOrder = { 'live': 1, 'scheduled': 2, 'completed': 3 };
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 2;
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 2;
          break;
        case 'field':
          aValue = a.fields?.name || '';
          bValue = b.fields?.name || '';
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return gameSortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return gameSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [games, gameSortBy, gameSortOrder]);

  const createField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newField.name || !newField.location) return;

    try {
      const fieldId = crypto.randomUUID();
      const spectatorUrl = `${window.location.origin}/#spectator?field=${fieldId}`;
      const { error } = await supabase
        .from('fields')
        .insert({
          id: fieldId,
          name: newField.name,
          location: newField.location,
          organization_id: user?.id,
          qr_code: spectatorUrl,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Field created successfully",
      });
      
      setNewField({ name: '', location: '' });
      setShowNewFieldForm(false);
      fetchFields();
    } catch (error) {
      console.error('Error creating field:', error);
      toast({
        title: "Error",
        description: "Failed to create field",
        variant: "destructive",
      });
    }
  };

  const handleLogoUpload = async (file: File, team: 'home' | 'away') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `team-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('team-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('team-logos')
        .getPublicUrl(filePath);

      // Update the newGame state with the logo URL
      setNewGame(prev => ({
        ...prev,
        [`${team}_team_logo`]: publicUrl
      }));

      toast({
        title: "Success",
        description: `${team === 'home' ? 'Home' : 'Away'} team logo uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
      });
    }
  };

  const createGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // DEBUG: Log the current state
    console.log('=== CREATE GAME DEBUG ===');
    console.log('newGame state:', newGame);
    console.log('game_duration value:', newGame.game_duration);
    console.log('game_duration type:', typeof newGame.game_duration);
    console.log('game_duration truthy:', !!newGame.game_duration);
    
    // Validate all required fields
    const gameDuration = parseInt(newGame.game_duration) || 15;
    if (!newGame.home_team || !newGame.away_team || !newGame.scheduled_time || !newGame.field_id || gameDuration < 1) {
      console.log('Validation failed:');
      console.log('home_team:', !!newGame.home_team);
      console.log('away_team:', !!newGame.away_team);
      console.log('scheduled_time:', !!newGame.scheduled_time);
      console.log('field_id:', !!newGame.field_id);
      console.log('game_duration:', !!newGame.game_duration, 'parsed:', gameDuration);
      
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Handle datetime input - be more lenient with date parsing
      let scheduledDate;
      
      if (!newGame.scheduled_time || newGame.scheduled_time.trim() === '') {
        toast({
          title: "Error",
          description: "Please enter a valid date and time",
          variant: "destructive",
        });
        return;
      }
      
      // Parse the datetime-local input format (YYYY-MM-DDTHH:MM)
      scheduledDate = new Date(newGame.scheduled_time);
      
      // Check if the date is valid
      if (isNaN(scheduledDate.getTime())) {
        toast({
          title: "Error", 
          description: "Please enter a valid date and time",
          variant: "destructive",
        });
        return;
      }

      const newGameData = {
        home_team: newGame.home_team,
        away_team: newGame.away_team,
        scheduled_time: newGame.scheduled_time,
        field_id: newGame.field_id,
        home_score: 0,
        away_score: 0
      };

      const { error } = await supabase
        .from('games')
        .insert([newGameData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Game created successfully",
      });
      
      setNewGame({
        home_team: '',
        away_team: '',
        home_team_logo: '',
        away_team_logo: '',
        scheduled_time: '',
        scheduled_date: '',
        scheduled_time_only: '15:00',
        field_id: '',
        game_duration: 15
      });
      setShowNewGameForm(false);
      fetchGames();
    } catch (error) {
      console.error('Error creating game:', error);
      toast({
        title: "Error",
        description: "Failed to create game. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateField = async (field: Field) => {
    try {
      const { error } = await supabase
        .from('fields')
        .update({
          name: field.name,
          location: field.location,
        })
        .eq('id', field.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Field updated successfully",
      });
      
      setEditingField(null);
      fetchFields();
    } catch (error) {
      console.error('Error updating field:', error);
      toast({
        title: "Error",
        description: "Failed to update field",
        variant: "destructive",
      });
    }
  };

  const deleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field?')) return;

    try {
      const { error } = await supabase
        .from('fields')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Field deleted successfully",
      });
      
      fetchFields();
    } catch (error) {
      console.error('Error deleting field:', error);
      toast({
        title: "Error",
        description: "Failed to delete field",
        variant: "destructive",
      });
    }
  };

  const deleteGame = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Game deleted successfully",
      });
      
      fetchGames();
    } catch (error) {
      console.error('Error deleting game:', error);
      toast({
        title: "Error",
        description: "Failed to delete game",
        variant: "destructive",
      });
    }
  };

  // Sponsor Management Functions
  const fetchSponsors = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('organization_id', user?.id);

      if (error) throw error;
      setSponsors(data || []);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    }
  };

  const handleHomeLogoUpload = async (file: File) => {
    try {
      // First, convert to data URL for immediate display
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setNewGame(prev => ({ ...prev, home_team_logo: dataUrl }));
        
        // Then upload to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `team-logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('team-logos')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading to storage:', uploadError);
          // Keep using the data URL even if storage upload fails
          return;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('team-logos')
          .getPublicUrl(filePath);

        // Update with the storage URL
        setNewGame(prev => ({ ...prev, home_team_logo: publicUrl }));
        
        toast({
          title: "Success",
          description: "Home team logo uploaded successfully",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading home team logo:', error);
      toast({
        title: "Error",
        description: "Failed to upload home team logo",
        variant: "destructive",
      });
    }
  };

  const handleAwayLogoUpload = async (file: File) => {
    try {
      // First, convert to data URL for immediate display
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setNewGame(prev => ({ ...prev, away_team_logo: dataUrl }));
        
        // Then upload to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `team-logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('team-logos')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading to storage:', uploadError);
          // Keep using the data URL even if storage upload fails
          return;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('team-logos')
          .getPublicUrl(filePath);

        // Update with the storage URL
        setNewGame(prev => ({ ...prev, away_team_logo: publicUrl }));
        
        toast({
          title: "Success",
          description: "Away team logo uploaded successfully",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading away team logo:', error);
      toast({
        title: "Error",
        description: "Failed to upload away team logo",
        variant: "destructive",
      });
    }
  };

  const handleSponsorLogoUpload = async (file: File) => {
    try {
      // First, convert to data URL for immediate display
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setNewSponsor(prev => ({ ...prev, logo: dataUrl }));
        
        // Then upload to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `sponsor-logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('sponsor-logos')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading to storage:', uploadError);
          // Keep using the data URL even if storage upload fails
          return;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('sponsor-logos')
          .getPublicUrl(filePath);

        // Update with the storage URL
        setNewSponsor(prev => ({ ...prev, logo: publicUrl }));
        
        toast({
          title: "Success",
          description: "Sponsor logo uploaded successfully",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading sponsor logo:', error);
      toast({
        title: "Error",
        description: "Failed to upload sponsor logo",
        variant: "destructive",
      });
    }
  };

  const createSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSponsor.name || !newSponsor.logo) {
      toast({
        title: "Error",
        description: "Please fill in sponsor name and upload a logo",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('sponsors')
        .insert({
          id: crypto.randomUUID(),
          name: newSponsor.name,
          logo: newSponsor.logo,
          website: newSponsor.website,
          tagline: newSponsor.tagline,
          field_ids: newSponsor.field_ids,
          organization_id: user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sponsor created successfully",
      });

      setNewSponsor({
        name: '',
        logo: '',
        website: '',
        tagline: '',
        field_ids: []
      });
      setShowSponsorForm(false);
      fetchSponsors();
    } catch (error) {
      console.error('Error creating sponsor:', error);
      toast({
        title: "Error",
        description: "Failed to create sponsor",
        variant: "destructive",
      });
    }
  };

  const deleteSponsor = async (sponsorId: string) => {
    if (!confirm('Are you sure you want to delete this sponsor?')) return;

    try {
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', sponsorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sponsor deleted successfully",
      });
      fetchSponsors();
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      toast({
        title: "Error",
        description: "Failed to delete sponsor",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTime = (seconds: number) => {
    if (seconds === undefined || seconds === null || isNaN(seconds)) {
      return "15:00"; // Default game time
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="text-lg text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
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
          </div>
          <h1 className="text-3xl font-bold text-white">Tournament Management</h1>
        </div>

        <Tabs defaultValue="fields" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 border-white/20 mb-8">
            <TabsTrigger 
              value="fields" 
              className="text-white data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              Fields
            </TabsTrigger>
            <TabsTrigger 
              value="games" 
              className="text-white data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              Games
            </TabsTrigger>
            <TabsTrigger 
              value="sponsors" 
              className="text-white data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              Sponsors
            </TabsTrigger>
          </TabsList>

          {/* Fields Tab */}
          <TabsContent value="fields" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Field Management</h2>
              <Button 
                onClick={() => setShowNewFieldForm(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>

            {/* New Field Form */}
            {showNewFieldForm && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Create New Field</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createField} className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Field Name</Label>
                      <Input
                        id="name"
                        value={newField.name}
                        onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter field name"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-white">Location</Label>
                      <Input
                        id="location"
                        value={newField.location}
                        onChange={(e) => setNewField(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Enter field location"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Create Field
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setShowNewFieldForm(false)}
                        className="bg-orange-500 hover:bg-orange-600 text-white border-0"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Fields Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fields.map((field) => (
                <Card key={field.id} className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        {editingField?.id === field.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editingField.name}
                              onChange={(e) => setEditingField(prev => prev ? { ...prev, name: e.target.value } : null)}
                              className="font-semibold bg-white/10 border-white/20 text-white"
                            />
                            <Input
                              value={editingField.location}
                              onChange={(e) => setEditingField(prev => prev ? { ...prev, location: e.target.value } : null)}
                              className="text-sm bg-white/10 border-white/20 text-white"
                            />
                          </div>
                        ) : (
                          <>
                            <CardTitle className="text-xl text-white">{field.name}</CardTitle>
                            <div className="flex items-center text-gray-300 text-sm">
                              <MapPin className="w-4 h-4 mr-1" />
                              {field.location}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        {editingField?.id === field.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateField(editingField)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setEditingField(null)}
                              className="bg-orange-500 hover:bg-orange-600 text-white border-0"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              onClick={() => setEditingField(field)}
                              className="bg-orange-500 hover:bg-orange-600 text-white border-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteField(field.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center">
                    {/* Show QR codes for games on this field */}
                    {games.filter(game => game.field_id === field.id).length > 0 ? (
                      <div className="space-y-4">
                        {games.filter(game => game.field_id === field.id).map((game) => (
                          <div key={game.id} className="border border-white/20 rounded-lg p-3">
                            <h4 className="text-white text-sm font-semibold mb-2">
                              {game.home_team} vs {game.away_team}
                            </h4>
                            <QRCodeGenerator 
                              value={`${window.location.origin}/#/spectator?gameId=${game.id}`}
                              size={120}
                              className="mb-2"
                            />
                            <p className="text-xs text-gray-300 mb-2">
                              Scan to view this game
                            </p>
                            <Button 
                              size="sm"
                              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs"
                              onClick={() => window.open(`${window.location.origin}/#/spectator?gameId=${game.id}`, '_blank')}
                            >
                              Preview Spectator View
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <QRCodeGenerator 
                          value={`${window.location.origin}/#/spectator?field=${field.id}`}
                          size={150}
                          className="mb-4"
                        />
                        <p className="text-sm text-gray-300 mb-4">
                          General field QR code - Create games to get specific QR codes
                        </p>
                        <Button 
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={() => window.open(`${window.location.origin}/#/spectator?field=${field.id}`, '_blank')}
                        >
                          Preview Spectator View
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {fields.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-white mb-2">No fields yet</h3>
                <p className="text-gray-300 mb-4">Create your first field to start managing games and sponsors</p>
                <Button 
                  onClick={() => setShowNewFieldForm(true)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Field
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Game Management</h2>
              <Button 
                onClick={() => setShowNewGameForm(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
                disabled={fields.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Game
              </Button>
            </div>

            {/* Game Sorting Controls */}
            {games.length > 0 && (
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border-white/20 rounded-lg p-4">
                <span className="text-white font-medium">Sort by:</span>
                <Select value={gameSortBy} onValueChange={(value: 'scheduled_time' | 'status' | 'field') => setGameSortBy(value)}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled_time">Date & Time</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="field">Field</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={gameSortOrder} onValueChange={(value: 'asc' | 'desc') => setGameSortOrder(value)}>
                  <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-300">
                  {games.length} game{games.length !== 1 ? 's' : ''} total
                </div>
              </div>
            )}

            {fields.length === 0 && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="pt-6 text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-semibold mb-2">No Fields Available</h3>
                  <p className="text-gray-300 mb-4">You need to create at least one field before adding games.</p>
                  <Button 
                    onClick={() => setShowNewFieldForm(true)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Create Your First Field
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* New Game Form */}
            {showNewGameForm && fields.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Create New Game</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createGame} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="home_team" className="text-white">Home Team</Label>
                        <Input
                          id="home_team"
                          value={newGame.home_team}
                          onChange={(e) => setNewGame(prev => ({ ...prev, home_team: e.target.value }))}
                          placeholder="Enter home team name"
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="away_team" className="text-white">Away Team</Label>
                        <Input
                          id="away_team"
                          value={newGame.away_team}
                          onChange={(e) => setNewGame(prev => ({ ...prev, away_team: e.target.value }))}
                          placeholder="Enter away team name"
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Team Logo Uploads */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="home_logo" className="text-white">Home Team Logo</Label>
                        <div className="space-y-2">
                          <Input
                            id="home_logo"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleHomeLogoUpload(file);
                            }}
                            className="bg-white/10 border-white/20 text-white file:bg-white/20 file:text-white file:border-0"
                          />
                          {newGame.home_team_logo && (
                            <div className="flex items-center gap-2">
                              <img src={newGame.home_team_logo} alt="Home team logo" className="w-8 h-8 object-cover rounded" />
                              <span className="text-green-400 text-sm">✓ Logo uploaded</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="away_logo" className="text-white">Away Team Logo</Label>
                        <div className="space-y-2">
                          <Input
                            id="away_logo"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleAwayLogoUpload(file);
                            }}
                            className="bg-white/10 border-white/20 text-white file:bg-white/20 file:text-white file:border-0"
                          />
                          {newGame.away_team_logo && (
                            <div className="flex items-center gap-2">
                              <img src={newGame.away_team_logo} alt="Away team logo" className="w-8 h-8 object-cover rounded" />
                              <span className="text-green-400 text-sm">✓ Logo uploaded</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="scheduled_time" className="text-white">Scheduled Time</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="date"
                            value={newGame.scheduled_date || ''}
                            onChange={(e) => {
                              console.log('Date onChange:', e.target.value);
                              setNewGame(prev => ({
                                ...prev,
                                scheduled_date: e.target.value,
                                scheduled_time: `${e.target.value}T${prev.scheduled_time_only || '15:00'}`
                              }));
                            }}
                            required
                          />
                          <Input
                            type="time"
                            value={newGame.scheduled_time_only || '15:00'}
                            onChange={(e) => {
                              console.log('Time onChange:', e.target.value);
                              setNewGame(prev => ({
                                ...prev,
                                scheduled_time_only: e.target.value,
                                scheduled_time: `${prev.scheduled_date || '2025-07-01'}T${e.target.value}`
                              }));
                            }}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="field_id" className="text-white">Field</Label>
                        <Select value={newGame.field_id} onValueChange={(value) => setNewGame(prev => ({ ...prev, field_id: value }))}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Select a field" />
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
                    </div>
                    <div>
                      <Label htmlFor="game_duration" className="text-white">Game Duration (minutes)</Label>
                      <Input
                        id="game_duration"
                        name="game_duration"
                        type="number"
                        value={newGame.game_duration || 15}
                        defaultValue="15"
                        onChange={(e) => setNewGame(prev => ({ ...prev, game_duration: parseInt(e.target.value) || 15 }))}
                        className="bg-slate-800 border-slate-600 text-white"
                        required
                        min="1"
                        max="120"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Create Game
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setShowNewGameForm(false)}
                        className="bg-orange-500 hover:bg-orange-600 text-white border-0"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Games Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedGames.map((game) => (
                <Card key={game.id} className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          game.status === 'live' ? 'bg-red-500 animate-pulse' :
                          game.status === 'scheduled' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="text-xs text-gray-300 uppercase">{game.status}</span>
                      </div>
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
                      
                      <div className="flex justify-between items-center pt-2">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{game.home_score}</div>
                          <div className="text-xs text-gray-400">Home</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-300">Period {game.current_period || 1}</div>
                          <div className="text-sm text-gray-300">{formatTime(game.game_time)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{game.away_score}</div>
                          <div className="text-xs text-gray-400">Away</div>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button 
                          onClick={() => navigate(`/scorekeeper?gameId=${game.id}`)}
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm"
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Manage
                        </Button>
                        <Button 
                          onClick={() => deleteGame(game.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {games.length === 0 && fields.length > 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-white mb-2">No games scheduled</h3>
                <p className="text-gray-300 mb-4">Create your first game to start managing tournaments</p>
                <Button 
                  onClick={() => setShowNewGameForm(true)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Your First Game
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Sponsors Tab */}
          <TabsContent value="sponsors" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Sponsor Management</h2>
              <Button
                onClick={() => setShowSponsorForm(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Sponsor
              </Button>
            </div>

            {/* Sponsors Grid */}
            {sponsors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sponsors.map((sponsor) => (
                  <Card key={sponsor.id} className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {sponsor.logo && (
                            <img 
                              src={sponsor.logo} 
                              alt={sponsor.name} 
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <h3 className="text-white font-semibold">{sponsor.name}</h3>
                            {sponsor.tagline && (
                              <p className="text-gray-300 text-sm">{sponsor.tagline}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => deleteSponsor(sponsor.id)}
                          size="sm"
                          variant="destructive"
                          className="bg-red-500 hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {sponsor.website && (
                        <div className="mb-3">
                          <a 
                            href={sponsor.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            {sponsor.website}
                          </a>
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-300">
                        <strong>Assigned to:</strong> {sponsor.field_ids?.length || 0} field(s)
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">No sponsors added yet</div>
                <Button
                  onClick={() => setShowSponsorForm(true)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Sponsor
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Sponsor Form Modal */}
        {showSponsorForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto">
              <h3 className="text-white text-xl font-bold mb-4">Add New Sponsor</h3>
              
              <form onSubmit={createSponsor} className="space-y-4">
                <div>
                  <Label htmlFor="sponsor_name" className="text-white">Sponsor Name</Label>
                  <Input
                    id="sponsor_name"
                    value={newSponsor.name}
                    onChange={(e) => setNewSponsor(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter sponsor name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sponsor_logo" className="text-white">Sponsor Logo</Label>
                  <div className="space-y-2">
                    <Input
                      id="sponsor_logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleSponsorLogoUpload(file);
                      }}
                      className="bg-white/10 border-white/20 text-white file:bg-white/20 file:text-white file:border-0"
                    />
                    {newSponsor.logo && (
                      <div className="flex items-center gap-2">
                        <img src={newSponsor.logo} alt="Sponsor logo" className="w-12 h-12 object-cover rounded" />
                        <span className="text-green-400 text-sm">✓ Logo uploaded</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="sponsor_website" className="text-white">Website (Optional)</Label>
                  <Input
                    id="sponsor_website"
                    value={newSponsor.website}
                    onChange={(e) => setNewSponsor(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="sponsor_tagline" className="text-white">Tagline (Optional)</Label>
                  <Input
                    id="sponsor_tagline"
                    value={newSponsor.tagline}
                    onChange={(e) => setNewSponsor(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="Enter sponsor tagline"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label className="text-white">Assign to Fields</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {fields.map((field) => (
                      <label key={field.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newSponsor.field_ids.includes(field.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewSponsor(prev => ({
                                ...prev,
                                field_ids: [...prev.field_ids, field.id]
                              }));
                            } else {
                              setNewSponsor(prev => ({
                                ...prev,
                                field_ids: prev.field_ids.filter(id => id !== field.id)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-white text-sm">{field.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    type="submit"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    Add Sponsor
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowSponsorForm(false);
                      setNewSponsor({
                        name: '',
                        logo: '',
                        website: '',
                        tagline: '',
                        field_ids: []
                      });
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white border-0"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldManager;

