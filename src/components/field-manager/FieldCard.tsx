import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { QRCodeManagement } from './QRCodeManagement';
import { MapPin, Lock, AlertTriangle } from 'lucide-react';
import type { Field } from '@/types/game';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface FieldCardProps {
  field: Field;
  gameCount: number;
  onFieldUpdated: () => void;
}

export const FieldCard: React.FC<FieldCardProps> = ({ field, gameCount, onFieldUpdated }) => {
  const { profile } = useAuth();
  
  const isExpired = field.qr_code_expires_at && new Date(field.qr_code_expires_at) < new Date();
  const isPermanent = field.qr_code_type === 'permanent';
  const canManage = profile?.organization_type === 'tournament_company' || profile?.organization_type === 'individual';

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              {field.name}
              {field.qr_code_locked && <Lock className="w-4 h-4 text-red-400" />}
              {isExpired && <AlertTriangle className="w-4 h-4 text-red-400" />}
            </div>
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
          <div className="space-y-4">
            {/* QR Code Status Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={isPermanent ? "default" : "secondary"} className="text-xs">
                {isPermanent ? 'Permanent QR' : 'Temporary QR'}
              </Badge>
              {field.qr_code_locked && (
                <Badge variant="destructive" className="text-xs">
                  Locked
                </Badge>
              )}
              {isExpired && (
                <Badge variant="destructive" className="text-xs">
                  Expired
                </Badge>
              )}
              {!isPermanent && field.qr_code_expires_at && !isExpired && (
                <Badge variant="outline" className="text-xs border-blue-400 text-blue-400">
                  Expires {format(new Date(field.qr_code_expires_at), 'MMM dd')}
                </Badge>
              )}
            </div>

            {/* QR Code Display */}
            <div className="space-y-3">
              <QRCodeGenerator 
                value={`${window.location.origin}/spectator?field=${field.qr_code}`}
                size={120}
              />
              <p className="text-sm text-gray-400">
                Spectators can scan this QR code to view live games
                {isExpired && (
                  <span className="block text-red-400 mt-1">
                    ⚠️ This QR code has expired
                  </span>
                )}
              </p>
            </div>

            {/* QR Code Details */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>QR Code: {field.qr_code}</div>
              {field.qr_code_updated_at && (
                <div>Last updated: {format(new Date(field.qr_code_updated_at), 'MMM dd, yyyy HH:mm')}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Management (only for tournament companies and admins) */}
      {canManage && (
        <QRCodeManagement field={field} onFieldUpdated={onFieldUpdated} />
      )}
    </div>
  );
};
