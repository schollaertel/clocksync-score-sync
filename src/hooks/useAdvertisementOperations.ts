
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Field } from '@/types/game';

export const useAdvertisementOperations = (onAdvertisementUpdated: () => void) => {
  const { toast } = useToast();
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [newAdName, setNewAdName] = useState('');
  const [newAdRate, setNewAdRate] = useState('400');
  const [newAdPosition, setNewAdPosition] = useState('primary');

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
    onAdvertisementUpdated();
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

    onAdvertisementUpdated();
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

    onAdvertisementUpdated();
    toast({
      title: 'Success',
      description: 'Advertisement deleted successfully',
    });
  };

  return {
    selectedField,
    newAdName,
    newAdRate,
    newAdPosition,
    setSelectedField,
    setNewAdName,
    setNewAdRate,
    setNewAdPosition,
    createAdvertisement,
    toggleAdvertisement,
    deleteAdvertisement
  };
};
