type RateLimitConfig = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

function cleanupExpired(now: number) {
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function consumeMemoryRateLimit(config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  cleanupExpired(now);

  const entry = store.get(config.key);
  if (!entry || entry.resetAt <= now) {
    const resetAt = now + config.windowMs;
    store.set(config.key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: Math.max(config.limit - 1, 0),
      resetAt,
    };
  }

  entry.count += 1;
  store.set(config.key, entry);

  if (entry.count > config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(config.limit - entry.count, 0),
    resetAt: entry.resetAt,
  };
}
