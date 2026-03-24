'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createId } from '@paralleldrive/cuid2';
import { Button } from '../ui/button';
import { ClipSelector } from './clip-selector';
import type { MusicTrack, SpotifyTrack, UploadTrack } from '../../lib/music-config';

const CATEGORIES = [
  { id: 'romantic', label: 'Romantic' },
  { id: 'happy', label: 'Happy' },
  { id: 'chill', label: 'Chill' },
  { id: 'sad', label: 'Sad' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'acoustic', label: 'Acoustic' },
  { id: 'lofi', label: 'Lo-fi' },
];

export interface SpotifySearchResult {
  id: string;
  name: string;
  artist: string;
  albumArt: string;
  durationMs: number;
  previewUrl: string | null;
  spotifyUri: string;
}

interface UploadResult {
  url: string;
  publicId: string;
  duration: number;
  format: string;
  bytes: number;
  title: string;
}

interface MusicPickerProps {
  onSelect: (track: MusicTrack) => void;
  onClose: () => void;
}

type Tab = 'spotify' | 'upload';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ACCEPTED_FORMATS = '.mp3,.m4a,.ogg,.wav,.aac';

export function MusicPicker({ onSelect, onClose }: MusicPickerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('spotify');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative mx-4 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Choose Music</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('spotify')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'spotify'
                ? 'border-b-2 border-[var(--color-coral)] text-[var(--color-coral)]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Search Spotify
            </span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'border-b-2 border-[var(--color-coral)] text-[var(--color-coral)]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Your Own
            </span>
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'spotify' ? (
          <SpotifyTab onSelect={onSelect} />
        ) : (
          <UploadTab onSelect={onSelect} onClose={onClose} />
        )}
      </motion.div>
    </div>
  );
}

// ─── Spotify Tab ──────────────────────────────────────────────────────

