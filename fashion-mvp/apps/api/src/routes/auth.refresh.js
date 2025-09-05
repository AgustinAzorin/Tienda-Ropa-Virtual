import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { models } from '../models/registry.js';
import { signAccessJwt, genRefreshToken, hashToken, REFRESH_TTL_DAYS } from '../utils/tokens.js';

const router = Router();

function setRefreshCookie(res, raw) {
  res.cookie('rt', raw, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await models.User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

    const accessToken = signAccessJwt({ sub: user.id, role: user.role });
    const rawRt = genRefreshToken();
    const tokenHash = await hashToken(rawRt);
    const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

    await models.RefreshToken.create({
      tokenHash, userId: user.id, userAgent: req.get('user-agent') || '',
      ip: req.ip, expiresAt
    });

    setRefreshCookie(res, rawRt);
    res.json({ accessToken });
  } catch (e) { next(e); }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const rawRt = req.cookies?.rt;
    if (!rawRt) return res.status(401).json({ error: 'no_refresh' });

    const tokens = await models.RefreshToken.findAll({
      where: { userAgent: req.get('user-agent') || '', ip: req.ip },
      order: [['createdAt', 'DESC']], limit: 5
    });

    let match = null;
    for (const t of tokens) {
      if (!t.revokedAt && t.expiresAt > new Date()) {
        const ok = await bcrypt.compare(rawRt, t.tokenHash);
        if (ok) { match = t; break; }
      }
    }
    if (!match) return res.status(401).json({ error: 'invalid_refresh' });

    await match.update({ revokedAt: new Date() });

    const user = await models.User.findByPk(match.userId);
    const accessToken = signAccessJwt({ sub: user.id, role: user.role });
    const newRaw = genRefreshToken();
    const tokenHash = await hashToken(newRaw);
    const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

    await models.RefreshToken.create({
      tokenHash, userId: user.id, userAgent: req.get('user-agent') || '',
      ip: req.ip, expiresAt
    });

    setRefreshCookie(res, newRaw);
    res.json({ accessToken });
  } catch (e) { next(e); }
});

router.post('/logout', async (req, res, next) => {
  try {
    const rawRt = req.cookies?.rt;
    if (rawRt) {
      const all = await models.RefreshToken.findAll({ order: [['createdAt','DESC']], limit: 10 });
      for (const t of all) {
        const ok = await bcrypt.compare(rawRt, t.tokenHash);
        if (ok) await t.update({ revokedAt: new Date() });
      }
    }
    res.clearCookie('rt', { path: '/api/auth' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
