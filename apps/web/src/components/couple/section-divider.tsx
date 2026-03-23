'use client';

import React from 'react';

type DividerType = 'wave' | 'diagonal' | 'thin-line' | 'glitch';

interface SectionDividerProps {
  type: DividerType;
  color?: string;
  className?: string;
}

function WaveDivider({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="h-8 w-full sm:h-12">
      <path
        d="M0,30 C200,0 400,60 600,30 C800,0 1000,60 1200,30 L1200,60 L0,60 Z"
        fill={color}
        opacity="0.08"
      />
      <path
        d="M0,40 C300,20 500,55 700,35 C900,15 1100,50 1200,40 L1200,60 L0,60 Z"
        fill={color}
        opacity="0.05"
      />
    </svg>
  );
}

function DiagonalDivider({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="h-6 w-full sm:h-10">
      <polygon points="0,40 1200,0 1200,40" fill={color} opacity="0.06" />
    </svg>
  );
}

function ThinLineDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="h-px flex-1" style={{ background: color, opacity: 0.15 }} />
      <div
        className="mx-4 h-1.5 w-1.5 rotate-45"
        style={{ background: color, opacity: 0.3 }}
      />
      <div className="h-px flex-1" style={{ background: color, opacity: 0.15 }} />
    </div>
  );
}

function GlitchDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1 py-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="h-0.5 flex-1"
          style={{
            background: color,
            opacity: 0.1 + Math.random() * 0.15,
            transform: `translateY(${(Math.random() - 0.5) * 6}px)`,
          }}
        />
      ))}
    </div>
  );
}

export function SectionDivider({ type, color = 'var(--color-coral)', className }: SectionDividerProps) {
  return (
    <div className={className} aria-hidden="true">
      {type === 'wave' && <WaveDivider color={color} />}
      {type === 'diagonal' && <DiagonalDivider color={color} />}
      {type === 'thin-line' && <ThinLineDivider color={color} />}
      {type === 'glitch' && <GlitchDivider color={color} />}
    </div>
  );
}
