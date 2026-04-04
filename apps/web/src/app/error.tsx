'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="text-5xl">😵</div>
      <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
      <p className="max-w-md text-center text-sm text-gray-500">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <div className="flex gap-3">
        <Button variant="primary" onClick={reset}>
          Try Again
        </Button>
        <Link href="/">
          <Button variant="ghost">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
