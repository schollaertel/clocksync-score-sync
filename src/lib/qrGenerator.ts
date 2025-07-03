export const generateQRCode = (text: string, size: number = 200): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Unable to get canvas context');
    }
  
    canvas.width = size;
    canvas.height = size;
  
    // Simple QR-like pattern generation (placeholder for actual QR algorithm)
    // This creates a basic grid pattern that resembles a QR code
    const modules = 25; // QR code module count
    const moduleSize = size / modules;
  
    // Fill background white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
  
    // Generate pattern based on text hash
    ctx.fillStyle = '#000000';
    
    const hash = simpleHash(text);
    
    // Create finder patterns (corners)
    drawFinderPattern(ctx, 0, 0, moduleSize);
    drawFinderPattern(ctx, (modules - 7) * moduleSize, 0, moduleSize);
    drawFinderPattern(ctx, 0, (modules - 7) * moduleSize, moduleSize);
  
    // Generate data modules based on text hash
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        // Skip finder pattern areas
        if (isFinderPatternArea(row, col, modules)) continue;
        
        // Generate module based on hash and position
        const shouldFill = (hash + row * col) % 3 === 0;
        
        if (shouldFill) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }
  
    return canvas.toDataURL();
  };
  
  const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };
  
  const drawFinderPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number) => {
    // Outer 7x7 square
    ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
    
    // Inner white 5x5 square
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
    
    // Inner black 3x3 square
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
  };
  
  const isFinderPatternArea = (row: number, col: number, modules: number): boolean => {
    // Top-left finder pattern
    if (row < 9 && col < 9) return true;
    // Top-right finder pattern
    if (row < 9 && col >= modules - 8) return true;
    // Bottom-left finder pattern
    if (row >= modules - 8 && col < 9) return true;
    
    return false;
  };
  