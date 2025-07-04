import React, { useEffect, useState } from 'react';
import { QrCode, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateQRCode, generateSpectatorQRCode, generateFieldQRCode, downloadQRCode, validateQRCodeUrl } from '@/lib/qrGenerator';

interface QRCodeGeneratorProps {
  value?: string;
  fieldId?: string;
  gameId?: string;
  size?: number;
  className?: string;
  showDownload?: boolean;
  showRefresh?: boolean;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  value,
  fieldId,
  gameId,
  size = 200, 
  className = "",
  showDownload = false,
  showRefresh = false
}) => {
  const { toast } = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const generateQR = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      let qrUrl = '';
      
      if (value) {
        qrUrl = generateQRCode(value, size);
      } else if (fieldId && gameId) {
        qrUrl = generateSpectatorQRCode(fieldId, gameId);
      } else if (fieldId) {
        qrUrl = generateFieldQRCode(fieldId);
      } else {
        throw new Error('Either value or fieldId must be provided');
      }
      
      // Validate the generated URL
      setIsValidating(true);
      const isValid = await validateQRCodeUrl(qrUrl);
      setIsValidating(false);
      
      if (!isValid) {
        throw new Error('Generated QR code URL is not accessible');
      }
      
      setQrCodeUrl(qrUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  };

  useEffect(() => {
    generateQR();
  }, [value, fieldId, gameId, size]);

  const handleDownload = async () => {
    if (!qrCodeUrl) return;
    
    const targetUrl = value || generateSpectatorQRCode(fieldId!, gameId);
    const filename = `qrcode-${fieldId || 'custom'}-${Date.now()}.png`;
    
    const success = await downloadQRCode(targetUrl, filename);
    
    if (success) {
      toast({
        title: 'QR Code Downloaded',
        description: `Saved as ${filename}`,
      });
    } else {
      toast({
        title: 'Download Failed',
        description: 'Could not download QR code',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = () => {
    generateQR();
    toast({
      title: 'QR Code Refreshed',
      description: 'Generated new QR code',
    });
  };

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center space-y-2 ${className}`}>
        <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-100 animate-pulse" style={{ width: size, height: size }}>
          <div className="flex items-center justify-center h-full text-gray-500">
            <QrCode className="w-8 h-8" />
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span>Generating QR code...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center space-y-2 ${className}`}>
        <div className="border-2 border-red-300 rounded-lg p-4 bg-red-100" style={{ width: size, height: size }}>
          <div className="flex items-center justify-center h-full text-red-500">
            <QrCode className="w-8 h-8" />
          </div>
        </div>
        <div className="flex items-center text-sm text-red-600">
          <span>QR code unavailable</span>
        </div>
        {showRefresh && (
          <Button onClick={handleRefresh} size="sm" variant="outline">
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      <div className="relative">
        <img 
          src={qrCodeUrl} 
          alt="QR Code" 
          className="border-2 border-gray-300 rounded-lg shadow-lg"
          width={size}
          height={size}
          onError={() => setError('Failed to load QR code')}
        />
        {isValidating && (
          <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      <div className="flex items-center text-sm text-gray-600">
        <QrCode className="w-4 h-4 mr-1" />
        <span>Scan to view scoreboard</span>
      </div>
      
      <div className="flex gap-2">
        {showDownload && (
          <Button onClick={handleDownload} size="sm" variant="outline">
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
        )}
        {showRefresh && (
          <Button onClick={handleRefresh} size="sm" variant="outline">
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        )}
      </div>
    </div>
  );
};
