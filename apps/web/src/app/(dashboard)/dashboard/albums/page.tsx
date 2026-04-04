'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { useToast } from '../../../../lib/toast-context';
import { useAuth } from '../../../../hooks/useAuth';
import { useCouple } from '../../../../hooks/useCouple';
import { GET_ALBUMS } from '../../../../graphql/queries/album.queries';
import {
  CREATE_ALBUM,
  UPDATE_ALBUM,
  DELETE_ALBUM,
  ADD_ALBUM_PHOTO,
  REMOVE_ALBUM_PHOTO,
} from '../../../../graphql/mutations/album.mutations';
import { ConfirmModal } from '../../../../components/ui/confirm-modal';
import { Button } from '../../../../components/ui/button';
import { LoadingSpinner } from '../../../../components/ui/loading-spinner';
import { MediaUpload, fileToBase64 } from '../../../../components/couple/media-upload';
import type { MediaFile } from '../../../../components/couple/media-upload';

interface AlbumPhotoData {
  id: string;
  albumId: string;
  mediaUrl: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
}

interface AlbumData {
  id: string;
  coupleId: string;
  title: string;
  description: string | null;
  coverPhoto: string | null;
  photoCount: number;
  photos: AlbumPhotoData[];
  createdAt: string;
  updatedAt: string;
}

