'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import Link from 'next/link';
import { VERIFY_EMAIL_MUTATION, REQUEST_EMAIL_VERIFICATION_MUTATION } from '../../../graphql/mutations/auth.mutations';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const [verifyEmail] = useMutation<{ verifyEmail: { accessToken: string; refreshToken: string } }>(VERIFY_EMAIL_MUTATION);
  const [resendVerification, { loading: resending }] = useMutation(REQUEST_EMAIL_VERIFICATION_MUTATION);

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    verifyEmail({ variables: { token } })
      .then(({ data }) => {
        if (data?.verifyEmail) {
          localStorage.setItem('momentee_access_token', data.verifyEmail.accessToken);
          localStorage.setItem('momentee_refresh_token', data.verifyEmail.refreshToken);
          setStatus('success');
          setTimeout(() => router.push('/dashboard'), 2000);
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Verification failed');
        setStatus('error');
      });
  }, [token, verifyEmail, router]);

  const handleResend = async () => {
    try {
      await resendVerification();
      setErrorMsg('');
      setStatus('no-token');
    } catch {
      setErrorMsg('Failed to resend. Please try again.');
    }
  };

  return (
    <Card>
      <div className="text-center">
        {status === 'loading' && (
          <>
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-sm text-gray-500">Verifying your email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Email Verified!</h1>
            <p className="mt-2 text-sm text-gray-500">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Verification Failed</h1>
            <p className="mt-2 text-sm text-red-500">{errorMsg}</p>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="primary" size="sm" loading={resending} onClick={handleResend}>
                Resend Verification Email
              </Button>
              <Link href="/login" className="text-sm text-[var(--color-coral)] hover:underline">
                Back to login
              </Link>
            </div>
          </>
        )}

        {status === 'no-token' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Check Your Email</h1>
            <p className="mt-2 text-sm text-gray-500">
              We sent a verification link to your email. Click it to verify your account.
            </p>
            <div className="mt-6 space-y-2">
              <Button variant="outline" size="sm" loading={resending} onClick={handleResend}>
                Resend Email
              </Button>
              <p className="text-xs text-gray-400">
                Already verified?{' '}
                <Link href="/login" className="text-[var(--color-coral)] hover:underline">Sign in</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
