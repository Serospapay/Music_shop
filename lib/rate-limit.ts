import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { consumeMemoryRateLimit } from "@/lib/rate-limit-memory";
import type { RateLimitResult } from "@/lib/rate-limit-memory";

type RateLimitConfig = {
  key: string;
  limit: number;
  windowMs: number;
};

let redisClient: Redis | null | undefined;
const upstashLimiterCache = new Map<string, Ratelimit>();

function getRedis(): Redis | null {
  if (redisClient !== undefined) {
    return redisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    redisClient = null;
    return null;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const cacheKey = `${limit}:${windowSec}`;
  if (!upstashLimiterCache.has(cacheKey)) {
    upstashLimiterCache.set(
      cacheKey,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
        prefix: "octave:rl",
      }),
    );
  }

  return upstashLimiterCache.get(cacheKey)!;
}

export async function consumeRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const limiter = getUpstashLimiter(config.limit, config.windowMs);
  if (!limiter) {
    return consumeMemoryRateLimit(config);
  }

  const outcome = await limiter.limit(config.key);
  return {
    allowed: outcome.success,
    remaining: outcome.remaining,
    resetAt: outcome.reset,
  };
}

export type { RateLimitResult } from "@/lib/rate-limit-memory";
