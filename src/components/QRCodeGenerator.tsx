import React, { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';
import { generateQRCode } from '@/lib/qrGenerator';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  value, 
  size = 200, 
  className = "" 
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    try {
      const dataUrl = generateQRCode(value, size);
      setQrCodeDataUrl(dataUrl);
      setError('');
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code');
      // Fallback to external API
      const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
      setQrCodeDataUrl(fallbackUrl);
    }
  }, [value, size]);

  if (error && !qrCodeDataUrl) {
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
        src={qrCodeDataUrl} 
        alt="QR Code" 
        className="border-2 border-gray-300 rounded-lg"
        width={size}
        height={size}
      />
      <div className="flex items-center text-sm text-gray-600">
        <QrCode className="w-4 h-4 mr-1" />
        <span>Scan to view</span>
      </div>
    </div>
  );
};
