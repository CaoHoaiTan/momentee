'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { useToast } from '../../../../lib/toast-context';
import { useAuth } from '../../../../hooks/useAuth';
import { useCouple } from '../../../../hooks/useCouple';
import { GET_WISHES } from '../../../../graphql/queries/wish.queries';
import { DELETE_WISH } from '../../../../graphql/mutations/wish.mutations';
import { WishCard } from '../../../../components/couple/wish-card';
import { ConfirmModal } from '../../../../components/ui/confirm-modal';
import { LoadingSpinner } from '../../../../components/ui/loading-spinner';
import type { WishData } from '../../../../components/couple/wish-card';

export default function WishesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { couple, loading: coupleLoading } = useCouple();
  const { showError, showSuccess } = useToast();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading && !coupleLoading && isAuthenticated && !couple) {
      router.push('/onboarding');
    }
  }, [authLoading, coupleLoading, isAuthenticated, couple, router]);

  const { data, loading: wishesLoading } = useQuery<{ wishes: WishData[] }>(GET_WISHES, {
    variables: { coupleId: couple?.id, limit: 100 },
    skip: !couple?.id,
  });

  const [deleteWish, { loading: deleting }] = useMutation(DELETE_WISH, {
    refetchQueries: [{ query: GET_WISHES, variables: { coupleId: couple?.id, limit: 100 } }],
    onError: (error) => showError(error.message),
    onCompleted: () => showSuccess('Wish deleted'),
  });

  if (authLoading || coupleLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !couple) return null;

  const wishes = data?.wishes ?? [];

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteWish({ variables: { id: deleteId } });
    setDeleteId(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wishes</h1>
        <p className="mt-1 text-gray-500">
          Blessings and messages from your friends & family.
        </p>
      </div>

      {wishesLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : wishes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
          <span className="text-5xl">💌</span>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No wishes yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Share your public page to receive wishes from loved ones
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishes.map((wish) => (
            <WishCard
              key={wish.id}
              wish={wish}
              isOwner
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Wish"
        message="Are you sure you want to delete this wish? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
