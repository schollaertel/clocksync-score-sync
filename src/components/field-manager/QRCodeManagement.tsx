import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Lock, Unlock, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { useQRCodeManagement } from '@/hooks/useQRCodeManagement';
import type { Field } from '@/types/game';
import { format } from 'date-fns';

interface QRCodeManagementProps {
  field: Field;
  onFieldUpdated: () => void;
}

export const QRCodeManagement: React.FC<QRCodeManagementProps> = ({ field, onFieldUpdated }) => {
  const { loading, canManageQRCode, canRegenerateQRCode, regenerateQRCode, updateQRCodeExpiration, toggleQRCodeLock } = useQRCodeManagement(onFieldUpdated);
  
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [showExpirationDialog, setShowExpirationDialog] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [regenerateReason, setRegenerateReason] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [lockReason, setLockReason] = useState('');

  if (!canManageQRCode(field)) {
    return null;
  }

  const isExpired = field.qr_code_expires_at && new Date(field.qr_code_expires_at) < new Date();
  const isPermanent = field.qr_code_type === 'permanent';

  const handleRegenerateQRCode = async () => {
    await regenerateQRCode(field, regenerateReason);
    setShowRegenerateDialog(false);
    setRegenerateReason('');
  };

  const handleUpdateExpiration = async () => {
    const expiresAt = expirationDate ? new Date(expirationDate).toISOString() : null;
    await updateQRCodeExpiration(field, expiresAt);
    setShowExpirationDialog(false);
    setExpirationDate('');
  };

  const handleToggleLock = async () => {
    await toggleQRCodeLock(field, !field.qr_code_locked, lockReason);
    setShowLockDialog(false);
    setLockReason('');
  };

  return (
    <Card className="bg-slate-700 border-slate-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="flex items-center gap-2">
            QR Code Management
            {isPermanent && <Badge variant="outline" className="text-green-400 border-green-400">Permanent</Badge>}
            {!isPermanent && <Badge variant="outline" className="text-blue-400 border-blue-400">Temporary</Badge>}
            {field.qr_code_locked && <Lock className="w-4 h-4 text-red-400" />}
            {isExpired && <AlertTriangle className="w-4 h-4 text-red-400" />}
          </div>
        </CardTitle>
        <CardDescription className="text-gray-400">
          {isPermanent ? 'This QR code is permanent and cannot be changed' : 'This QR code can be managed and has expiration controls'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Status */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-gray-300">Status</Label>
            <div className="flex items-center gap-2 mt-1">
              {field.qr_code_locked ? (
                <Badge variant="destructive">Locked</Badge>
              ) : (
                <Badge variant="default">Active</Badge>
              )}
            </div>
          </div>
          {!isPermanent && field.qr_code_expires_at && (
            <div>
              <Label className="text-gray-300">Expires</Label>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3" />
                <span className={`text-xs ${isExpired ? 'text-red-400' : 'text-gray-300'}`}>
                  {format(new Date(field.qr_code_expires_at), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Management Controls */}
        <div className="flex flex-wrap gap-2">
          {/* Regenerate QR Code */}
          {canRegenerateQRCode(field) && !field.qr_code_locked && (
            <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Regenerate
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Regenerate QR Code</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    This will create a new QR code. The old QR code will no longer work.
                  </DialogDescription>
                </DialogHeader>
                <div>
                  <Label htmlFor="reason" className="text-gray-300">Reason (optional)</Label>
                  <Textarea
                    id="reason"
                    value={regenerateReason}
                    onChange={(e) => setRegenerateReason(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                    placeholder="Why are you regenerating this QR code?"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRegenerateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRegenerateQRCode} disabled={loading}>
                    {loading ? 'Regenerating...' : 'Regenerate QR Code'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Set Expiration (Tournament Companies Only) */}
          {!isPermanent && !field.qr_code_locked && (
            <Dialog open={showExpirationDialog} onOpenChange={setShowExpirationDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
                  <Calendar className="w-3 h-3 mr-1" />
                  Set Expiration
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Set QR Code Expiration</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Set when this QR code should expire. Leave empty for no expiration.
                  </DialogDescription>
                </DialogHeader>
                <div>
                  <Label htmlFor="expiration" className="text-gray-300">Expiration Date & Time</Label>
                  <Input
                    id="expiration"
                    type="datetime-local"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowExpirationDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateExpiration} disabled={loading}>
                    {loading ? 'Updating...' : 'Update Expiration'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Lock/Unlock QR Code */}
          <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
                {field.qr_code_locked ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                {field.qr_code_locked ? 'Unlock' : 'Lock'}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {field.qr_code_locked ? 'Unlock' : 'Lock'} QR Code
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {field.qr_code_locked 
                    ? 'Unlocking will allow the QR code to be modified again.'
                    : 'Locking will prevent any changes to this QR code until unlocked.'
                  }
                </DialogDescription>
              </DialogHeader>
              <div>
                <Label htmlFor="lockReason" className="text-gray-300">Reason (optional)</Label>
                <Textarea
                  id="lockReason"
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                  placeholder={`Why are you ${field.qr_code_locked ? 'unlocking' : 'locking'} this QR code?`}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowLockDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleToggleLock} disabled={loading}>
                  {loading 
                    ? (field.qr_code_locked ? 'Unlocking...' : 'Locking...') 
                    : (field.qr_code_locked ? 'Unlock QR Code' : 'Lock QR Code')
                  }
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Warnings */}
        {isExpired && (
          <div className="flex items-center gap-2 p-2 bg-red-900/20 border border-red-700 rounded text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            This QR code has expired and may not work for spectators.
          </div>
        )}
        
        {field.qr_code_locked && (
          <div className="flex items-center gap-2 p-2 bg-yellow-900/20 border border-yellow-700 rounded text-yellow-400 text-sm">
            <Lock className="w-4 h-4" />
            This QR code is locked and cannot be modified.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
