import { Router } from 'express';
import crypto from 'crypto';
import { redis, ensureRedis } from '../utils/redis.js';

scoreRouter.post('/outfits/score', async (req, res, next) => {
  try {
    await ensureRedis(); // no rompe si Redis no está
    const payload = JSON.stringify(req.body || {});
    const hash = crypto.createHash('sha1').update(payload).digest('hex');
    const key = `score:${hash}`;
    const TTL = 60; // segundos

    // 1) intento cache
    const cached = await redis.get(key).catch(() => null);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(JSON.parse(cached));
    }

    // 2) llamada al servicio FastAPI con timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const resp = await fetch(`${process.env.SCORE_BASE_URL}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      signal: controller.signal
    }).catch((e) => {
      clearTimeout(timeout);
      throw e;
    });
    clearTimeout(timeout);

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      return res.status(502).json({ error: 'Score service error', detail: text });
    }

    const data = await resp.json();

    // 3) guardar cache best-effort
    await redis.setex(key, TTL, JSON.stringify(data)).catch(() => {});

    res.set('X-Cache', 'MISS');
    res.json(data);
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Score service timeout' });
    }
    next(err);
  }
});

export const scoreRouter = Router();