/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * Controls which domains can access the API
 */

export interface CorsOptions {
  allowedOrigins: string[] | '*';
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders?: string[];
  maxAge?: number;
  credentials?: boolean;
}

/**
 * Default CORS configuration
 */
export const DEFAULT_CORS_OPTIONS: CorsOptions = {
  allowedOrigins: [
    'https://hlpfl.org',
    'https://www.hlpfl.org',
    'https://hlpfl.io',
    'https://www.hlpfl.io',
    'http://localhost:3000',
    'http://localhost:8080'
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  maxAge: 86400, // 24 hours
  credentials: true
};

/**
 * Check if origin is allowed
 * @param origin - Request origin
 * @param allowedOrigins - List of allowed origins or '*'
 * @returns True if origin is allowed
 */
export function isOriginAllowed(
  origin: string | null,
  allowedOrigins: string[] | '*'
): boolean {
  if (!origin) return false;
  if (allowedOrigins === '*') return true;
  
  return allowedOrigins.some(allowed => {
    // Exact match
    if (allowed === origin) return true;
    
    // Wildcard subdomain match (e.g., *.hlpfl.org)
    if (allowed.startsWith('*.')) {
      const domain = allowed.substring(2);
      return origin.endsWith(domain);
    }
    
    return false;
  });
}

/**
 * Get CORS headers for a request
 * @param request - Request object
 * @param options - CORS options
 * @returns CORS headers object
 */
export function getCorsHeaders(
  request: Request,
  options: CorsOptions = DEFAULT_CORS_OPTIONS
): Record<string, string> {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = {};

  // Check if origin is allowed
  if (origin && isOriginAllowed(origin, options.allowedOrigins)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else if (options.allowedOrigins === '*') {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  // Add credentials header if enabled
  if (options.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  // Add exposed headers
  if (options.exposedHeaders && options.exposedHeaders.length > 0) {
    headers['Access-Control-Expose-Headers'] = options.exposedHeaders.join(', ');
  }

  // Add Vary header to indicate response varies by Origin
  headers['Vary'] = 'Origin';

  return headers;
}

/**
 * Get CORS headers for preflight request
 * @param request - Request object
 * @param options - CORS options
 * @returns CORS headers object
 */
export function getPreflightHeaders(
  request: Request,
  options: CorsOptions = DEFAULT_CORS_OPTIONS
): Record<string, string> {
  const headers = getCorsHeaders(request, options);

  // Add allowed methods
  headers['Access-Control-Allow-Methods'] = options.allowedMethods.join(', ');

  // Add allowed headers
  headers['Access-Control-Allow-Headers'] = options.allowedHeaders.join(', ');

  // Add max age
  if (options.maxAge) {
    headers['Access-Control-Max-Age'] = options.maxAge.toString();
  }

  return headers;
}

/**
 * Handle CORS preflight request
 * @param request - Request object
 * @param options - CORS options
 * @returns Response for preflight request
 */
export function handlePreflight(
  request: Request,
  options: CorsOptions = DEFAULT_CORS_OPTIONS
): Response {
  const headers = getPreflightHeaders(request, options);

  return new Response(null, {
    status: 204,
    headers
  });
}

/**
 * Apply CORS headers to a response
 * @param response - Response object
 * @param request - Request object
 * @param options - CORS options
 * @returns Response with CORS headers
 */
export function applyCorsHeaders(
  response: Response,
  request: Request,
  options: CorsOptions = DEFAULT_CORS_OPTIONS
): Response {
  const corsHeaders = getCorsHeaders(request, options);
  const newResponse = new Response(response.body, response);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });

  return newResponse;
}

/**
 * CORS middleware for Cloudflare Workers
 * @param options - CORS options
 * @returns Middleware function
 */
export function createCorsMiddleware(options: CorsOptions = DEFAULT_CORS_OPTIONS) {
  return async (request: Request): Promise<Response | null> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return handlePreflight(request, options);
    }

    // Check if origin is allowed for non-preflight requests
    const origin = request.headers.get('Origin');
    if (origin && !isOriginAllowed(origin, options.allowedOrigins)) {
      return new Response(
        JSON.stringify({
          error: 'Forbidden',
          message: 'Origin not allowed'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Request is allowed, return null to continue
    return null;
  };
}

/**
 * Validate CORS configuration
 * @param options - CORS options to validate
 * @returns Validation errors or empty array if valid
 */
export function validateCorsOptions(options: CorsOptions): string[] {
  const errors: string[] = [];

  // Check allowed origins
  if (options.allowedOrigins !== '*' && !Array.isArray(options.allowedOrigins)) {
    errors.push('allowedOrigins must be an array or "*"');
  }

  if (Array.isArray(options.allowedOrigins) && options.allowedOrigins.length === 0) {
    errors.push('allowedOrigins array cannot be empty');
  }

  // Check allowed methods
  if (!Array.isArray(options.allowedMethods) || options.allowedMethods.length === 0) {
    errors.push('allowedMethods must be a non-empty array');
  }

  // Check allowed headers
  if (!Array.isArray(options.allowedHeaders) || options.allowedHeaders.length === 0) {
    errors.push('allowedHeaders must be a non-empty array');
  }

  // Check max age
  if (options.maxAge !== undefined && (typeof options.maxAge !== 'number' || options.maxAge < 0)) {
    errors.push('maxAge must be a positive number');
  }

  return errors;
}