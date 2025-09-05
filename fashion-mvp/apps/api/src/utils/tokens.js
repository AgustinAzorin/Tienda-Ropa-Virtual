import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const ACCESS_TTL = '15m';
export const REFRESH_TTL_DAYS = 30;

export function signAccessJwt(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });
}

export function genRefreshToken() {
  return crypto.randomBytes(48).toString('base64url');
}

export async function hashToken(token) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
}
