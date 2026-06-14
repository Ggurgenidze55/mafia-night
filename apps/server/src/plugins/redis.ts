import Redis from 'ioredis';

let redis: Redis | null = null;
const memoryStore = new Map<string, { value: string; expiresAt?: number }>();

function memGet(key: string): string | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) { memoryStore.delete(key); return null; }
  return entry.value;
}

function memSet(key: string, value: string, ttlSeconds?: number) {
  memoryStore.set(key, { value, expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined });
}

function tryRedis(): Redis | null {
  if (redis) return redis;
  if (!process.env.REDIS_URL && process.env.NODE_ENV !== 'production') return null;
  try {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { lazyConnect: true, connectTimeout: 2000 });
    redis.on('error', () => { redis = null; });
    return redis;
  } catch {
    return null;
  }
}

export async function getGameState(roomId: string) {
  const r = tryRedis();
  const raw = r ? await r.get(`game:${roomId}`).catch(() => null) : memGet(`game:${roomId}`);
  return raw ? JSON.parse(raw) : null;
}

export async function setGameState(roomId: string, state: unknown) {
  const json = JSON.stringify(state);
  const r = tryRedis();
  if (r) {
    await r.set(`game:${roomId}`, json, 'EX', 14400).catch(() => memSet(`game:${roomId}`, json, 14400));
  } else {
    memSet(`game:${roomId}`, json, 14400);
  }
}

export async function deleteGameState(roomId: string) {
  const r = tryRedis();
  if (r) await r.del(`game:${roomId}`).catch(() => memoryStore.delete(`game:${roomId}`));
  else memoryStore.delete(`game:${roomId}`);
}
