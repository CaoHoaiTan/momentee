import { Router, type IRouter } from 'express';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { verifyAccessToken } from '../utils/jwt.js';
import { env } from '../config/env.js';
import { getSpotifyAccessToken } from '../utils/spotify.js';
import { uploadAudio, deleteAsset } from '../utils/cloudinary.js';

const router: IRouter = Router();

const SPOTIFY_API = 'https://api.spotify.com/v1';

const CATEGORIES = [
  { id: 'romantic', label: 'Romantic' },
  { id: 'happy', label: 'Happy' },
  { id: 'chill', label: 'Chill' },
  { id: 'sad', label: 'Sad' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'acoustic', label: 'Acoustic' },
  { id: 'lofi', label: 'Lo-fi' },
];

const ALLOWED_AUDIO_MIMES = new Set([
  'audio/mpeg',
  'audio/mp4',
  'audio/ogg',
  'audio/wav',
  'audio/aac',
  'audio/x-m4a',
  'audio/mp3',
]);

const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // 15MB raw
const MAX_AUDIO_DURATION = 600; // 10 minutes

// Rate limiters
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many search requests. Please wait a moment.',
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many upload requests. Please wait.',
});

// Auth middleware for /api/music routes
router.use('/api/music', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const user = verifyAccessToken(authHeader.slice(7));
    (req as any).user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ─── Spotify endpoints ──────────────────────────────────────────────

// GET /api/music/spotify/categories
router.get('/api/music/spotify/categories', searchLimiter, (_req, res) => {
  res.json({ categories: CATEGORIES });
});

// GET /api/music/spotify/search?q=&limit=20
router.get('/api/music/spotify/search', searchLimiter, async (req, res) => {
  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET) {
    res.status(503).json({ error: 'Spotify search is not configured' });
    return;
  }

  const q = String(req.query.q ?? '').slice(0, 200);
  if (!q) {
    res.json({ results: [] });
    return;
  }

  const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10) || 20, 50);

  try {
    const token = await getSpotifyAccessToken();
    const params = new URLSearchParams({
      q,
      type: 'track',
      limit: String(limit),
      market: 'VN',
    });

    const response = await fetch(`${SPOTIFY_API}/search?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      console.error(`[Spotify API] Search failed: ${response.status}`);
      res.status(502).json({ error: 'Music service unavailable' });
      return;
    }

    const data = (await response.json()) as {
      tracks?: {
        items?: Array<{
          id: string;
          name: string;
          artists: Array<{ name: string }>;
          album: { images: Array<{ url: string; width: number }> };
          duration_ms: number;
          preview_url: string | null;
          uri: string;
          external_urls: { spotify: string };
        }>;
      };
    };

    const results = (data.tracks?.items ?? []).map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((a) => a.name).join(', '),
      albumArt: track.album.images[0]?.url ?? '',
      durationMs: track.duration_ms,
      previewUrl: track.preview_url,
      spotifyUri: track.uri,
    }));

    res.json({ results });
  } catch (e) {
    console.error('[Spotify API] Search error:', e);
    res.status(502).json({ error: 'Failed to search tracks' });
  }
});

// ─── Upload endpoints ───────────────────────────────────────────────

// Increase JSON body limit for audio uploads
router.use('/api/music/upload', express.json({ limit: '25mb' }));

// POST /api/music/upload — upload base64 audio to Cloudinary
router.post('/api/music/upload', uploadLimiter, async (req, res) => {
  if (!env.CLOUDINARY_URL) {
    res.status(503).json({ error: 'File uploads are not configured' });
    return;
  }

  const { file, title } = req.body as { file?: string; title?: string };
  if (!file || typeof file !== 'string') {
    res.status(400).json({ error: 'Missing file (base64-encoded audio)' });
    return;
  }

  // Validate MIME type from data URI prefix
  const mimeMatch = file.match(/^data:(audio\/[\w+.-]+);base64,/);
  if (!mimeMatch || !ALLOWED_AUDIO_MIMES.has(mimeMatch[1])) {
    res.status(400).json({
      error: 'Invalid audio format. Allowed: MP3, M4A, OGG, WAV, AAC',
    });
    return;
  }

  // Estimate raw file size from base64 length
  const base64Data = file.split(',')[1] ?? file;
  const estimatedBytes = (base64Data.length * 3) / 4;
  if (estimatedBytes > MAX_AUDIO_BYTES) {
    res.status(400).json({ error: 'File too large. Maximum 15MB.' });
    return;
  }

  try {
    const result = await uploadAudio(file, 'music');

    if (result.duration > MAX_AUDIO_DURATION) {
      // Clean up oversized upload
      await deleteAsset(result.publicId, 'video');
      res.status(400).json({ error: 'Audio too long. Maximum 10 minutes.' });
      return;
    }

    res.json({
      url: result.url,
      publicId: result.publicId,
      duration: result.duration,
      format: result.format,
      bytes: result.bytes,
      title: title || 'Uploaded Track',
    });
  } catch (e) {
    console.error('[Music Upload] Error:', e);
    res.status(500).json({ error: 'Failed to upload audio' });
  }
});

// DELETE /api/music/upload/:publicId — delete uploaded audio from Cloudinary
router.delete('/api/music/upload/:publicId(*)', uploadLimiter, async (req, res) => {
  const publicId = req.params.publicId;
  if (!publicId) {
    res.status(400).json({ error: 'Missing publicId' });
    return;
  }

  try {
    await deleteAsset(publicId, 'video');
    res.json({ success: true });
  } catch (e) {
    console.error('[Music Delete] Error:', e);
    res.status(500).json({ error: 'Failed to delete audio' });
  }
});

export default router;
