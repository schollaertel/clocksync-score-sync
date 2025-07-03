
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Field } from '@/types/game';

export const useFieldOperations = (onFieldCreated: () => void) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLocation, setNewFieldLocation] = useState('');

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
    onFieldCreated();
    toast({
      title: 'Success',
      description: 'Field created successfully',
    });
  };

  return {
    newFieldName,
    newFieldLocation,
    setNewFieldName,
    setNewFieldLocation,
    createField
  };
};
