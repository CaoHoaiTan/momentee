'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-2xl bg-white shadow-sm border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  );
}
