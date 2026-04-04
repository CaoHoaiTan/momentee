import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s - Momentee',
    default: 'Sign In - Momentee',
  },
  description: 'Sign in or create your Momentee account to start your love story.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--color-coral)] to-[var(--color-orange)] p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
