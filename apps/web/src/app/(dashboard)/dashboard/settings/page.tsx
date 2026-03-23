'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { useAuth } from '../../../../hooks/useAuth';
import { useCouple } from '../../../../hooks/useCouple';
import { UPDATE_COUPLE, DELETE_COUPLE } from '../../../../graphql/mutations/couple.mutations';
import { GET_MY_COUPLE } from '../../../../graphql/queries/couple.queries';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Card } from '../../../../components/ui/card';
import { LoadingSpinner } from '../../../../components/ui/loading-spinner';
import { ThemeSelector } from '../../../../components/ui/theme-selector';
import { ConfirmModal } from '../../../../components/ui/confirm-modal';
import { TimelineLayoutPicker, GalleryModePicker, WishDisplayPicker } from '../../../../components/ui/layout-picker';
import { SectionReorder, DEFAULT_SECTION_ORDER } from '../../../../components/ui/section-reorder';
import { parseLayoutConfig, serializeLayoutConfig } from '../../../../lib/layout-config';
import { getTheme } from '../../../../lib/themes';
import type { TimelineLayout, GalleryMode, WishDisplayMode } from '../../../../lib/themes';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { couple, loading: coupleLoading, refetch } = useCouple();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [theme, setTheme] = useState('coral');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Layout config state
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);
  const [timelineLayout, setTimelineLayout] = useState<TimelineLayout>('alternating');
  const [galleryMode, setGalleryMode] = useState<GalleryMode>('grid');
  const [wishDisplay, setWishDisplay] = useState<WishDisplayMode>('cards');

  const [updateCouple, { loading: updating }] = useMutation(UPDATE_COUPLE, {
    refetchQueries: [{ query: GET_MY_COUPLE }],
  });

  const [deleteCouple, { loading: deleting }] = useMutation(DELETE_COUPLE);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (couple) {
      setDisplayName(couple.displayName);
      setBio(couple.bio || '');
      setAnniversary(couple.anniversary || '');
      setWeddingDate(couple.weddingDate || '');
      setTheme(couple.theme);
      setIsPublic(couple.isPublic);

      // Parse layout config
      const config = parseLayoutConfig(couple.layoutConfig);
      const themeDefaults = getTheme(couple.theme);
      if (config.sectionOrder?.length) setSectionOrder(config.sectionOrder);
      setTimelineLayout(config.timelineLayout ?? themeDefaults.layout.timeline);
      setGalleryMode(config.galleryMode ?? themeDefaults.layout.gallery);
      setWishDisplay(config.wishDisplay ?? themeDefaults.layout.wishDisplay);
    }
  }, [couple]);

  // When theme changes, reset layout to theme defaults (unless user has overrides)
  useEffect(() => {
    if (!couple) return;
    const config = parseLayoutConfig(couple.layoutConfig);
    const themeDefaults = getTheme(theme);
    if (!config.timelineLayout) setTimelineLayout(themeDefaults.layout.timeline);
    if (!config.galleryMode) setGalleryMode(themeDefaults.layout.gallery);
    if (!config.wishDisplay) setWishDisplay(themeDefaults.layout.wishDisplay);
  }, [theme, couple]);

  if (authLoading || coupleLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !couple) return null;

  const handleSave = async () => {
    setError('');
    setSuccess('');
    try {
      const layoutConfig = serializeLayoutConfig({
        sectionOrder,
        timelineLayout,
        galleryMode,
        wishDisplay,
      });

      await updateCouple({
        variables: {
          id: couple.id,
          input: {
            displayName,
            bio: bio || undefined,
            anniversary: anniversary || undefined,
            weddingDate: weddingDate || undefined,
            theme,
            layoutConfig,
            isPublic,
          },
        },
      });
      setSuccess('Settings saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCouple({ variables: { id: couple.id } });
      setShowDeleteModal(false);
      await refetch();
      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-500">
          Manage your couple page settings.
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Profile</h2>
        <div className="space-y-4">
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Page URL
            </label>
            <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
              momentee.dev/<span className="font-medium text-gray-700">{couple.slug}</span>
            </p>
          </div>
          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base transition-colors focus:border-[var(--color-coral)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]/20"
              rows={3}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400">{bio.length}/500</p>
          </div>
          <Input
            label="Anniversary"
            type="date"
            value={anniversary}
            onChange={(e) => setAnniversary(e.target.value)}
          />
          <Input
            label="Wedding Date"
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
          />
        </div>
      </Card>

      {/* Theme */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Appearance</h2>
        <ThemeSelector value={theme} onChange={setTheme} />
      </Card>

      {/* Layout Customization */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Page Layout</h2>
        <p className="mb-6 text-sm text-gray-500">
          Customize how sections appear on your public page.
        </p>
        <div className="space-y-6">
          <SectionReorder value={sectionOrder} onChange={setSectionOrder} />
          <div className="border-t border-gray-100 pt-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Section Styles</h3>
            <div className="space-y-5">
              <TimelineLayoutPicker value={timelineLayout} onChange={setTimelineLayout} />
              <GalleryModePicker value={galleryMode} onChange={setGalleryMode} />
              <WishDisplayPicker value={wishDisplay} onChange={setWishDisplay} />
            </div>
          </div>
        </div>
      </Card>

      {/* Privacy */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Privacy</h2>
        <label className="flex cursor-pointer items-center gap-3">
          <div className="relative">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <div className="h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-[var(--color-coral)]" />
            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Public Page</p>
            <p className="text-xs text-gray-500">
              Anyone with the link can view your couple page.
            </p>
          </div>
        </label>
      </Card>

      {/* Partner Invite */}
      {!couple.partner2 && couple.inviteCode && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Invite Partner
          </h2>
          <p className="mb-3 text-sm text-gray-500">
            Share this invite code with your partner.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 text-center font-mono text-lg font-bold tracking-wider text-[var(--color-coral)]">
              {couple.inviteCode}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(couple.inviteCode!)}
            >
              Copy
            </Button>
          </div>
        </Card>
      )}

      {/* Save */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {success && (
        <p className="text-sm text-[var(--color-teal)]">{success}</p>
      )}
      <Button loading={updating} onClick={handleSave} className="w-full">
        Save Settings
      </Button>

      {/* Danger Zone */}
      <Card className="!border-red-200">
        <h2 className="mb-2 text-lg font-semibold text-red-600">
          Danger Zone
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Deleting your couple page is permanent and cannot be undone. All data
          including posts, milestones, and wishes will be lost.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="!border-red-300 !text-red-500 hover:!bg-red-50"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Couple Page
        </Button>
      </Card>

      <ConfirmModal
        open={showDeleteModal}
        title="Delete Couple Page"
        message="Are you sure? This will permanently delete your couple page and all associated data. This action cannot be undone."
        confirmLabel="Delete Forever"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
