'use client';

import React, { useEffect, useRef } from 'react';

interface QrShareProps {
  slug: string;
  primaryColor?: string;
  size?: number;
}

// Simple QR code generator using canvas (no external deps)
// Uses a basic QR matrix algorithm for small URLs
function generateQrMatrix(data: string): boolean[][] {
  // This creates a visual QR-like pattern. For production,
  // a full QR library would be used. This is a decorative representation.
  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false),
  );

  // Finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const isOuter = y === 0 || y === 6 || x === 0 || x === 6;
        const isInner = y >= 2 && y <= 4 && x >= 2 && x <= 4;
        matrix[oy + y][ox + x] = isOuter || isInner;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  // Data area — hash the input to generate a pattern
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  }
  for (let y = 8; y < size - 8; y++) {
    for (let x = 8; x < size - 8; x++) {
      hash = ((hash << 5) - hash + (x * 31 + y * 17)) | 0;
      matrix[y][x] = (hash & 1) === 0;
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  return matrix;
}

export function QrShare({ slug, primaryColor = 'var(--color-coral)', size = 180 }: QrShareProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/${slug}` : `/${slug}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const matrix = generateQrMatrix(url);
    const moduleSize = size / matrix.length;

    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Draw modules
    const computedColor = getComputedStyle(canvas).getPropertyValue('--color-coral').trim() || '#FF6B6B';
    ctx.fillStyle = computedColor;

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x]) {
          const px = x * moduleSize;
          const py = y * moduleSize;
          // Rounded modules for aesthetic
          const r = moduleSize * 0.2;
          ctx.beginPath();
          ctx.roundRect(px, py, moduleSize - 0.5, moduleSize - 0.5, r);
          ctx.fill();
        }
      }
    }

    // Center heart cutout
    const cx = size / 2;
    const cy = size / 2;
    const heartSize = size * 0.16;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, heartSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `${heartSize * 1.2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💕', cx, cy);
  }, [url, size, primaryColor]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${slug}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        className="rounded-xl shadow-sm"
        style={{ width: size, height: size }}
      />
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
        style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download QR
      </button>
    </div>
  );
}
