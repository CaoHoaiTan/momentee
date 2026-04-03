'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { useToast } from '../../../../lib/toast-context';
import { useAuth } from '../../../../hooks/useAuth';
import { useCouple } from '../../../../hooks/useCouple';
import { GET_MILESTONES } from '../../../../graphql/queries/milestone.queries';
import {
  CREATE_MILESTONE,
  UPDATE_MILESTONE,
  DELETE_MILESTONE,
} from '../../../../graphql/mutations/milestone.mutations';
import { Timeline } from '../../../../components/couple/timeline';
import { MilestoneForm } from '../../../../components/couple/milestone-form';
import { ConfirmModal } from '../../../../components/ui/confirm-modal';
import { Button } from '../../../../components/ui/button';
import { LoadingSpinner } from '../../../../components/ui/loading-spinner';

interface MilestoneData {
  id: string;
  coupleId: string;
  title: string;
  description: string | null;
  date: string;
  icon: string | null;
  photo: string | null;
  sortOrder: number;
  createdAt: string;
}

export default function MilestonesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { couple, loading: coupleLoading } = useCouple();
  const { showError, showSuccess } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<MilestoneData | null>(null);
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

  const { data, loading: milestonesLoading } = useQuery<{
    milestones: MilestoneData[];
  }>(GET_MILESTONES, {
    variables: { coupleId: couple?.id },
    skip: !couple?.id,
  });

  const [createMilestone, { loading: creating }] = useMutation(CREATE_MILESTONE, {
    refetchQueries: [{ query: GET_MILESTONES, variables: { coupleId: couple?.id } }],
    onError: (error) => showError(error.message),
    onCompleted: () => showSuccess('Milestone created!'),
  });

  const [updateMilestone, { loading: updating }] = useMutation(UPDATE_MILESTONE, {
    refetchQueries: [{ query: GET_MILESTONES, variables: { coupleId: couple?.id } }],
    onError: (error) => showError(error.message),
    onCompleted: () => showSuccess('Milestone updated!'),
  });

  const [deleteMilestone, { loading: deleting }] = useMutation(DELETE_MILESTONE, {
    refetchQueries: [{ query: GET_MILESTONES, variables: { coupleId: couple?.id } }],
    onError: (error) => showError(error.message),
    onCompleted: () => showSuccess('Milestone deleted'),
  });

  if (authLoading || coupleLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !couple) return null;

  const milestones = data?.milestones ?? [];

  const handleCreate = async (formData: {
    title: string;
    description?: string;
    date: string;
    icon?: string;
  }) => {
    await createMilestone({
      variables: {
        coupleId: couple.id,
        input: {
          title: formData.title,
          description: formData.description || null,
          date: formData.date,
          icon: formData.icon || null,
        },
      },
    });
    setFormOpen(false);
  };

  const handleUpdate = async (formData: {
    title: string;
    description?: string;
    date: string;
    icon?: string;
  }) => {
    if (!editingMilestone) return;
    await updateMilestone({
      variables: {
        id: editingMilestone.id,
        input: {
          title: formData.title,
          description: formData.description || null,
          date: formData.date,
          icon: formData.icon || null,
        },
      },
    });
    setEditingMilestone(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMilestone({ variables: { id: deleteId } });
    setDeleteId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Timeline</h1>
          <p className="mt-1 text-gray-500">
            Milestones that tell your love story.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setFormOpen(true)}
        >
          Add Milestone
        </Button>
      </div>

      {milestonesLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <Timeline
          milestones={milestones}
          isOwner
          onEdit={(m) => setEditingMilestone(m as MilestoneData)}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      <MilestoneForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        loading={creating}
      />

      <MilestoneForm
        open={!!editingMilestone}
        onClose={() => setEditingMilestone(null)}
        onSubmit={handleUpdate}
        loading={updating}
        initialData={editingMilestone}
      />

      <ConfirmModal
        open={!!deleteId}
        title="Delete Milestone"
        message="Are you sure you want to delete this milestone? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
