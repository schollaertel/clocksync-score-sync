// Enhanced QR Code generator with fallback options
export const generateQRCode = (text: string, size: number = 200): string => {
  // Primary: QR Server API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&ecc=M&bgcolor=FFFFFF&color=000000`;
  return qrUrl;
};

// Generate spectator QR code with improved URL structure
export const generateSpectatorQRCode = (fieldId: string, gameId?: string): string => {
  const baseUrl = window.location.origin;
  let spectatorUrl: string;
  
  if (gameId) {
    spectatorUrl = `${baseUrl}/spectator/${gameId}?field=${fieldId}`;
  } else {
    spectatorUrl = `${baseUrl}/spectator?field=${fieldId}`;
  }
  
  console.log('Generated spectator URL:', spectatorUrl);
  return generateQRCode(spectatorUrl, 200);
};

// Generate QR code for field access
export const generateFieldQRCode = (fieldId: string): string => {
  const baseUrl = window.location.origin;
  const fieldUrl = `${baseUrl}/field/${fieldId}`;
  return generateQRCode(fieldUrl, 200);
};

// Download QR code with better error handling
export const downloadQRCode = async (text: string, filename: string = 'qrcode.png'): Promise<boolean> => {
  const qrUrl = generateQRCode(text, 400); // Higher resolution for download
  
  try {
    const response = await fetch(qrUrl);
    if (!response.ok) throw new Error('Failed to fetch QR code');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Failed to download QR code:', error);
    return false;
  }
};

// Validate QR code URL
export const validateQRCodeUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};
