'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { useToast } from '../../../../lib/toast-context';
import { useAuth } from '../../../../hooks/useAuth';
import { useCouple } from '../../../../hooks/useCouple';
import { GET_GIFT_ACCOUNTS } from '../../../../graphql/queries/gift.queries';
import { CREATE_GIFT_ACCOUNT, UPDATE_GIFT_ACCOUNT, DELETE_GIFT_ACCOUNT } from '../../../../graphql/mutations/gift.mutations';
import { ConfirmModal } from '../../../../components/ui/confirm-modal';
import { Button } from '../../../../components/ui/button';
import { LoadingSpinner } from '../../../../components/ui/loading-spinner';
import { MediaUpload, fileToBase64 } from '../../../../components/couple/media-upload';
import type { MediaFile } from '../../../../components/couple/media-upload';

interface GiftAccountData {
  id: string;
  coupleId: string;
  bankName: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
  qrCode: string | null;
  note: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function GiftPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { couple, loading: coupleLoading } = useCouple();
  const { showError, showSuccess } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<GiftAccountData | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [note, setNote] = useState('');
  const [qrCodeFiles, setQrCodeFiles] = useState<MediaFile[]>([]);

  useEffect(() => {
    if (authLoading || coupleLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!couple) {
      router.push('/onboarding');
    }
  }, [authLoading, coupleLoading, isAuthenticated, couple, router]);

  const { data, loading: accountsLoading } = useQuery<{ giftAccounts: GiftAccountData[] }>(GET_GIFT_ACCOUNTS, {
    variables: { coupleId: couple?.id },
    skip: !couple?.id,
  });

  const refetchConfig = { refetchQueries: [{ query: GET_GIFT_ACCOUNTS, variables: { coupleId: couple?.id } }] };
  const [createGift, { loading: creating }] = useMutation(CREATE_GIFT_ACCOUNT, { ...refetchConfig, onError: (error) => showError(error.message), onCompleted: () => showSuccess('Gift account added!') });
  const [updateGift, { loading: updating }] = useMutation(UPDATE_GIFT_ACCOUNT, { ...refetchConfig, onError: (error) => showError(error.message), onCompleted: () => showSuccess('Gift account updated!') });
  const [deleteGift, { loading: deleting }] = useMutation(DELETE_GIFT_ACCOUNT, { ...refetchConfig, onError: (error) => showError(error.message), onCompleted: () => showSuccess('Gift account deleted') });

  if (authLoading || coupleLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }
  if (!isAuthenticated || !couple) return null;

  const accounts = data?.giftAccounts ?? [];
  const isEditing = !!editAccount;
  const formLoading = creating || updating;

  const resetForm = () => {
    setBankName('');
    setAccountNumber('');
    setAccountHolder('');
    setNote('');
    setQrCodeFiles([]);
  };

  const openCreateForm = () => {
    resetForm();
    setEditAccount(null);
    setFormOpen(true);
  };

  const openEditForm = (account: GiftAccountData) => {
    setBankName(account.bankName ?? '');
    setAccountNumber(account.accountNumber ?? '');
    setAccountHolder(account.accountHolder ?? '');
    setNote(account.note ?? '');
    setQrCodeFiles([]);
    setEditAccount(account);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditAccount(null);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!bankName.trim() || !accountNumber.trim()) return;

    let qrCode: string | null = null;
    if (qrCodeFiles.length > 0) {
      qrCode = await fileToBase64(qrCodeFiles[0].file);
    }

    if (isEditing && editAccount) {
      await updateGift({
        variables: {
          id: editAccount.id,
          input: {
            bankName: bankName.trim(),
            accountNumber: accountNumber.trim(),
            accountHolder: accountHolder.trim() || null,
            note: note.trim() || null,
            ...(qrCode ? { qrCode } : {}),
          },
        },
      });
    } else {
      await createGift({
        variables: {
          coupleId: couple.id,
          input: {
            bankName: bankName.trim(),
            accountNumber: accountNumber.trim(),
            accountHolder: accountHolder.trim() || null,
            note: note.trim() || null,
            ...(qrCode ? { qrCode } : {}),
          },
        },
      });
    }
    closeForm();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteGift({ variables: { id: deleteId } });
    setDeleteId(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gift Accounts</h1>
          <p className="mt-1 text-gray-500">Bank accounts for receiving monetary gifts.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreateForm}>Add Account</Button>
      </div>

      {accountsLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
          <span className="text-5xl">🎁</span>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No gift accounts yet</h3>
          <p className="mt-1 text-sm text-gray-500">Add your bank accounts so friends can send gifts</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={openCreateForm}>Add Account</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {accounts.map((account) => (
            <div key={account.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
              {account.qrCode && (
                <div className="flex justify-center bg-gray-50 p-4">
                  <img
                    src={account.qrCode}
                    alt="QR Code"
                    className="h-32 w-32 rounded-lg object-contain"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-gray-900">{account.bankName}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 text-gray-400">Account:</span>
                        <span className="truncate font-mono font-medium">{account.accountNumber}</span>
                        <button
                          onClick={() => copyToClipboard(account.accountNumber ?? '')}
                          className="shrink-0 text-[var(--color-coral)] hover:underline"
                        >
                          Copy
                        </button>
                      </div>
                      {account.accountHolder && <p className="truncate">Holder: {account.accountHolder}</p>}
                      {account.note && <p className="line-clamp-2 text-gray-400">{account.note}</p>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditForm(account)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(account.id)} className="!text-red-500">
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Gift Account' : 'Add Gift Account'}
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Vietcombank"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Account Holder</label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="e.g. NGUYEN VAN A"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Note (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. For wedding gifts"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  QR Code Image (optional)
                </label>
                {isEditing && editAccount?.qrCode && qrCodeFiles.length === 0 && (
                  <div className="mb-2 flex items-center gap-2">
                    <img src={editAccount.qrCode} alt="Current QR" className="h-16 w-16 rounded-lg object-contain ring-1 ring-gray-200" />
                    <span className="text-xs text-gray-400">Current QR code. Upload a new one to replace.</span>
                  </div>
                )}
                <MediaUpload
                  files={qrCodeFiles}
                  onChange={setQrCodeFiles}
                  maxFiles={1}
                  disabled={formLoading}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" size="sm" onClick={closeForm} disabled={formLoading}>Cancel</Button>
                <Button variant="primary" size="sm" loading={formLoading} onClick={handleSubmit} disabled={!bankName.trim() || !accountNumber.trim()}>
                  {isEditing ? 'Save Changes' : 'Add Account'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Gift Account"
        message="Are you sure you want to remove this gift account?"
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
