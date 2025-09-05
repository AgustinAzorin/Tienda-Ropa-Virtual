import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { models } from '../models/registry.js';

const router = Router();

async function hash(token) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
}

// POST /api/password/forgot { email }
router.post('/forgot', async (req, res, next) => {
  try {
    const user = await models.User.findOne({ where: { email: req.body.email } });
    if (!user) return res.json({ ok: true });
    const raw = crypto.randomBytes(32).toString('base64url');
    const tokenHash = await hash(raw);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
    await models.PasswordResetToken.create({ userId: user.id, tokenHash, expiresAt });
    // TODO: enviar enlace con raw
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// POST /api/password/reset { token, newPassword }
router.post('/reset', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const prts = await models.PasswordResetToken.findAll({
      order: [['createdAt', 'DESC']], limit: 5
    });
    let row = null;
    for (const t of prts) {
      if (!t.usedAt && t.expiresAt > new Date()) {
        const ok = await bcrypt.compare(token, t.tokenHash);
        if (ok) { row = t; break; }
      }
    }
    if (!row) return res.status(400).json({ error: 'invalid_or_expired' });

    const user = await models.User.findByPk(row.userId);
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    await user.update({ password_hash });
    await row.update({ usedAt: new Date() });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
