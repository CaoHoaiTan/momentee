'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { useToast } from '../../lib/toast-context';
import { useAuth } from '../../hooks/useAuth';
import { GET_ADMIN_STATS, GET_ADMIN_USERS, GET_ADMIN_COUPLES } from '../../graphql/queries/admin.queries';
import { ADMIN_DELETE_USER, ADMIN_DELETE_COUPLE, ADMIN_UPDATE_USER_ROLE } from '../../graphql/mutations/admin.mutations';
import { ConfirmModal } from '../../components/ui/confirm-modal';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/ui/loading-spinner';

interface AdminStats {
  totalUsers: number;
  totalCouples: number;
  totalPosts: number;
  totalWishes: number;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  plan: string;
  createdAt: string;
}

interface CoupleData {
  id: string;
  slug: string;
  displayName: string;
  plan: string;
  isPublic: boolean;
  viewCount: number;
  partner1Name: string;
  partner1Email: string;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useToast();
  const [tab, setTab] = useState<'overview' | 'users' | 'couples'>('overview');
  const [search, setSearch] = useState('');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteCoupleId, setDeleteCoupleId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const { data: statsData, loading: statsLoading } = useQuery<{ adminStats: AdminStats }>(GET_ADMIN_STATS, {
    skip: user?.role !== 'ADMIN',
  });

  const { data: usersData, loading: usersLoading } = useQuery<{ adminUsers: UserData[] }>(GET_ADMIN_USERS, {
    variables: { limit: 50, search: search || undefined },
    skip: tab !== 'users' || user?.role !== 'ADMIN',
  });

  const { data: couplesData, loading: couplesLoading } = useQuery<{ adminCouples: CoupleData[] }>(GET_ADMIN_COUPLES, {
    variables: { limit: 50, search: search || undefined },
    skip: tab !== 'couples' || user?.role !== 'ADMIN',
  });

  const [deleteUser, { loading: deletingUser }] = useMutation(ADMIN_DELETE_USER, {
    refetchQueries: [{ query: GET_ADMIN_USERS, variables: { limit: 50, search: search || undefined } }, { query: GET_ADMIN_STATS }],
    onError: (error) => showError(error.message),
    onCompleted: () => showSuccess('User deleted'),
  });

  const [deleteCouple, { loading: deletingCouple }] = useMutation(ADMIN_DELETE_COUPLE, {
    refetchQueries: [{ query: GET_ADMIN_COUPLES, variables: { limit: 50, search: search || undefined } }, { query: GET_ADMIN_STATS }],
    onError: (error) => showError(error.message),
    onCompleted: () => showSuccess('Couple deleted'),
  });

  const [updateRole] = useMutation(ADMIN_UPDATE_USER_ROLE, {
    refetchQueries: [{ query: GET_ADMIN_USERS, variables: { limit: 50, search: search || undefined } }],
    onError: (error) => showError(error.message),
    onCompleted: () => showSuccess('Role updated'),
  });

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  const stats = statsData?.adminStats;
  const users = usersData?.adminUsers ?? [];
  const couples = couplesData?.adminCouples ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-xl bg-gray-100 p-1">
        {(['overview', 'users', 'couples'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearch(''); }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="mt-8">
          {statsLoading ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Users', value: stats.totalUsers, icon: '👥' },
                { label: 'Couples', value: stats.totalCouples, icon: '💕' },
                { label: 'Posts', value: stats.totalPosts, icon: '📸' },
                { label: 'Wishes', value: stats.totalWishes, icon: '💌' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                  <span className="text-2xl">{stat.icon}</span>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="mt-6 space-y-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[var(--color-coral)]"
          />
          {usersLoading ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Plan</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u.plan}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateRole({ variables: { id: u.id, role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' } })}
                          >
                            {u.role === 'ADMIN' ? 'Demote' : 'Promote'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteUserId(u.id)} className="!text-red-500">
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Couples */}
      {tab === 'couples' && (
        <div className="mt-6 space-y-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by couple name..."
            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[var(--color-coral)]"
          />
          {couplesLoading ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Slug</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Owner</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Plan</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Views</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {couples.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{c.displayName}</td>
                      <td className="px-4 py-3 text-gray-500">/{c.slug}</td>
                      <td className="px-4 py-3 text-gray-500">{c.partner1Name}</td>
                      <td className="px-4 py-3 text-gray-500">{c.plan}</td>
                      <td className="px-4 py-3 text-gray-500">{c.viewCount}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setDeleteCoupleId(c.id)} className="!text-red-500">
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={!!deleteUserId}
        title="Delete User"
        message="This will permanently delete the user and all their data. Are you sure?"
        confirmLabel="Delete"
        loading={deletingUser}
        onConfirm={async () => { await deleteUser({ variables: { id: deleteUserId } }); setDeleteUserId(null); }}
        onCancel={() => setDeleteUserId(null)}
      />

      <ConfirmModal
        open={!!deleteCoupleId}
        title="Delete Couple"
        message="This will permanently delete the couple page and all associated data. Are you sure?"
        confirmLabel="Delete"
        loading={deletingCouple}
        onConfirm={async () => { await deleteCouple({ variables: { id: deleteCoupleId } }); setDeleteCoupleId(null); }}
        onCancel={() => setDeleteCoupleId(null)}
      />
    </div>
  );
}
