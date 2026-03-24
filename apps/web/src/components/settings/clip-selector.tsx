'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';

interface ClipSelectorProps {
  audioUrl: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number;
  onConfirm: (clipStart: number, clipEnd: number) => void;
  onBack: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const MIN_CLIP = 15;
const MAX_CLIP = 60;

export function ClipSelector({ audioUrl, title, artist, albumArt, duration: propDuration, onConfirm, onBack }: ClipSelectorProps) {
  const duration = Math.max(propDuration, 1);
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(Math.min(MAX_CLIP, duration));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<'start' | 'end' | null>(null);

  // Clamp clipEnd to min/max constraints relative to clipStart
  const clampedEnd = Math.min(duration, Math.max(clipStart + MIN_CLIP, clipEnd));
  const clampedStart = Math.max(0, Math.min(clipStart, clampedEnd - MIN_CLIP));

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.volume = 0.6;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.currentTime >= clampedEnd) {
        audio.pause();
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.pause();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.currentTime = clampedStart;
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const getPositionFromEvent = useCallback((e: MouseEvent | TouchEvent): number => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * duration;
  }, [duration]);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current) return;
      const pos = getPositionFromEvent(e);
      if (dragRef.current === 'start') {
        const newStart = Math.max(0, Math.min(pos, clampedEnd - MIN_CLIP));
        setClipStart(newStart);
      } else {
        const newEnd = Math.min(duration, Math.max(pos, clampedStart + MIN_CLIP));
        // Enforce max clip length
        const bounded = Math.min(newEnd, clampedStart + MAX_CLIP);
        setClipEnd(bounded);
      }
    };
    const onUp = () => { dragRef.current = null; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [clampedStart, clampedEnd, duration, getPositionFromEvent]);

  const startPct = (clampedStart / duration) * 100;
  const endPct = (clampedEnd / duration) * 100;
  const playPct = (currentTime / duration) * 100;
  const clipDuration = Math.round(clampedEnd - clampedStart);

  return (
    <div className="space-y-6">
      {/* Track info */}
      <div className="flex items-center gap-3">
        {albumArt ? (
          <img
            src={albumArt}
            alt={title}
            className="h-12 w-12 rounded-xl object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{artist}</p>
        </div>
      </div>

      {/* Waveform / timeline bar */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">
          Select clip ({clipDuration}s — drag handles to adjust)
        </p>
        <div
          ref={barRef}
          className="relative h-12 w-full cursor-pointer overflow-visible rounded-xl bg-gray-100"
        >
          {/* Full waveform background (visual only) */}
          <div className="absolute inset-0 flex items-center gap-px px-1">
            {Array.from({ length: 80 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-full bg-gray-300"
                style={{ height: `${20 + Math.sin(i * 0.4) * 30 + Math.random() * 20}%` }}
              />
            ))}
          </div>

          {/* Selected clip overlay */}
          <div
            className="absolute inset-y-0 rounded-xl"
            style={{
              left: `${startPct}%`,
              width: `${endPct - startPct}%`,
              background: 'var(--color-coral)',
              opacity: 0.25,
            }}
          />

          {/* Playhead */}
          {isPlaying && (
            <div
              className="absolute inset-y-0 w-0.5 bg-gray-700"
              style={{ left: `${playPct}%` }}
            />
          )}

          {/* Start handle */}
          <div
            className="absolute inset-y-0 w-3 cursor-ew-resize touch-none"
            style={{ left: `calc(${startPct}% - 6px)` }}
            onMouseDown={() => { dragRef.current = 'start'; }}
            onTouchStart={() => { dragRef.current = 'start'; }}
          >
            <div
              className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 rounded-full"
              style={{ background: 'var(--color-coral)' }}
            />
          </div>

          {/* End handle */}
          <div
            className="absolute inset-y-0 w-3 cursor-ew-resize touch-none"
            style={{ left: `calc(${endPct}% - 6px)` }}
            onMouseDown={() => { dragRef.current = 'end'; }}
            onTouchStart={() => { dragRef.current = 'end'; }}
          >
            <div
              className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 rounded-full"
              style={{ background: 'var(--color-coral)' }}
            />
          </div>
        </div>

        {/* Time labels */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>{formatTime(clampedStart)} — {formatTime(clampedEnd)}</span>
          <span>{clipDuration}s selected</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: 'var(--color-coral)' }}
        >
          {isPlaying ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <span className="text-sm text-gray-500">Preview selected clip</span>
      </div>

      <p className="text-xs text-gray-400">
        Clip must be {MIN_CLIP}–{MAX_CLIP}s long
      </p>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onConfirm(clampedStart, clampedEnd)}
        >
          Confirm Clip
        </Button>
      </div>
    </div>
  );
}
