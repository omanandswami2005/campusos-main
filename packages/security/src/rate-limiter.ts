import Redis from 'ioredis';

// ============================================================================
// Redis Client Singleton
// ============================================================================

let redisClient: Redis | null = null;

/**
 * Get or create Redis client
 */
export function getRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true,
    });

    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis connected');
    });
  }

  return redisClient;
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// ============================================================================
// Rate Limiter Configuration
// ============================================================================

export interface RateLimitConfig {
  /** Window size in seconds */
  windowSec: number;
  /** Maximum requests per window */
  maxRequests: number;
  /** Key prefix for Redis */
  keyPrefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

// ============================================================================
// Rate Limiter (Sliding Window with Redis)
// ============================================================================

/**
 * Rate limiter using Redis sliding window algorithm
 */
export class RateLimiter {
  private redis: Redis | null;
  private config: Required<RateLimitConfig>;
  private inMemoryStore: Map<string, { count: number; resetAt: number }> = new Map();

  constructor(config: RateLimitConfig) {
    this.redis = getRedisClient();
    this.config = {
      windowSec: config.windowSec,
      maxRequests: config.maxRequests,
      keyPrefix: config.keyPrefix || 'ratelimit',
    };
  }

  /**
   * Check if request is allowed
   */
  async check(identifier: string): Promise<RateLimitResult> {
    const key = `${this.config.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowMs = this.config.windowSec * 1000;
    const resetAt = new Date(now + windowMs);

    // Use Redis if available
    if (this.redis) {
      return this.checkWithRedis(key, now, windowMs, resetAt);
    }

    // Fallback to in-memory store
    return this.checkInMemory(key, now, windowMs, resetAt);
  }

  private async checkWithRedis(
    key: string,
    now: number,
    windowMs: number,
    resetAt: Date
  ): Promise<RateLimitResult> {
    const redis = this.redis!;
    const windowStart = now - windowMs;

    // Use Redis sorted set for sliding window
    const multi = redis.multi();

    // Remove old entries outside the window
    multi.zremrangebyscore(key, 0, windowStart);

    // Count current entries in window
    multi.zcard(key);

    // Add current request
    multi.zadd(key, now.toString(), `${now}-${Math.random()}`);

    // Set expiry
    multi.expire(key, this.config.windowSec + 1);

    const results = await multi.exec();
    const currentCount = (results?.[1]?.[1] as number) || 0;

    const allowed = currentCount < this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - currentCount - 1);

    return {
      allowed,
      remaining: allowed ? remaining : 0,
      resetAt,
      retryAfter: allowed ? undefined : this.config.windowSec,
    };
  }

  private checkInMemory(
    key: string,
    now: number,
    windowMs: number,
    resetAt: Date
  ): RateLimitResult {
    const entry = this.inMemoryStore.get(key);

    // Clean expired entries periodically
    if (Math.random() < 0.01) {
      this.cleanupInMemory(now);
    }

    if (!entry || entry.resetAt < now) {
      // New window
      this.inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetAt,
      };
    }

    if (entry.count >= this.config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(entry.resetAt),
        retryAfter,
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetAt: new Date(entry.resetAt),
    };
  }

  private cleanupInMemory(now: number): void {
    for (const [key, entry] of this.inMemoryStore.entries()) {
      if (entry.resetAt < now) {
        this.inMemoryStore.delete(key);
      }
    }
  }
}

// ============================================================================
// Pre-configured Rate Limiters
// ============================================================================

/** Strict limiter for auth endpoints (5 requests per minute) */
export const authRateLimiter = new RateLimiter({
  windowSec: 60,
  maxRequests: 5,
  keyPrefix: 'ratelimit:auth',
});

/** Standard limiter for API endpoints (100 requests per minute) */
export const apiRateLimiter = new RateLimiter({
  windowSec: 60,
  maxRequests: 100,
  keyPrefix: 'ratelimit:api',
});

/** Strict limiter for password reset (3 requests per hour) */
export const passwordResetLimiter = new RateLimiter({
  windowSec: 3600,
  maxRequests: 3,
  keyPrefix: 'ratelimit:pwreset',
});

/** Very strict limiter for registration (10 per hour per IP) */
export const registrationLimiter = new RateLimiter({
  windowSec: 3600,
  maxRequests: 10,
  keyPrefix: 'ratelimit:register',
});
