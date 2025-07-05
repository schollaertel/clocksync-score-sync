import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { QRCodeType } from '@/types/game';
import type { OrganizationType } from '@/types/auth';

export const useFieldOperations = (onFieldCreated: () => void) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLocation, setNewFieldLocation] = useState('');

  const getDefaultQRCodeType = (): QRCodeType => {
    if (!profile) return 'permanent';
    
    // Map existing organization types
    const orgType: OrganizationType = profile.organization_type || 'facility';
    
    switch (orgType) {
      case 'facility':
        return 'permanent';
      case 'tournament_company':
        return 'temporary';
      default:
        return 'permanent';
    }
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
    const qrCodeType = getDefaultQRCodeType();

    const fieldData = {
      name: newFieldName.trim(),
      location: newFieldLocation.trim(),
      organization_id: user.id,
      qr_code: qrCode,
      qr_code_type: qrCodeType,
      qr_code_locked: false,
      qr_code_expires_at: null
    };

    const { data, error } = await supabase
      .from('fields')
      .insert([fieldData])
      .select()
      .single();

    if (error) {
      console.error('Error creating field:', error);
      toast({
        title: 'Error',
        description: 'Failed to create field',
        variant: 'destructive',
      });
      return;
    }

    // Log the creation in audit table
    await supabase
      .from('qr_code_audit')
      .insert([{
        field_id: data.id,
        user_id: user.id,
        action: 'created',
        new_qr_code: qrCode,
        reason: 'Field created'
      }]);

    setNewFieldName('');
    setNewFieldLocation('');
    onFieldCreated();
    
    const orgTypeText = qrCodeType === 'permanent' ? 'permanent' : 'temporary';
    toast({
      title: 'Success',
      description: `Field created successfully with ${orgTypeText} QR code`,
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
