'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { useToast } from '../../../../lib/toast-context';
import { useAuth } from '../../../../hooks/useAuth';
import { useCouple } from '../../../../hooks/useCouple';
import { GET_POSTS } from '../../../../graphql/queries/post.queries';
import {
  CREATE_POST,
  DELETE_POST,
} from '../../../../graphql/mutations/post.mutations';
import { PostCard } from '../../../../components/couple/post-card';
import { PostForm } from '../../../../components/couple/post-form';
import { ConfirmModal } from '../../../../components/ui/confirm-modal';
import { Button } from '../../../../components/ui/button';
import { LoadingSpinner } from '../../../../components/ui/loading-spinner';
import type { PostData } from '../../../../components/couple/post-card';

export default function PostsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { couple, loading: coupleLoading } = useCouple();
  const { showError, showSuccess } = useToast();

  const [formOpen, setFormOpen] = useState(false);
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

  const { data, loading: postsLoading } = useQuery<{ posts: PostData[] }>(GET_POSTS, {
    variables: { coupleId: couple?.id },
    skip: !couple?.id,
  });

  const [createPost, { loading: creating }] = useMutation(CREATE_POST, {
    refetchQueries: [{ query: GET_POSTS, variables: { coupleId: couple?.id } }],
    onError: (error) => showError(error.message),
    onCompleted: () => showSuccess('Post created!'),
  });

  const [deletePost, { loading: deleting }] = useMutation(DELETE_POST, {
    refetchQueries: [{ query: GET_POSTS, variables: { coupleId: couple?.id } }],
    onError: (error) => showError(error.message),
    onCompleted: () => showSuccess('Post deleted'),
  });

  if (authLoading || coupleLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !couple) return null;

  const posts = data?.posts ?? [];

  const handleCreate = async (formData: {
    caption: string;
    type: string;
    visibility: string;
    media: { file: string; type: string }[];
  }) => {
    await createPost({
      variables: {
        coupleId: couple.id,
        input: {
          caption: formData.caption || null,
          type: formData.type,
          visibility: formData.visibility,
          media: formData.media,
        },
      },
    });
    setFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deletePost({ variables: { id: deleteId } });
    setDeleteId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Posts</h1>
          <p className="mt-1 text-gray-500">Share your favorite moments together.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>
          Create Post
        </Button>
      </div>

      {postsLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
          <span className="text-5xl">📸</span>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No posts yet</h3>
          <p className="mt-1 text-sm text-gray-500">Share your first moment together</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => setFormOpen(true)}>
            Create Post
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwner
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      <PostForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        loading={creating}
      />

      <ConfirmModal
        open={!!deleteId}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
