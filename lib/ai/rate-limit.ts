interface FixedWindowEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
}

const globalRateLimitStore = globalThis as typeof globalThis & {
  __aiLearningRateLimits?: Map<string, FixedWindowEntry>;
};

const rateLimitStore =
  globalRateLimitStore.__aiLearningRateLimits || new Map<string, FixedWindowEntry>();

if (process.env.NODE_ENV !== "production") {
  globalRateLimitStore.__aiLearningRateLimits = rateLimitStore;
}

export function consumeFixedWindowRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): RateLimitResult {
  const safeLimit = Math.max(1, Math.floor(limit));
  const safeWindowMs = Math.max(1_000, Math.floor(windowMs));
  const existing = rateLimitStore.get(key);
  const entry = !existing || existing.resetAt <= now
    ? { count: 0, resetAt: now + safeWindowMs }
    : existing;

  if (entry.count >= safeLimit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1_000)),
      resetAt: entry.resetAt,
    };
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);

  if (rateLimitStore.size > 2_000) {
    for (const [storedKey, storedEntry] of rateLimitStore) {
      if (storedEntry.resetAt <= now) rateLimitStore.delete(storedKey);
    }
  }

  return {
    allowed: true,
    remaining: Math.max(0, safeLimit - entry.count),
    retryAfterSeconds: 0,
    resetAt: entry.resetAt,
  };
}
