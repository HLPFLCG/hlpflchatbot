/**
 * Security Module - Central Export
 * Provides comprehensive security features for the HLPFL chatbot
 */

export * from './headers';
export * from './sanitizer';
export * from './rate-limiter';
export * from './cors';

/**
 * Security middleware stack
 * Combines all security features into a single middleware
 */
import { applySecurityHeaders } from './headers';
import { createRateLimitMiddleware, DEFAULT_RATE_LIMITS } from './rate-limiter';
import { createCorsMiddleware, DEFAULT_CORS_OPTIONS } from './cors';
import { validateMessage } from './sanitizer';

export interface SecurityConfig {
  enableRateLimit?: boolean;
  enableCors?: boolean;
  enableSecurityHeaders?: boolean;
}

/**
 * Create a complete security middleware stack
 * @param config - Security configuration
 * @returns Middleware function
 */
export function createSecurityMiddleware(config: SecurityConfig = {}) {
  const { enableRateLimit = true, enableCors = true, enableSecurityHeaders = true } = config;

  // Create individual middlewares
  const rateLimitMiddleware = enableRateLimit
    ? createRateLimitMiddleware(DEFAULT_RATE_LIMITS.api)
    : null;

  const corsMiddleware = enableCors ? createCorsMiddleware(DEFAULT_CORS_OPTIONS) : null;

  return async (request: Request): Promise<Response | null> => {
    // Apply CORS middleware
    if (corsMiddleware) {
      const corsResponse = await corsMiddleware(request);
      if (corsResponse) {
        return corsResponse;
      }
    }

    // Apply rate limiting
    if (rateLimitMiddleware) {
      const rateLimitResponse = await rateLimitMiddleware(request);
      if (rateLimitResponse) {
        // Apply security headers to rate limit response
        return enableSecurityHeaders ? applySecurityHeaders(rateLimitResponse) : rateLimitResponse;
      }
    }

    // All checks passed, return null to continue
    return null;
  };
}

/**
 * Validate and sanitize chat message
 * @param message - Raw message from user
 * @returns Validation result with sanitized message
 */
export { validateMessage };

/**
 * Security utilities
 */
export const SecurityUtils = {
  validateMessage,
  applySecurityHeaders,
  createSecurityMiddleware,
};
