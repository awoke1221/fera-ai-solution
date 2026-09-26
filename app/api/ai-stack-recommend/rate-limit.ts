const DEFAULT_RATE_LIMIT = {
  max: 5,
  windowMs: 60_000,
};

const rateLimitBuckets = new Map<string, number[]>();

export function consumeUserRateLimit(
  userId: string,
  options: { max: number; windowMs: number } = DEFAULT_RATE_LIMIT,
  now = Date.now(),
) {
  const timestamps = rateLimitBuckets.get(userId) ?? [];
  const recent = timestamps.filter((ts) => now - ts < options.windowMs);

  if (recent.length >= options.max) {
    const oldest = recent[0];
    return {
      allowed: false,
      retryAfterMs: Math.max(0, options.windowMs - (now - oldest)),
      remaining: 0,
    };
  }

  recent.push(now);
  rateLimitBuckets.set(userId, recent);

  return {
    allowed: true,
    retryAfterMs: 0,
    remaining: Math.max(0, options.max - recent.length),
  };
}
