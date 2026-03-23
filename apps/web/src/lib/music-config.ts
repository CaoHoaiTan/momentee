export interface MusicTrack {
  id: string;
  jamendoId: string;
  title: string;
  artist: string;
  albumArt: string;
  audioUrl: string;
  duration: number;
  clipStart: number;
  clipEnd: number;
  sortOrder: number;
}

export interface BackgroundMusicConfig {
  enabled: boolean;
  tracks: MusicTrack[];
  volume: number;
  loop: boolean;
}

export function parseMusicConfig(raw: string | null | undefined): BackgroundMusicConfig | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as BackgroundMusicConfig;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      enabled: parsed.enabled ?? false,
      tracks: Array.isArray(parsed.tracks) ? parsed.tracks : [],
      volume: typeof parsed.volume === 'number' ? Math.min(100, Math.max(0, parsed.volume)) : 30,
      loop: parsed.loop ?? true,
    };
  } catch {
    return null;
  }
}

export function serializeMusicConfig(config: BackgroundMusicConfig): string {
  return JSON.stringify(config);
}

export function getDefaultMusicConfig(): BackgroundMusicConfig {
  return { enabled: true, tracks: [], volume: 30, loop: true };
}

export function isValidJamendoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('.jamendo.com');
  } catch {
    return false;
  }
}