function SpotifyTab({ onSelect }: { onSelect: (track: MusicTrack) => void }) {
  const [activeCategory, setActiveCategory] = useState('romantic');
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<SpotifySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTracks = useCallback(async (q: string) => {
    if (!q.trim()) {
      setTracks([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('momentee_access_token');
      const params = new URLSearchParams({ q, limit: '10' });
      const res = await fetch(`/api/music/spotify/search?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? 'Failed to load tracks');
      }
      const data = (await res.json()) as { results: SpotifySearchResult[] };
      setTracks(data.results ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tracks');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on category change (use category label as search query)
  useEffect(() => {
    if (searchQuery.trim()) return;
    const cat = CATEGORIES.find((c) => c.id === activeCategory);
    if (cat) fetchTracks(cat.label.toLowerCase());
  }, [activeCategory, searchQuery, fetchTracks]);

  // Debounced search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!searchQuery.trim()) return;
    searchTimerRef.current = setTimeout(() => {
      fetchTracks(searchQuery);
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery, fetchTracks]);

  const togglePreview = (track: SpotifySearchResult) => {
    setPlayingId((prev) => (prev === track.id ? null : track.id));
  };

  const handleSelect = (track: SpotifySearchResult) => {
    setPlayingId(null);
    const spotifyTrack: SpotifyTrack = {
      id: createId(),
      source: 'spotify',
      spotifyId: track.id,
      spotifyUri: track.spotifyUri,
      previewUrl: track.previewUrl,
      title: track.name,
      artist: track.artist,
      albumArt: track.albumArt,
      duration: Math.round(track.durationMs / 1000),
      sortOrder: 0,
    };
    onSelect(spotifyTrack);
  };

  return (
    <>
      {/* Search */}
      <div className="border-b border-gray-100 px-6 py-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by track name or artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
          />
        </div>
      </div>

      {/* Categories */}
      {!searchQuery && (
        <div className="flex flex-nowrap gap-2 overflow-x-auto border-b border-gray-100 px-6 py-3 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-[var(--color-coral)] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Track list */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[var(--color-coral)]" />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-sm text-gray-500">{error}</div>
        ) : tracks.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">No tracks found</div>
        ) : (
          <div className="space-y-2">
            {tracks.map((track) => (
              <div key={track.id} className="space-y-2">
                <div
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition-colors hover:border-gray-200 hover:bg-gray-50"
                >
                  <img
                    src={track.albumArt || '/placeholder-music.png'}
                    alt={track.name}
                    className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{track.name}</p>
                    <p className="truncate text-xs text-gray-500">{track.artist}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-gray-400">
                    {formatDuration(track.durationMs)}
                  </span>
                  <button
                    onClick={() => togglePreview(track)}
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                      playingId === track.id
                        ? 'border-[var(--color-coral)] bg-[var(--color-coral)] text-white'
                        : 'border-gray-200 text-gray-500 hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]'
                    }`}
                    title={playingId === track.id ? 'Stop preview' : 'Preview'}
                  >
                    {playingId === track.id ? (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <Button variant="primary" size="sm" onClick={() => handleSelect(track)}>
                    Select
                  </Button>
                </div>
                {/* Spotify embed preview */}
                {playingId === track.id && (
                  <div className="overflow-hidden rounded-xl">
                    <iframe
                      src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`}
                      width="100%"
                      height={80}
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media"
                      loading="lazy"
                      title={`Preview ${track.name}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attribution */}
      <div className="border-t border-gray-100 px-6 py-3 text-center text-xs text-gray-400">
        Powered by{' '}
        <a
          href="https://www.spotify.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          Spotify
        </a>
      </div>
    </>
  );
}

// ─── Upload Tab ───────────────────────────────────────────────────────

function UploadTab({
  onSelect,
  onClose,
}: {
  onSelect: (track: MusicTrack) => void;
  onClose: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [showClip, setShowClip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File too large. Maximum 15MB.');
      return;
    }

    if (!file.type.startsWith('audio/')) {
      setUploadError('Invalid file type. Please select an audio file.');
      return;
    }

    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const token = localStorage.getItem('momentee_access_token');
      const res = await fetch('/api/music/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          file: base64,
          title: file.name.replace(/\.[^.]+$/, ''),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? 'Upload failed');
      }

      const result = (await res.json()) as UploadResult;
      setUploadResult(result);
      setTitle(result.title);
      setArtist('');
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClipConfirm = (clipStart: number, clipEnd: number) => {
    if (!uploadResult) return;
    const uploadTrack: UploadTrack = {
      id: createId(),
      source: 'upload',
      title: title || 'Uploaded Track',
      artist: artist || 'Unknown Artist',
      albumArt: '',
      audioUrl: uploadResult.url,
      cloudinaryId: uploadResult.publicId,
      duration: uploadResult.duration,
      clipStart,
      clipEnd,
      sortOrder: 0,
    };
    onSelect(uploadTrack);
  };

  if (showClip && uploadResult) {
    return (
      <div className="p-6">
        <ClipSelector
          audioUrl={uploadResult.url}
          title={title || 'Uploaded Track'}
          artist={artist || 'Unknown Artist'}
          albumArt=""
          duration={uploadResult.duration}
          onConfirm={handleClipConfirm}
          onBack={() => setShowClip(false)}
        />
      </div>
    );
  }

  if (uploadResult) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-4">
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
            <svg className="mx-auto h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="mt-2 text-sm font-medium text-green-700">Upload successful!</p>
            <p className="text-xs text-green-600">
              {uploadResult.format.toUpperCase()} · {Math.round(uploadResult.bytes / 1024)}KB · {Math.floor(uploadResult.duration / 60)}:{(uploadResult.duration % 60).toString().padStart(2, '0')}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Track Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
              placeholder="Enter track title"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Artist</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--color-coral)] focus:ring-1 focus:ring-[var(--color-coral)]"
              placeholder="Enter artist name"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setUploadResult(null);
                setTitle('');
                setArtist('');
              }}
            >
              Upload Different File
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowClip(true)}>
              Select Clip
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-12 transition-colors hover:border-[var(--color-coral)] hover:bg-gray-50"
      >
        {uploading ? (
          <>
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-[var(--color-coral)]" />
            <p className="mt-4 text-sm font-medium text-gray-600">Uploading...</p>
          </>
        ) : (
          <>
            <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p className="mt-4 text-sm font-medium text-gray-600">
              Click to select an audio file
            </p>
            <p className="mt-1 text-xs text-gray-400">
              MP3, M4A, OGG, WAV, AAC — max 15MB, 10 min
            </p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FORMATS}
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadError && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {uploadError}
        </div>
      )}
    </div>
  );
}
