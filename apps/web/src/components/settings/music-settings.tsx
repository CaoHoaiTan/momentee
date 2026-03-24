'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MusicPicker } from './music-picker';
import { Button } from '../ui/button';
import type { BackgroundMusicConfig, MusicTrack } from '../../lib/music-config';

interface MusicSettingsProps {
  plan: string;
  value: BackgroundMusicConfig | null;
  onChange: (config: BackgroundMusicConfig | null) => void;
}

const PLAN_TRACK_LIMITS: Record<string, number> = {
  free: 0,
  premium: 1,
  premium_plus: 3,
};

export function MusicSettings({ plan, value, onChange }: MusicSettingsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const maxTracks = PLAN_TRACK_LIMITS[plan?.toLowerCase()] ?? 0;

  if (maxTracks === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
        <span className="text-3xl">🎵</span>
        <h3 className="mt-3 font-semibold text-gray-700">Background Music</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add background music to your public page. Available on Premium plans.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 1a9 9 0 100 18A9 9 0 0010 1zm1 12.5a1 1 0 01-2 0v-4a1 1 0 012 0v4zm0-7a1 1 0 01-2 0 1 1 0 012 0z" clipRule="evenodd" />
          </svg>
          Upgrade to Premium to unlock
        </div>
      </div>
    );
  }

  const config = value ?? { enabled: false, tracks: [], volume: 30, loop: true };

  const handleToggle = (enabled: boolean) => {
    onChange({ ...config, enabled });
  };

  const handleVolumeChange = (volume: number) => {
    onChange({ ...config, volume });
  };

  const handleLoopToggle = () => {
    onChange({ ...config, loop: !config.loop });
  };

  const handleRemoveTrack = async (track: MusicTrack) => {
    const tracks = config.tracks.filter((t) => t.id !== track.id);
    onChange({ ...config, tracks });

    // Clean up Cloudinary asset for uploaded tracks
    if (track.source === 'upload' && track.cloudinaryId) {
      try {
        const token = localStorage.getItem('momentee_access_token');
        await fetch(`/api/music/upload/${encodeURIComponent(track.cloudinaryId)}`, {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      } catch {
        // Best-effort cleanup
      }
    }
  };

  const handleTrackSelected = (track: MusicTrack) => {
    const newTrack = { ...track, sortOrder: config.tracks.length };
    const tracks = [...config.tracks, newTrack];
    onChange({ ...config, tracks, enabled: true });
    setShowPicker(false);
  };

  const canAddMore = config.tracks.length < maxTracks;

  return (
    <>
      <div className="space-y-5">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Background Music</p>
            <p className="text-sm text-gray-500">
              Play music when visitors open your page ({maxTracks} track{maxTracks !== 1 ? 's' : ''} max)
            </p>
          </div>
          <label className="relative flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={config.enabled}
              onChange={(e) => handleToggle(e.target.checked)}
            />
            <div className="h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-[var(--color-coral)]" />
            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </label>
        </div>

        {/* Track list */}
        {config.tracks.length > 0 && (
          <div className="space-y-2">
            {config.tracks.map((track, idx) => (
              <div
                key={track.id}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white text-xs font-medium text-gray-500 shadow-sm">
                  {idx + 1}
                </span>
                {track.albumArt ? (
                  <img
                    src={track.albumArt}
                    alt={track.title}
                    className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-200">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{track.title}</p>
                  <p className="truncate text-xs text-gray-500">
                    {track.artist}
                    {track.source === 'upload' && ` · ${Math.round(track.clipEnd - track.clipStart)}s clip`}
                  </p>
                </div>
                <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  track.source === 'spotify'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {track.source === 'spotify' ? 'Spotify' : 'Uploaded'}
                </span>
                <button
                  onClick={() => handleRemoveTrack(track)}
                  className="flex-shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Remove track"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add track button */}
        {canAddMore && (
          <Button variant="outline" size="sm" onClick={() => setShowPicker(true)}>
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            {config.tracks.length === 0 ? 'Choose Music' : 'Add Another Track'}
          </Button>
        )}

        {/* Volume */}
        {config.tracks.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Volume</label>
              <span className="text-sm text-gray-500">{config.volume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={config.volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-[var(--color-coral)]"
            />
          </div>
        )}

        {/* Loop toggle */}
        {config.tracks.length > 0 && (
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={config.loop}
              onChange={handleLoopToggle}
            />
            <div className="relative flex-shrink-0">
              <div className="h-5 w-9 rounded-full bg-gray-300 transition-colors peer-checked:bg-[var(--color-coral)]" />
              <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-sm text-gray-700">Loop music</span>
          </label>
        )}
      </div>

      {/* Picker modal */}
      <AnimatePresence>
        {showPicker && (
          <MusicPicker
            onSelect={handleTrackSelected}
            onClose={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
