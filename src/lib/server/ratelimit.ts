import { getOptionalEnv } from "@/lib/server/env";

type RateLimitResult = { success: boolean; remaining: number };

// In-memory sliding window — works per-instance, sufficient for low-traffic deploys.
// For multi-instance production, set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
const store = new Map<string, { count: number; reset: number }>();

function inMemoryLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  return { success: entry.count <= limit, remaining };
}

type LimiterConfig = { limit: number; windowSeconds: number };

async function check(key: string, config: LimiterConfig): Promise<RateLimitResult> {
  // Vercel KV uses KV_REST_API_URL/TOKEN; fallback to UPSTASH_ prefix for manual setups
  const upstashUrl = getOptionalEnv("KV_REST_API_URL") ?? getOptionalEnv("UPSTASH_REDIS_REST_URL");
  const upstashToken = getOptionalEnv("KV_REST_API_TOKEN") ?? getOptionalEnv("UPSTASH_REDIS_REST_TOKEN");

  if (upstashUrl && upstashToken) {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");

    const ratelimit = new Ratelimit({
      redis: new Redis({ url: upstashUrl, token: upstashToken }),
      limiter: Ratelimit.slidingWindow(config.limit, `${config.windowSeconds} s`),
      ephemeralCache: new Map(),
    });

    const result = await ratelimit.limit(key);
    return { success: result.success, remaining: result.remaining };
  }

  return inMemoryLimit(key, config.limit, config.windowSeconds * 1000);
}

export const rateLimiter = {
  // Auth sync: 5 requests per minute per user
  authSync: (userId: string) => check(`auth_sync:${userId}`, { limit: 5, windowSeconds: 60 }),
  // Leaderboard: 30 requests per minute per IP
  leaderboard: (ip: string) => check(`leaderboard:${ip}`, { limit: 30, windowSeconds: 60 }),
  // Me endpoint: 20 requests per minute per user
  me: (userId: string) => check(`me:${userId}`, { limit: 20, windowSeconds: 60 }),
};
