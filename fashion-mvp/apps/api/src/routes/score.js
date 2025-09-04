import { Router } from 'express';

export const scoreRouter = Router();

scoreRouter.post('/outfits/score', async (req, res, next) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const resp = await fetch(`${process.env.SCORE_BASE_URL}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(502).json({ error: 'Score service error', detail: text });
    }

    const data = await resp.json();
    res.json(data);
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Score service timeout' });
    }
    next(err);
  }
});