export default function AlbumsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { couple, loading: coupleLoading } = useCouple();
  const { showError, showSuccess } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editAlbum, setEditAlbum] = useState<AlbumData | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumData | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null);

  // Album form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverFiles, setCoverFiles] = useState<MediaFile[]>([]);

  // Photo upload state
  const [photoFiles, setPhotoFiles] = useState<MediaFile[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  useEffect(() => {
    if (authLoading || coupleLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!couple) {
      router.push('/onboarding');
    }
  }, [authLoading, coupleLoading, isAuthenticated, couple, router]);

  const { data, loading: albumsLoading } = useQuery<{ albums: AlbumData[] }>(GET_ALBUMS, {
    variables: { coupleId: couple?.id },
    skip: !couple?.id,
  });

  const refetchConfig = { refetchQueries: [{ query: GET_ALBUMS, variables: { coupleId: couple?.id } }] };
  const [createAlbum, { loading: creating }] = useMutation(CREATE_ALBUM, { ...refetchConfig, onError: (error) => showError(error.message), onCompleted: () => showSuccess('Album created!') });
  const [updateAlbum, { loading: updating }] = useMutation(UPDATE_ALBUM, { ...refetchConfig, onError: (error) => showError(error.message), onCompleted: () => showSuccess('Album updated!') });
  const [deleteAlbum, { loading: deletingAlbum }] = useMutation(DELETE_ALBUM, { ...refetchConfig, onError: (error) => showError(error.message), onCompleted: () => showSuccess('Album deleted') });
  const [addPhoto] = useMutation(ADD_ALBUM_PHOTO, { ...refetchConfig, onError: (error) => showError(error.message) });
  const [removePhoto, { loading: deletingPhoto }] = useMutation(REMOVE_ALBUM_PHOTO, { ...refetchConfig, onError: (error) => showError(error.message) });

  if (authLoading || coupleLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }
  if (!isAuthenticated || !couple) return null;

  const albums = data?.albums ?? [];
  const formLoading = creating || updating;

  // Sync selectedAlbum with fresh data
  const currentSelected = selectedAlbum ? albums.find((a) => a.id === selectedAlbum.id) ?? null : null;

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCoverFiles([]);
  };

  const openCreateForm = () => {
    resetForm();
    setEditAlbum(null);
    setFormOpen(true);
  };

  const openEditForm = (album: AlbumData) => {
    setTitle(album.title);
    setDescription(album.description ?? '');
    setCoverFiles([]);
    setEditAlbum(album);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditAlbum(null);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    let coverPhoto: string | undefined;
    if (coverFiles.length > 0) {
      coverPhoto = await fileToBase64(coverFiles[0].file);
    }

    if (editAlbum) {
      await updateAlbum({
        variables: {
          id: editAlbum.id,
          input: {
            title: title.trim(),
            description: description.trim() || null,
            ...(coverPhoto ? { coverPhoto } : {}),
          },
        },
      });
    } else {
      await createAlbum({
        variables: {
          coupleId: couple.id,
          input: {
            title: title.trim(),
            description: description.trim() || null,
            ...(coverPhoto ? { coverPhoto } : {}),
          },
        },
      });
    }
    closeForm();
  };

  const handleDeleteAlbum = async () => {
    if (!deleteId) return;
    await deleteAlbum({ variables: { id: deleteId } });
    setDeleteId(null);
    if (selectedAlbum?.id === deleteId) setSelectedAlbum(null);
  };

  const handleUploadPhotos = async () => {
    if (!currentSelected || photoFiles.length === 0) return;
    setUploadingPhotos(true);
    try {
      for (const file of photoFiles) {
        const base64 = await fileToBase64(file.file);
        await addPhoto({
          variables: {
            albumId: currentSelected.id,
            input: { file: base64 },
          },
        });
      }
      setPhotoFiles([]);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!deletePhotoId) return;
    await removePhoto({ variables: { id: deletePhotoId } });
    setDeletePhotoId(null);
  };

  // Album detail view
  if (currentSelected) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedAlbum(null)}>
            <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{currentSelected.title}</h1>
            {currentSelected.description && (
              <p className="mt-1 text-gray-500">{currentSelected.description}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => openEditForm(currentSelected)}>Edit</Button>
        </div>

        {/* Photo upload */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Add Photos</h3>
          <MediaUpload
            files={photoFiles}
            onChange={setPhotoFiles}
            maxFiles={10}
            disabled={uploadingPhotos}
          />
          {photoFiles.length > 0 && (
            <div className="mt-3 flex justify-end">
              <Button variant="primary" size="sm" loading={uploadingPhotos} onClick={handleUploadPhotos}>
                Upload {photoFiles.length} Photo{photoFiles.length > 1 ? 's' : ''}
              </Button>
            </div>
          )}
        </div>

        {/* Photo grid */}
        {currentSelected.photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
            <span className="text-5xl">📷</span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No photos yet</h3>
            <p className="mt-1 text-sm text-gray-500">Upload photos to this album</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {currentSelected.photos.map((photo) => (
              <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={photo.mediaUrl}
                  alt={photo.caption ?? ''}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <button
                  onClick={() => setDeletePhotoId(photo.id)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <ConfirmModal
          open={!!deletePhotoId}
          title="Delete Photo"
          message="Are you sure you want to remove this photo?"
          confirmLabel="Delete"
          loading={deletingPhoto}
          onConfirm={handleDeletePhoto}
          onCancel={() => setDeletePhotoId(null)}
        />

        {/* Reuse album form modal */}
        {formOpen && (
          <AlbumFormModal
            isEditing={!!editAlbum}
            editAlbum={editAlbum}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            coverFiles={coverFiles}
            setCoverFiles={setCoverFiles}
            formLoading={formLoading}
            onSubmit={handleSubmit}
            onClose={closeForm}
          />
        )}
      </div>
    );
  }

  // Album list view
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Albums</h1>
          <p className="mt-1 text-gray-500">Organize your photos into albums.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreateForm}>Create Album</Button>
      </div>

      {albumsLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
          <span className="text-5xl">📸</span>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No albums yet</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first album to start organizing photos</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={openCreateForm}>Create Album</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <div
              key={album.id}
              className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md"
              onClick={() => setSelectedAlbum(album)}
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                {album.coverPhoto ? (
                  <img
                    src={album.coverPhoto}
                    alt={album.title}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : album.photos.length > 0 ? (
                  <img
                    src={album.photos[0].mediaUrl}
                    alt={album.title}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
                  {album.photoCount} photo{album.photoCount !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-gray-900">{album.title}</h3>
                    {album.description && (
                      <p className="mt-0.5 truncate text-sm text-gray-500">{album.description}</p>
                    )}
                  </div>
                  <div className="ml-2 flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => openEditForm(album)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(album.id)} className="!text-red-500">Delete</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <AlbumFormModal
          isEditing={!!editAlbum}
          editAlbum={editAlbum}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          coverFiles={coverFiles}
          setCoverFiles={setCoverFiles}
          formLoading={formLoading}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Album"
        message="Are you sure you want to delete this album? All photos in it will be removed."
        confirmLabel="Delete"
        loading={deletingAlbum}
        onConfirm={handleDeleteAlbum}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function AlbumFormModal({
  isEditing,
  editAlbum,
  title,
  setTitle,
  description,
  setDescription,
  coverFiles,
  setCoverFiles,
  formLoading,
  onSubmit,
  onClose,
}: {
  isEditing: boolean;
  editAlbum: AlbumData | null;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  coverFiles: MediaFile[];
  setCoverFiles: (v: MediaFile[]) => void;
  formLoading: boolean;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEditing ? 'Edit Album' : 'Create Album'}
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Our Wedding Day"
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="A short description of this album"
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Cover Photo (optional)</label>
            {isEditing && editAlbum?.coverPhoto && coverFiles.length === 0 && (
              <div className="mb-2 flex items-center gap-2">
                <img src={editAlbum.coverPhoto} alt="Current cover" className="h-16 w-16 rounded-lg object-cover ring-1 ring-gray-200" />
                <span className="text-xs text-gray-400">Current cover. Upload a new one to replace.</span>
              </div>
            )}
            <MediaUpload
              files={coverFiles}
              onChange={setCoverFiles}
              maxFiles={1}
              disabled={formLoading}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={formLoading}>Cancel</Button>
            <Button variant="primary" size="sm" loading={formLoading} onClick={onSubmit} disabled={!title.trim()}>
              {isEditing ? 'Save Changes' : 'Create Album'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
