
import React from 'react';
import { QrCode } from 'lucide-react';

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
  // Generate QR code URL using a free QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <img 
        src={qrCodeUrl} 
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
