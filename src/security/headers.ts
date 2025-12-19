/**
 * Security Headers Configuration
 * Implements comprehensive security headers per OWASP recommendations
 */

export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'Strict-Transport-Security': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'X-XSS-Protection': string;
}

/**
 * Get security headers for all responses
 * @returns Object containing all security headers
 */
export function getSecurityHeaders(): SecurityHeaders {
  return {
    // Content Security Policy - Prevents XSS attacks
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.openai.com https://hlpfl.io https://*.hlpfl.io",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; '),

    // Prevents clickjacking attacks
    'X-Frame-Options': 'DENY',

    // Prevents MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Enforces HTTPS for 2 years with preload
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

    // Controls referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Controls browser features and APIs
    'Permissions-Policy': [
      'accelerometer=()',
      'camera=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'payment=()',
      'usb=()'
    ].join(', '),

    // Legacy XSS protection (for older browsers)
    'X-XSS-Protection': '1; mode=block'
  };
}

/**
 * Apply security headers to a Response object
 * @param response - The Response object to add headers to
 * @returns Response with security headers applied
 */
export function applySecurityHeaders(response: Response): Response {
  const headers = getSecurityHeaders();
  const newResponse = new Response(response.body, response);
  
  Object.entries(headers).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  
  return newResponse;
}

/**
 * Create a secure Response with all security headers
 * @param body - Response body
 * @param init - Response initialization options
 * @returns Response with security headers
 */
export function createSecureResponse(
  body: BodyInit | null,
  init?: ResponseInit
): Response {
  const response = new Response(body, init);
  return applySecurityHeaders(response);
}

/**
 * Create a secure JSON Response with all security headers
 * @param data - Data to serialize as JSON
 * @param status - HTTP status code
 * @returns Response with JSON body and security headers
 */
export function createSecureJsonResponse(
  data: any,
  status: number = 200
): Response {
  const response = new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return applySecurityHeaders(response);
}