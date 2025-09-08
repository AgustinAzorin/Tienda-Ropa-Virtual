// Cliente Redis (ioredis)
import Redis from 'ioredis';

const rawHost = process.env.REDIS_HOST || 'localhost';
const host = String(rawHost).trim().replace(/^['"]|['"]$/g, '');
const port = Number(process.env.REDIS_PORT || 6379);

export const redis = new Redis({ host, port, lazyConnect: true });

// nuevo: evitar Unhandled error y loguear fallos
redis.on('error', (err) => {
  console.warn('[redis] error:', err && err.message ? err.message : err);
});

// opcional: reconectar/attempt safe connect
export async function ensureRedis() {
  try {
    if (redis.status === 'end' || redis.status === 'wait') await redis.connect();
  } catch (e) {
    // no propagar: best-effort
    console.warn('[redis] connect failed:', e && e.message ? e.message : e);
  }
}
