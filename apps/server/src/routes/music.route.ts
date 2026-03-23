import { Router, type IRouter } from 'express';
import rateLimit from 'express-rate-limit';
import { verifyAccessToken } from '../utils/jwt.js';
import { env } from '../config/env.js';

const router: IRouter = Router();

const JAMENDO_BASE = 'https://api.jamendo.com/v3.0';

const SAFE_FIELDS = ['id', 'name', 'artist_name', 'audio', 'image', 'duration'] as const;

const CATEGORIES = [
  { id: 'romantic', label: 'Romantic', tags: 'romantic love' },
  { id: 'happy', label: 'Happy', tags: 'happy upbeat' },
  { id: 'chill', label: 'Chill', tags: 'chill relax' },
  { id: 'emotional', label: 'Emotional', tags: 'emotional sad' },
  { id: 'cinematic', label: 'Cinematic', tags: 'cinematic epic' },
  { id: 'acoustic', label: 'Acoustic', tags: 'acoustic folk' },
  { id: 'lofi', label: 'Lo-fi', tags: 'lofi study' },
];

// Per-user rate limit: 30 requests/minute
const musicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many music search requests. Please wait a moment.',
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

// GET /api/music/categories — return mood/genre category list
router.get('/api/music/categories', musicLimiter, (_req, res) => {
  res.json({ categories: CATEGORIES });
});

// GET /api/music/search?q=&tags=&limit=20 — proxy to Jamendo API
router.get('/api/music/search', musicLimiter, async (req, res) => {
  if (!env.JAMENDO_CLIENT_ID) {
    res.status(503).json({ error: 'Music search is not configured' });
    return;
  }

  const q = String(req.query.q ?? '').slice(0, 200);
  const tags = String(req.query.tags ?? '').slice(0, 200);
  const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10) || 20, 50);

  try {
    const params = new URLSearchParams({
      client_id: env.JAMENDO_CLIENT_ID,
      format: 'json',
      limit: String(limit),
      include: 'musicinfo',
      audioformat: 'mp31',
    });
    if (q) params.set('search', q);
    if (tags) params.set('tags', tags);

    const response = await fetch(`${JAMENDO_BASE}/tracks/?${params.toString()}`);
    if (!response.ok) {
      res.status(502).json({ error: 'Music service unavailable' });
      return;
    }

    const data = await response.json() as { results?: Record<string, unknown>[] };
    const results = (data.results ?? []).map((track) => {
      const safe: Record<string, unknown> = {};
      for (const field of SAFE_FIELDS) {
        if (field in track) safe[field] = track[field];
      }
      return safe;
    });

    res.json({ results });
  } catch {
    res.status(502).json({ error: 'Failed to fetch tracks' });
  }
});

export default router;
