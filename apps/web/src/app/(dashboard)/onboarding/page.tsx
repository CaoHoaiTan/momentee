'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { useAuth } from '../../../hooks/useAuth';
import { useCouple } from '../../../hooks/useCouple';
import { CREATE_COUPLE, ACCEPT_INVITE } from '../../../graphql/mutations/couple.mutations';
import { GET_MY_COUPLE } from '../../../graphql/queries/couple.queries';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card } from '../../../components/ui/card';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { slugify } from '@momentee/shared';

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { couple, loading: coupleLoading } = useCouple();

  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [bio, setBio] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');

  const [createCouple, { loading: creating }] = useMutation(CREATE_COUPLE, {
    refetchQueries: [{ query: GET_MY_COUPLE }],
    onError: (error) => setError(error.message),
  });

  const [acceptInvite, { loading: joining }] = useMutation(ACCEPT_INVITE, {
    refetchQueries: [{ query: GET_MY_COUPLE }],
    onError: (error) => setError(error.message),
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!coupleLoading && couple) {
      router.push('/dashboard');
    }
  }, [coupleLoading, couple, router]);

  if (authLoading || coupleLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || couple) return null;

  const slug = displayName ? slugify(displayName) : '';

  const handleCreate = async () => {
    setError('');
    if (displayName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    try {
      await createCouple({
        variables: {
          input: {
            displayName,
            anniversary: anniversary || undefined,
            bio: bio || undefined,
          },
        },
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const handleJoin = async () => {
    setError('');
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }
    try {
      await acceptInvite({
        variables: { inviteCode: inviteCode.trim() },
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <div className="mx-auto max-w-lg py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {mode === 'create' ? 'Create Your Couple Page' : 'Join Your Partner'}
        </h1>
        <p className="mt-2 text-gray-500">
          {mode === 'create'
            ? 'Set up your love story in a few simple steps.'
            : 'Enter the invite code your partner shared with you.'}
        </p>

        {/* Mode toggle */}
        <div className="mt-6 flex items-center justify-center gap-1 rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => { setMode('create'); setError(''); }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === 'create' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Create new page
          </button>
          <button
            onClick={() => { setMode('join'); setError(''); }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === 'join' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Join partner&apos;s page
          </button>
        </div>

        {/* Step indicators (create mode only) */}
        {mode === 'create' && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full transition-colors ${
                  s <= step
                    ? 'bg-[var(--color-coral)]'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {mode === 'join' ? (
        /* ─── Join Partner Flow ─── */
        <Card>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Enter invite code
            </h2>
            <p className="text-sm text-gray-500">
              Ask your partner for the invite code from their Settings page.
            </p>
            <Input
              label="Invite Code"
              placeholder="e.g. ABC12345"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              error={error || undefined}
            />
            <div className="flex justify-end">
              <Button loading={joining} onClick={handleJoin}>
                Join Couple Page
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        /* ─── Create Couple Flow (existing) ─── */
        <Card>
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                What&apos;s your couple name?
              </h2>
              <p className="text-sm text-gray-500">
                This will be shown on your public page.
              </p>
              <Input
                label="Couple Name"
                placeholder="e.g. Minh & Linh"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                error={error && step === 1 ? error : undefined}
              />
              {slug && (
                <p className="text-sm text-gray-400">
                  Your page: momentee.dev/<span className="font-medium text-gray-600">{slug}</span>
                </p>
              )}
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    if (displayName.length < 2) {
                      setError('Name must be at least 2 characters');
                      return;
                    }
                    setError('');
                    setStep(2);
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                When did your love story begin?
              </h2>
              <p className="text-sm text-gray-500">
                We&apos;ll count the days you&apos;ve been together.
              </p>
              <Input
                label="Anniversary Date"
                type="date"
                value={anniversary}
                onChange={(e) => setAnniversary(e.target.value)}
              />
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                  >
                    Skip
                  </Button>
                  <Button onClick={() => setStep(3)}>Next</Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Tell your story
              </h2>
              <p className="text-sm text-gray-500">
                A short bio for your couple page (optional).
              </p>
              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base transition-colors focus:border-[var(--color-coral)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]/20"
                  rows={4}
                  maxLength={500}
                  placeholder="How did you two meet?"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-400">
                  {bio.length}/500
                </p>
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button loading={creating} onClick={handleCreate}>
                  Create Couple Page
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
