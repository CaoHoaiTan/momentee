import { Router, type IRouter } from 'express';

const router: IRouter = Router();

router.post('/webhooks/stripe', (_req, res) => {
  res.json({ received: true });
});

export default router;
