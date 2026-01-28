import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// In-memory fallback (per-instance)
const memoryStore = new Map<string, { count: number; resetTime: number }>();

function getClientIp(req: Request): string {
  const xfwd = req.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf;
  return "127.0.0.1";
}

function allowInMemory(key: string, limit: number, windowSec: number) {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || now > entry.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + windowSec * 1000 });
    return { allowed: true, remaining: limit - 1, reset: now + windowSec * 1000 };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, reset: entry.resetTime };
  }
  entry.count++;
  return { allowed: true, remaining: Math.max(0, limit - entry.count), reset: entry.resetTime };
}

let redis: Redis | null = null;
const ratelimits = new Map<string, Ratelimit>();

function getRatelimit(limit: number, windowSec: number) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  const configKey = `${limit}:${windowSec}`;
  const existing = ratelimits.get(configKey);
  if (existing) return existing;

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    analytics: true,
    prefix: "portfolio:rl",
  });

  ratelimits.set(configKey, rl);
  return rl;
}

export async function enforceRateLimit(req: Request, limit = 5, windowSec = 3600, keyPrefix = "contact") {
  const ip = getClientIp(req);
  const key = `${keyPrefix}:${ip}`;
  const rl = getRatelimit(limit, windowSec);
  if (!rl) {
    return allowInMemory(key, limit, windowSec);
  }
  const { success, reset, remaining } = await rl.limit(key);
  return { allowed: success, remaining, reset };
}
