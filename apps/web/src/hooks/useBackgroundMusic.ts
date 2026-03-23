'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { BackgroundMusicConfig, MusicTrack } from '../lib/music-config';

const STORAGE_KEY = (slug: string) => `music-pref-${slug}`;

interface StoredPrefs {
  muted?: boolean;
  volume?: number;
}

function loadPrefs(slug: string): StoredPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(slug));
    return raw ? (JSON.parse(raw) as StoredPrefs) : {};
  } catch {
    return {};
  }
}

function savePrefs(slug: string, prefs: StoredPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY(slug), JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export interface BackgroundMusicState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  needsInteraction: boolean;
  currentTrack: MusicTrack | null;
  toggle: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  next: () => void;
  prev: () => void;
}

export function useBackgroundMusic(
  config: BackgroundMusicConfig | null,
  slug: string,
): BackgroundMusicState {
  const tracks = config?.enabled ? (config.tracks ?? []) : [];
  const configVolume = config?.volume ?? 30;
  const loop = config?.loop ?? true;

  const prefs = useRef<StoredPrefs>(loadPrefs(slug));
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(prefs.current.muted ?? false);
  const [volume, setVolumeState] = useState(prefs.current.volume ?? configVolume);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentTrack = tracks[trackIndex] ?? null;

  const stopFade = () => {
    if (fadeRef.current) {
      clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  };

  const fadeIn = useCallback((audio: HTMLAudioElement, targetVolume: number) => {
    stopFade();
    audio.volume = 0;
    let v = 0;
    const step = (targetVolume / 100) / 30; // fade over ~1.5s at 50ms intervals
    fadeRef.current = setInterval(() => {
      v = Math.min(v + step, targetVolume / 100);
      audio.volume = v;
      if (v >= targetVolume / 100) stopFade();
    }, 50);
  }, []);

  const loadAndPlay = useCallback((track: MusicTrack, vol: number, muted: boolean) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const audio = new Audio(track.audioUrl);
    audio.muted = muted;
    audio.currentTime = track.clipStart;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      if (audio.currentTime >= track.clipEnd) {
        audio.pause();
        setIsPlaying(false);
        // Auto-advance or loop
        setTrackIndex((prev) => {
          const next = prev + 1;
          if (next < tracks.length) return next;
          return loop ? 0 : prev;
        });
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.play().then(() => {
      setIsPlaying(true);
      setNeedsInteraction(false);
      if (!muted) fadeIn(audio, vol);
    }).catch(() => {
      setNeedsInteraction(true);
      setIsPlaying(false);
    });

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [tracks, loop, fadeIn]);

  // Load track when index changes (or on mount)
  useEffect(() => {
    if (!currentTrack) return;
    const cleanup = loadAndPlay(currentTrack, volume, isMuted);
    return () => {
      cleanup();
      audioRef.current?.pause();
      stopFade();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id]);

  // Sync volume changes to audio element
  useEffect(() => {
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = Math.min(1, volume / 100);
    }
  }, [volume, isMuted]);

  // Sync mute
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (needsInteraction || audio.src === '') {
        loadAndPlay(currentTrack, volume, isMuted);
      } else {
        audio.play().then(() => {
          setIsPlaying(true);
          setNeedsInteraction(false);
        }).catch(() => setNeedsInteraction(true));
      }
    }
  }, [isPlaying, needsInteraction, currentTrack, volume, isMuted, loadAndPlay]);

  const toggleMute = useCallback(() => {
    setIsMuted((m) => {
      const next = !m;
      savePrefs(slug, { ...prefs.current, muted: next });
      prefs.current = { ...prefs.current, muted: next };
      return next;
    });
  }, [slug]);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(100, Math.max(0, v));
    setVolumeState(clamped);
    savePrefs(slug, { ...prefs.current, volume: clamped });
    prefs.current = { ...prefs.current, volume: clamped };
  }, [slug]);

  const next = useCallback(() => {
    setTrackIndex((i) => (i + 1) % Math.max(1, tracks.length));
  }, [tracks.length]);

  const prev = useCallback(() => {
    setTrackIndex((i) => (i - 1 + Math.max(1, tracks.length)) % Math.max(1, tracks.length));
  }, [tracks.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      stopFade();
    };
  }, []);

  return {
    isPlaying,
    isMuted,
    volume,
    needsInteraction,
    currentTrack,
    toggle,
    toggleMute,
    setVolume,
    next,
    prev,
  };
}
