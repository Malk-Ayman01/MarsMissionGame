import React, { useEffect, useRef, useState } from 'react';

interface PixelImageProps {
  src: string;
  alt: string;
  className?: string;
  pixelWidth?: number;
  colorLevels?: number;
  style?: React.CSSProperties;
  onHideOnError?: boolean;
}

// 4x4 ordered Bayer dithering matrix normalized around [-0.5, 0.5]
const BAYER_4X4 = [
  [-0.46875, 0.03125, -0.34375, 0.15625],
  [0.28125, -0.21875, 0.40625, -0.09375],
  [-0.28125, 0.21875, -0.40625, 0.09375],
  [0.46875, -0.03125, 0.34375, -0.15625],
];

export const PixelImage: React.FC<PixelImageProps> = ({
  src,
  alt,
  className = '',
  pixelWidth = 180,
  colorLevels = 7,
  style,
  onHideOnError = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasError, setHasError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHasError(false);
    setReady(false);

    const img = new Image();
    if (/^https?:\/\//i.test(src)) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      if (cancelled || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const aspect =
        img.naturalWidth > 0 && img.naturalHeight > 0
          ? img.naturalHeight / img.naturalWidth
          : 9 / 16;
      const w = Math.max(32, pixelWidth);
      const h = Math.max(24, Math.round(w * aspect));

      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, w, h);

      try {
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const step = 255 / Math.max(2, colorLevels - 1);
        const ditherScale = step * 0.65;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            if (data[idx + 3] < 128) {
              data[idx + 3] = 0;
              continue;
            }
            data[idx + 3] = 255;
            const threshold = BAYER_4X4[y & 3][x & 3] * ditherScale;
            for (let c = 0; c < 3; c++) {
              const val = Math.max(0, Math.min(255, data[idx + c] + threshold));
              data[idx + c] = Math.round(val / step) * step;
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch {
        // If tainted CORS, fallback keeps low-res nearest-neighbor pixelation
      }

      setReady(true);
    };

    img.onerror = () => {
      if (!cancelled) {
        setHasError(true);
      }
    };

    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src, pixelWidth, colorLevels]);

  if (hasError && onHideOnError) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-label={alt}
      role="img"
      className={`pixelated ${ready ? 'opacity-100' : 'opacity-0'} transition-opacity duration-150 ${className}`}
      style={{
        imageRendering: 'pixelated',
        ...style,
      }}
    />
  );
};
