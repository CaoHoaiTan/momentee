'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-2xl shadow-sm border p-6 ${className}`}
      style={{
        background: 'var(--theme-surface, #ffffff)',
        borderColor: 'var(--theme-border, #f3f4f6)',
      }}
    >
      {children}
    </div>
  );
}
