// Real QR Code generator using API fallback
export const generateQRCode = (text: string, size: number = 200): string => {
  // Use QR Server API as primary method
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&ecc=M`;
  return qrUrl;
};

// Alternative: Generate QR code URL for spectator access
export const generateSpectatorQRCode = (fieldId: string, gameId?: string): string => {
  const baseUrl = window.location.origin;
  const spectatorUrl = gameId 
    ? `${baseUrl}/spectator/${gameId}?field=${fieldId}`
    : `${baseUrl}/spectator?field=${fieldId}`;
  
  return generateQRCode(spectatorUrl, 200);
};

// Generate QR code data URL for download/display
export const downloadQRCode = async (text: string, filename: string = 'qrcode.png'): Promise<void> => {
  const qrUrl = generateQRCode(text);
  
  try {
    const response = await fetch(qrUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download QR code:', error);
  }
};
