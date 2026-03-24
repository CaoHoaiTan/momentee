export interface MusicTrackBase {
  id: string;
  source: 'spotify' | 'upload';
  title: string;
  artist: string;
  albumArt: string;
  duration: number;
  sortOrder: number;
}

export interface SpotifyTrack extends MusicTrackBase {
  source: 'spotify';
  spotifyId: string;
  spotifyUri: string;
  previewUrl: string | null;
}

export interface UploadTrack extends MusicTrackBase {
  source: 'upload';
  audioUrl: string;
  cloudinaryId: string;
  clipStart: number;
  clipEnd: number;
}

export type MusicTrack = SpotifyTrack | UploadTrack;

export interface BackgroundMusicConfig {
  enabled: boolean;
  tracks: MusicTrack[];
  volume: number;
  loop: boolean;
  autoplay?: boolean;
}

export function parseMusicConfig(raw: string | null | undefined): BackgroundMusicConfig | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as BackgroundMusicConfig;
    if (!parsed || typeof parsed !== 'object') return null;
    // Filter out legacy tracks without a valid source field
    const tracks = Array.isArray(parsed.tracks)
      ? parsed.tracks.filter(
          (t) => t && typeof t === 'object' && (t.source === 'spotify' || t.source === 'upload'),
        )
      : [];
    return {
      enabled: parsed.enabled ?? false,
      tracks,
      volume: typeof parsed.volume === 'number' ? Math.min(100, Math.max(0, parsed.volume)) : 30,
      loop: parsed.loop ?? true,
      autoplay: parsed.autoplay === true,
    };
  } catch {
    return null;
  }
}

export function serializeMusicConfig(config: BackgroundMusicConfig): string {
  return JSON.stringify(config);
}

export function getDefaultMusicConfig(): BackgroundMusicConfig {
  return { enabled: true, tracks: [], volume: 30, loop: true, autoplay: false };
}
