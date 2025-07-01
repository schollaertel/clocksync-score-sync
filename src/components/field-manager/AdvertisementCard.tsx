
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import type { Advertisement, Field } from '@/types/game';

interface AdvertisementCardProps {
  advertisement: Advertisement;
  fields: Field[];
  onToggle: (adId: string, currentStatus: boolean) => void;
  onDelete: (adId: string) => void;
}

export const AdvertisementCard: React.FC<AdvertisementCardProps> = ({ 
  advertisement, 
  fields, 
  onToggle, 
  onDelete 
}) => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          {advertisement.advertiser_name}
          <div className="flex items-center gap-2">
            <Badge variant={advertisement.is_active ? 'default' : 'secondary'}>
              {advertisement.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggle(advertisement.id, advertisement.is_active)}
              className="text-gray-400 hover:text-white p-1"
            >
              {advertisement.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(advertisement.id)}
              className="text-red-400 hover:text-red-300 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription className="text-gray-400">
          {fields.find(f => f.id === advertisement.field_id)?.name} - {advertisement.position}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Monthly Rate:</span>
          <span className="text-green-400 font-semibold">
            ${advertisement.monthly_rate || 400}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
