import React, { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';
import { generateQRCode, generateSpectatorQRCode } from '@/lib/qrGenerator';

interface QRCodeGeneratorProps {
  value?: string;
  fieldId?: string;
  gameId?: string;
  size?: number;
  className?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  value,
  fieldId,
  gameId,
  size = 200, 
  className = "" 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    try {
      let qrUrl = '';
      
      if (value) {
        qrUrl = generateQRCode(value, size);
      } else if (fieldId) {
        qrUrl = generateSpectatorQRCode(fieldId, gameId);
      } else {
        throw new Error('Either value or fieldId must be provided');
      }
      
      setQrCodeUrl(qrUrl);
      setError('');
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code');
    }
  }, [value, fieldId, gameId, size]);

  if (error) {
    return (
      <div className={`flex flex-col items-center space-y-2 ${className}`}>
        <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-100" style={{ width: size, height: size }}>
          <div className="flex items-center justify-center h-full text-gray-500">
            <QrCode className="w-8 h-8" />
          </div>
        </div>
        <div className="flex items-center text-sm text-red-600">
          <span>QR code unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <img 
        src={qrCodeUrl} 
        alt="QR Code" 
        className="border-2 border-gray-300 rounded-lg"
        width={size}
        height={size}
        onError={() => setError('Failed to load QR code')}
      />
      <div className="flex items-center text-sm text-gray-600">
        <QrCode className="w-4 h-4 mr-1" />
        <span>Scan to view scoreboard</span>
      </div>
    </div>
  );
};
