
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { MapPin } from 'lucide-react';
import type { Field, Game } from '@/types/game';

interface FieldCardProps {
  field: Field;
  gameCount: number;
}

export const FieldCard: React.FC<FieldCardProps> = ({ field, gameCount }) => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          {field.name}
          <Badge variant="outline" className="text-gray-300 border-gray-600">
            {gameCount} games
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
  );
};
