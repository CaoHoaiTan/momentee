import type { Metadata } from 'next';
import { Suspense } from 'react';
import VerifyEmailContent from './verify-email-content';

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your Momentee email address.',
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-coral)]" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
