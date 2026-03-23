'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';

const CATEGORIES = [
  { id: 'romantic', label: 'Romantic', tags: 'romantic love' },
  { id: 'happy', label: 'Happy', tags: 'happy upbeat' },
  { id: 'chill', label: 'Chill', tags: 'chill relax' },
  { id: 'emotional', label: 'Emotional', tags: 'emotional sad' },
  { id: 'cinematic', label: 'Cinematic', tags: 'cinematic epic' },
  { id: 'acoustic', label: 'Acoustic', tags: 'acoustic folk' },
  { id: 'lofi', label: 'Lo-fi', tags: 'lofi study' },
];

export interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  audio: string;
  image: string;
  duration: number;
}

interface MusicPickerProps {
  onSelect: (track: JamendoTrack) => void;
  onClose: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MusicPicker({ onSelect, onClose }: MusicPickerProps) {
  const [activeCategory, setActiveCategory] = useState('romantic');
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<JamendoTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTracks = useCallback(async (q: string, tags: string) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({ limit: '20' });
      if (q) params.set('q', q);
      if (tags) params.set('tags', tags);
      const res = await fetch(`/api/music/search?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? 'Failed to load tracks');
      }
      const data = await res.json() as { results: JamendoTrack[] };
      setTracks(data.results ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tracks');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on category change
  useEffect(() => {
    const cat = CATEGORIES.find((c) => c.id === activeCategory);
    fetchTracks('', cat?.tags ?? '');
  }, [activeCategory, fetchTracks]);

  // Debounced search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!searchQuery.trim()) return;
    searchTimerRef.current = setTimeout(() => {
      fetchTracks(searchQuery, '');
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery, fetchTracks]);

  const togglePreview = (track: JamendoTrack) => {
    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(track.audio);
      audio.volume = 0.5;
      audio.play().catch(() => {});
      audioRef.current = audio;
      setPlayingId(track.id);
      audio.onended = () => setPlayingId(null);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const handleSelect = (track: JamendoTrack) => {
    audioRef.current?.pause();
    setPlayingId(null);
    onSelect(track);
  };

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
          <div className="flex gap-2 overflow-x-auto border-b border-gray-100 px-6 py-3">
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
        <div className="flex-1 overflow-y-auto px-6 py-4">
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
                <div
                  key={track.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition-colors hover:border-gray-200 hover:bg-gray-50"
                >
                  {/* Album art */}
                  <img
                    src={track.image || '/placeholder-music.png'}
                    alt={track.name}
                    className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{track.name}</p>
                    <p className="truncate text-xs text-gray-500">{track.artist_name}</p>
                  </div>

                  {/* Duration */}
                  <span className="flex-shrink-0 text-xs text-gray-400">
                    {formatDuration(track.duration)}
                  </span>

                  {/* Preview button */}
                  <button
                    onClick={() => togglePreview(track)}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]"
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

                  {/* Select button */}
                  <Button variant="primary" size="sm" onClick={() => handleSelect(track)}>
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attribution */}
        <div className="border-t border-gray-100 px-6 py-3 text-center text-xs text-gray-400">
          Music provided by{' '}
          <a
            href="https://www.jamendo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            Jamendo
          </a>{' '}
          — royalty-free tracks
        </div>
      </motion.div>
    </div>
  );
}
