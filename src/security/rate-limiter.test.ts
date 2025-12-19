/**
 * Unit Tests for Rate Limiter
 * Tests rate limiting functionality and abuse prevention
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter, getIdentifier, DEFAULT_RATE_LIMITS } from './rate-limiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({
      windowMs: 60000, // 1 minute
      maxRequests: 5,
    });
  });

  it('should allow requests within limit', () => {
    const identifier = 'test-user';

    for (let i = 0; i < 5; i++) {
      const result = limiter.check(identifier);
      expect(result.allowed).toBe(true);
      expect(result.info.remaining).toBe(4 - i);
    }
  });

  it('should block requests exceeding limit', () => {
    const identifier = 'test-user';

    // Make 5 allowed requests
    for (let i = 0; i < 5; i++) {
      limiter.check(identifier);
    }

    // 6th request should be blocked
    const result = limiter.check(identifier);
    expect(result.allowed).toBe(false);
    expect(result.info.remaining).toBe(0);
    expect(result.info.retryAfter).toBeGreaterThan(0);
  });

  it('should track different identifiers separately', () => {
    const user1 = 'user-1';
    const user2 = 'user-2';

    // User 1 makes 5 requests
    for (let i = 0; i < 5; i++) {
      limiter.check(user1);
    }

    // User 2 should still be allowed
    const result = limiter.check(user2);
    expect(result.allowed).toBe(true);
    expect(result.info.remaining).toBe(4);
  });

  it('should reset after time window', async () => {
    const identifier = 'test-user';

    // Create limiter with short window for testing
    const shortLimiter = new RateLimiter({
      windowMs: 100, // 100ms
      maxRequests: 2,
    });

    // Make 2 requests (at limit)
    shortLimiter.check(identifier);
    shortLimiter.check(identifier);

    // Should be blocked
    let result = shortLimiter.check(identifier);
    expect(result.allowed).toBe(false);

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Should be allowed again
    result = shortLimiter.check(identifier);
    expect(result.allowed).toBe(true);
  });

  it('should provide correct rate limit info', () => {
    const identifier = 'test-user';

    const result = limiter.check(identifier);
    expect(result.info.limit).toBe(5);
    expect(result.info.remaining).toBe(4);
    expect(result.info.reset).toBeGreaterThan(Date.now());
  });

  it('should reset rate limit for identifier', () => {
    const identifier = 'test-user';

    // Make 5 requests (at limit)
    for (let i = 0; i < 5; i++) {
      limiter.check(identifier);
    }

    // Should be blocked
    let result = limiter.check(identifier);
    expect(result.allowed).toBe(false);

    // Reset
    limiter.reset(identifier);

    // Should be allowed again
    result = limiter.check(identifier);
    expect(result.allowed).toBe(true);
  });

  it('should provide stats', () => {
    limiter.check('user-1');
    limiter.check('user-1');
    limiter.check('user-2');

    const stats = limiter.getStats();
    expect(stats.totalIdentifiers).toBe(2);
    expect(stats.totalRequests).toBe(3);
  });
});

describe('getIdentifier', () => {
  it('should get IP from CF-Connecting-IP header', () => {
    const request = new Request('https://example.com', {
      headers: {
        'CF-Connecting-IP': '1.2.3.4',
      },
    });

    expect(getIdentifier(request)).toBe('1.2.3.4');
  });

  it('should get IP from X-Forwarded-For header', () => {
    const request = new Request('https://example.com', {
      headers: {
        'X-Forwarded-For': '1.2.3.4, 5.6.7.8',
      },
    });

    expect(getIdentifier(request)).toBe('1.2.3.4');
  });

  it('should get IP from X-Real-IP header', () => {
    const request = new Request('https://example.com', {
      headers: {
        'X-Real-IP': '1.2.3.4',
      },
    });

    expect(getIdentifier(request)).toBe('1.2.3.4');
  });

  it('should return unknown if no IP headers', () => {
    const request = new Request('https://example.com');
    expect(getIdentifier(request)).toBe('unknown');
  });

  it('should prioritize CF-Connecting-IP', () => {
    const request = new Request('https://example.com', {
      headers: {
        'CF-Connecting-IP': '1.2.3.4',
        'X-Forwarded-For': '5.6.7.8',
        'X-Real-IP': '9.10.11.12',
      },
    });

    expect(getIdentifier(request)).toBe('1.2.3.4');
  });
});

describe('DEFAULT_RATE_LIMITS', () => {
  it('should have api rate limit', () => {
    expect(DEFAULT_RATE_LIMITS.api).toBeDefined();
    expect(DEFAULT_RATE_LIMITS.api.windowMs).toBe(60000);
    expect(DEFAULT_RATE_LIMITS.api.maxRequests).toBe(60);
  });

  it('should have chat rate limit', () => {
    expect(DEFAULT_RATE_LIMITS.chat).toBeDefined();
    expect(DEFAULT_RATE_LIMITS.chat.windowMs).toBe(60000);
    expect(DEFAULT_RATE_LIMITS.chat.maxRequests).toBe(20);
  });

  it('should have auth rate limit', () => {
    expect(DEFAULT_RATE_LIMITS.auth).toBeDefined();
    expect(DEFAULT_RATE_LIMITS.auth.windowMs).toBe(900000); // 15 minutes
    expect(DEFAULT_RATE_LIMITS.auth.maxRequests).toBe(5);
  });

  it('should have strict rate limit', () => {
    expect(DEFAULT_RATE_LIMITS.strict).toBeDefined();
    expect(DEFAULT_RATE_LIMITS.strict.windowMs).toBe(3600000); // 1 hour
    expect(DEFAULT_RATE_LIMITS.strict.maxRequests).toBe(3);
  });
});
