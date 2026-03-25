import Redis from 'ioredis';
import { logger } from './logger';

let redis: Redis | null = null;
let connected = false;

try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 3) {
        logger.warn('Redis unavailable — working without cache');
        return null; // stop retrying
      }
      return Math.min(times * 200, 2000);
    },
  });

  redis.on('connect', () => { connected = true; logger.info('Redis connected'); });
  redis.on('error', () => { connected = false; });
  redis.on('close', () => { connected = false; });

  redis.connect().catch(() => {
    logger.warn('Redis not available — running without cache');
  });
} catch {
  logger.warn('Redis init failed — running without cache');
}

export function isRedisConnected(): boolean {
  return connected;
}

export async function setJSON(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  if (!redis || !connected) return;
  const json = JSON.stringify(value);
  if (ttlSeconds) {
    await redis.set(key, json, 'EX', ttlSeconds);
  } else {
    await redis.set(key, json);
  }
}

export async function getJSON<T = unknown>(key: string): Promise<T | null> {
  if (!redis || !connected) return null;
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
}

export async function deleteKey(key: string): Promise<number> {
  if (!redis || !connected) return 0;
  return redis.del(key);
}

export async function exists(key: string): Promise<boolean> {
  if (!redis || !connected) return false;
  return (await redis.exists(key)) === 1;
}

export async function setWithExpiry(key: string, value: string, seconds: number): Promise<void> {
  if (!redis || !connected) return;
  await redis.set(key, value, 'EX', seconds);
}

export { redis };
