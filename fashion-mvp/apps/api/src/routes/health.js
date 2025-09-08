import { Router } from 'express';
const router = Router();

// GET /api/health
router.get('/', (_req, res) => {
  res.json({
    ok: true,
    now: new Date().toISOString(),
    uptime_s: Math.round(process.uptime()),
    version: res.app.get('version') || 'dev',
    requestId: res.getHeader('X-Request-Id') || null,
  });
});

export default router;
