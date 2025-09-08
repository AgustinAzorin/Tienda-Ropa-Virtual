import { Router } from 'express';
import crypto from 'crypto';
import { redis } from '../utils/redis.js';

const scoreRouter = Router(); // <-- crear antes de usar

// normalize SCORE_BASE_URL (quita comillas/espacios si vienen del .env)
const SCORE_BASE_URL = String(process.env.SCORE_BASE_URL || 'http://127.0.0.1:8000').trim().replace(/^['"]|['"]$/g, '');

scoreRouter.post('/outfits/score', async (req, res, next) => {
  try {
    const payload = JSON.stringify(req.body || {});
    const hash = crypto.createHash('sha1').update(payload).digest('hex');
    const key = `score:${hash}`;
    const TTL = 60; // segundos

    // 1) intento cache *solo si* redis ya está ready (no forzamos conexión)
    const cached = redis.status === 'ready' ? await redis.get(key).catch(() => null) : null;
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(JSON.parse(cached));
    }

    // 2) llamada al servicio FastAPI con timeout
    // timeout menor que el timeout global de los tests para evitar que Vitest agote su timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const resp = await fetch(`${SCORE_BASE_URL}/score`, {
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

    // 3) guardar cache best-effort si redis está listo
    if (redis.status === 'ready') {
      await redis.setex(key, TTL, JSON.stringify(data)).catch(() => {});
    }

    res.set('X-Cache', 'MISS');
    res.json(data);
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Score service timeout' });
    }
    next(err);
  }
});

export { scoreRouter };