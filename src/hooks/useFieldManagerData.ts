
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Game, Field, Advertisement } from '@/types/game';
import type { AppRole } from '@/types/user';

export const useFieldManagerData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fields, setFields] = useState<Field[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('FieldManager mounted, user:', user?.email);
    if (user) {
      checkAndAssignRoles();
      fetchData();
    }
  }, [user]);

  const checkAndAssignRoles = async () => {
    if (!user) return;
    
    try {
      const { data: existingRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error checking user roles:', error);
        return;
      }

      if (!existingRoles || existingRoles.length === 0) {
        console.log('User has no roles, assigning default roles...');
        
        const rolesToAssign: Array<{ user_id: string; role: AppRole }> = [
          { user_id: user.id, role: 'admin' as AppRole },
          { user_id: user.id, role: 'scorekeeper' as AppRole }
        ];

        const { error: assignError } = await supabase
          .from('user_roles')
          .insert(rolesToAssign);

        if (assignError) {
          console.error('Error assigning roles:', assignError);
        } else {
          console.log('Default roles assigned successfully');
          toast({
            title: 'Roles Assigned',
            description: 'You now have admin and scorekeeper access.',
          });
        }
      }
    } catch (error) {
      console.error('Error in role assignment:', error);
    }
  };

  const fetchData = async () => {
    try {
      console.log('Fetching data...');
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
    
    console.log('Fetching fields for user:', user.id);
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .eq('organization_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching fields:', error);
      return;
    }

    console.log('Fields fetched:', data?.length || 0);
    setFields(data || []);
  };

  const fetchGames = async () => {
    if (!user) return;
    
    console.log('Fetching games for user:', user.id);
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
      game_status: (['scheduled', 'active', 'completed', 'cancelled'].includes(game.game_status)) 
        ? game.game_status as Game['game_status']
        : 'scheduled',
      time_remaining: game.time_remaining || 720,
      created_at: game.created_at
    }));

    console.log('Games fetched:', transformedGames.length);
    setGames(transformedGames);
  };

  const fetchAdvertisements = async () => {
    if (!user) return;
    
    console.log('Fetching advertisements for user:', user.id);
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

    console.log('Advertisements fetched:', data?.length || 0);
    setAdvertisements(data || []);
  };

  return {
    fields,
    games,
    advertisements,
    loading,
    fetchFields,
    fetchGames,
    fetchAdvertisements,
    refetchData: fetchData
  };
};
