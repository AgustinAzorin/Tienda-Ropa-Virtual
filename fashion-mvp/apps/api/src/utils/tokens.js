const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const ACCESS_TTL = '15m';         // access JWT
const REFRESH_TTL_DAYS = 30;      // refresh token

function signAccessJwt(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });
}

function genRefreshToken() {
  return crypto.randomBytes(48).toString('base64url'); // opaco
}

async function hashToken(token) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
}

module.exports = { signAccessJwt, genRefreshToken, hashToken, REFRESH_TTL_DAYS };
