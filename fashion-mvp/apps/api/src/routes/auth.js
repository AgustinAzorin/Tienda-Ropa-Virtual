import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { RegisterSchema, LoginSchema } from '../schemas/authSchemas.js';

export const authRouter = Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

// POST /api/auth/register
authRouter.post('/auth/register', async (req, res, next) => {
  try {
    const data = RegisterSchema.parse(req.body);

    const exists = await User.findOne({ where: { email: data.email } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      email: data.email,
      password_hash,
      role: data.role || 'buyer'
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'ValidationError', issues: err.issues });
    next(err);
  }
});

// POST /api/auth/login
authRouter.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_active) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'ValidationError', issues: err.issues });
    next(err);
  }
});
authRouter.get('/auth/me', (req, res) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET); // { id, email, role, iat, exp }
    return res.json({ user: { id: payload.id, email: payload.email, role: payload.role } });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default authRouter;