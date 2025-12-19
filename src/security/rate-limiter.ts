/**
 * Rate Limiting Implementation
 * Protects against abuse and DoS attacks
 */

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Error message when limit exceeded
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  info: RateLimitInfo;
}

/**
 * In-memory rate limiter using Map
 * For production, consider using Redis or Cloudflare KV
 */
export class RateLimiter {
  private requests: Map<string, number[]>;
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.requests = new Map();
    this.config = {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      message: config.message || 'Too many requests, please try again later',
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
    };

    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if request is allowed
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @returns Rate limit result
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing requests for this identifier
    let timestamps = this.requests.get(identifier) || [];

    // Remove timestamps outside the current window
    timestamps = timestamps.filter((timestamp) => timestamp > windowStart);

    // Check if limit exceeded
    const allowed = timestamps.length < this.config.maxRequests;
    const oldestTimestamp = timestamps[0] || now;
    const reset = oldestTimestamp + this.config.windowMs;
    const retryAfter = allowed ? undefined : Math.ceil((reset - now) / 1000);

    // Calculate remaining BEFORE adding current request
    const remaining = Math.max(0, this.config.maxRequests - timestamps.length - (allowed ? 1 : 0));

    // Add current request if allowed
    if (allowed) {
      timestamps.push(now);
      this.requests.set(identifier, timestamps);
    }

    return {
      allowed,
      info: {
        limit: this.config.maxRequests,
        remaining,
        reset,
        retryAfter,
      },
    };
  }

  /**
   * Record a request (for manual tracking)
   * @param identifier - Unique identifier
   */
  record(identifier: string): void {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];
    timestamps.push(now);
    this.requests.set(identifier, timestamps);
  }

  /**
   * Reset rate limit for an identifier
   * @param identifier - Unique identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Clean up old entries
   */
  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    for (const [identifier, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter((t) => t > windowStart);

      if (validTimestamps.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validTimestamps);
      }
    }
  }

  /**
   * Get current stats
   */
  getStats(): { totalIdentifiers: number; totalRequests: number } {
    let totalRequests = 0;
    for (const timestamps of this.requests.values()) {
      totalRequests += timestamps.length;
    }

    return {
      totalIdentifiers: this.requests.size,
      totalRequests,
    };
  }
}

/**
 * Create rate limiter middleware for Cloudflare Workers
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const limiter = new RateLimiter(config);

  return async (request: Request): Promise<Response | null> => {
    // Get identifier (IP address or session ID)
    const identifier = getIdentifier(request);

    // Check rate limit
    const result = limiter.check(identifier);

    // If not allowed, return 429 response
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: config.message || 'Rate limit exceeded',
          retryAfter: result.info.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.info.limit.toString(),
            'X-RateLimit-Remaining': result.info.remaining.toString(),
            'X-RateLimit-Reset': result.info.reset.toString(),
            'Retry-After': result.info.retryAfter?.toString() || '60',
          },
        }
      );
    }

    // Request allowed, return null to continue
    return null;
  };
}

/**
 * Get unique identifier from request
 * @param request - Request object
 * @returns Unique identifier
 */
export function getIdentifier(request: Request): string {
  // Try to get IP from CF-Connecting-IP header (Cloudflare)
  const cfIp = request.headers.get('CF-Connecting-IP');
  if (cfIp) {
    return cfIp;
  }

  // Try to get IP from X-Forwarded-For header
  const forwardedFor = request.headers.get('X-Forwarded-For');
  if (forwardedFor) {
    const ips = forwardedFor.split(',');
    const firstIp = ips[0];
    if (firstIp) {
      return firstIp.trim();
    }
  }

  // Try to get IP from X-Real-IP header
  const realIp = request.headers.get('X-Real-IP');
  if (realIp) {
    return realIp;
  }

  // Fallback to a default identifier
  return 'unknown';
}

/**
 * Add rate limit headers to response
 * @param response - Response object
 * @param info - Rate limit info
 * @returns Response with rate limit headers
 */
export function addRateLimitHeaders(response: Response, info: RateLimitInfo): Response {
  const newResponse = new Response(response.body, response);

  newResponse.headers.set('X-RateLimit-Limit', info.limit.toString());
  newResponse.headers.set('X-RateLimit-Remaining', info.remaining.toString());
  newResponse.headers.set('X-RateLimit-Reset', info.reset.toString());

  if (info.retryAfter) {
    newResponse.headers.set('Retry-After', info.retryAfter.toString());
  }

  return newResponse;
}

/**
 * Multiple rate limiters for different endpoints
 */
export class MultiRateLimiter {
  private limiters: Map<string, RateLimiter>;

  constructor() {
    this.limiters = new Map();
  }

  /**
   * Add a rate limiter for a specific endpoint
   * @param endpoint - Endpoint path or pattern
   * @param config - Rate limit configuration
   */
  addLimiter(endpoint: string, config: RateLimitConfig): void {
    this.limiters.set(endpoint, new RateLimiter(config));
  }

  /**
   * Check rate limit for a request
   * @param endpoint - Endpoint path
   * @param identifier - Unique identifier
   * @returns Rate limit result
   */
  check(endpoint: string, identifier: string): RateLimitResult {
    const limiter = this.limiters.get(endpoint);

    if (!limiter) {
      // No rate limit configured for this endpoint
      return {
        allowed: true,
        info: {
          limit: Infinity,
          remaining: Infinity,
          reset: Date.now(),
        },
      };
    }

    return limiter.check(identifier);
  }

  /**
   * Get limiter for endpoint
   * @param endpoint - Endpoint path
   * @returns Rate limiter or undefined
   */
  getLimiter(endpoint: string): RateLimiter | undefined {
    return this.limiters.get(endpoint);
  }
}

/**
 * Default rate limit configurations
 */
export const DEFAULT_RATE_LIMITS = {
  // General API endpoints: 60 requests per minute
  api: {
    windowMs: 60 * 1000,
    maxRequests: 60,
    message: 'Too many API requests, please try again later',
  },

  // Chat endpoint: 20 requests per minute (AI is expensive)
  chat: {
    windowMs: 60 * 1000,
    maxRequests: 20,
    message: 'Too many chat messages, please slow down',
  },

  // Authentication: 5 attempts per 15 minutes
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later',
  },

  // Strict limit for sensitive operations: 3 per hour
  strict: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
    message: 'Rate limit exceeded for this operation',
  },
};
