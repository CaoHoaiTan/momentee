import { Router, type IRouter } from 'express';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { uploadImage, uploadAvatar } from '../utils/cloudinary.js';
import { verifyAccessToken } from '../utils/jwt.js';

const router: IRouter = Router();

// Increase body size limit for base64 uploads (10MB)
router.use('/api/upload', express.json({ limit: '10mb' }));

// Rate limit uploads: 30 per 15 minutes per IP
router.use(
  '/api/upload',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many uploads. Please try again later.' },
  }),
);

// Auth middleware
router.use('/api/upload', (req, res, next) => {
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

// POST /api/upload/image — upload a general image
router.post('/api/upload/image', async (req, res) => {
  try {
    const { file, folder = 'general' } = req.body;
    if (!file) {
      res.status(400).json({ error: 'file is required (base64 or URL)' });
      return;
    }
    const result = await uploadImage(file, folder);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? 'Upload failed' });
  }
});

// POST /api/upload/avatar — upload an avatar with face crop
router.post('/api/upload/avatar', async (req, res) => {
  try {
    const { file } = req.body;
    if (!file) {
      res.status(400).json({ error: 'file is required (base64 or URL)' });
      return;
    }
    const result = await uploadAvatar(file);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? 'Upload failed' });
  }
});

export default router;
