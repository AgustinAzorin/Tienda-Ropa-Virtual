// Cliente Redis (ioredis)
import Redis from 'ioredis';

const host = process.env.REDIS_HOST || 'localhost';
const port = Number(process.env.REDIS_PORT || 6379);

export const redis = new Redis({ host, port, lazyConnect: true });

// opcional: conectar al boot de la app
export async function ensureRedis() {
  if (redis.status === 'end' || redis.status === 'wait') await redis.connect();
}
