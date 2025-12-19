/**
 * Input Sanitization and Validation
 * Protects against XSS, injection attacks, and malicious input
 */

export interface SanitizationOptions {
  maxLength?: number;
  allowHtml?: boolean;
  stripScripts?: boolean;
  allowedTags?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  errors: string[];
}

/**
 * Sanitize user input to prevent XSS attacks
 * @param input - Raw user input
 * @param options - Sanitization options
 * @returns Sanitized string
 */
export function sanitizeInput(input: string, options: SanitizationOptions = {}): string {
  const { maxLength = 2000, allowHtml = false, stripScripts = true } = options;

  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Trim whitespace
  sanitized = sanitized.trim();

  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // If HTML is not allowed, escape all HTML entities
  if (!allowHtml) {
    sanitized = escapeHtml(sanitized);
  } else if (stripScripts) {
    // Remove script tags and event handlers
    sanitized = removeScripts(sanitized);
  }

  // Remove potentially dangerous Unicode characters
  sanitized = removeDangerousUnicode(sanitized);

  return sanitized;
}

/**
 * Escape HTML entities to prevent XSS
 * @param text - Text to escape
 * @returns Escaped text
 */
export function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Remove script tags and event handlers
 * @param html - HTML string
 * @returns HTML without scripts
 */
export function removeScripts(html: string): string {
  // Remove script tags
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (onclick, onerror, etc.)
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol
  cleaned = cleaned.replace(/javascript:/gi, '');

  // Remove data: protocol (can be used for XSS)
  cleaned = cleaned.replace(/data:text\/html/gi, '');

  return cleaned;
}

/**
 * Remove dangerous Unicode characters
 * @param text - Text to clean
 * @returns Cleaned text
 */
export function removeDangerousUnicode(text: string): string {
  // Remove zero-width characters that can be used for obfuscation
  let cleaned = text.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Remove right-to-left override characters
  cleaned = cleaned.replace(/[\u202A-\u202E]/g, '');

  return cleaned;
}

/**
 * Validate and sanitize user message
 * @param message - User message
 * @returns Validation result
 */
export function validateMessage(message: string): ValidationResult {
  const errors: string[] = [];

  // Check if message exists
  if (!message || typeof message !== 'string') {
    errors.push('Message is required');
    return { isValid: false, sanitized: '', errors };
  }

  // Check minimum length
  if (message.trim().length < 1) {
    errors.push('Message cannot be empty');
    return { isValid: false, sanitized: '', errors };
  }

  // Check maximum length
  if (message.length > 2000) {
    errors.push('Message is too long (maximum 2000 characters)');
  }

  // Sanitize the message
  const sanitized = sanitizeInput(message, {
    maxLength: 2000,
    allowHtml: false,
    stripScripts: true,
  });

  // Check for suspicious patterns
  if (containsSuspiciousPatterns(message)) {
    errors.push('Message contains suspicious content');
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors,
  };
}

/**
 * Check for suspicious patterns that might indicate an attack
 * @param text - Text to check
 * @returns True if suspicious patterns found
 */
export function containsSuspiciousPatterns(text: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<embed/i,
    /<object/i,
    /eval\(/i,
    /expression\(/i,
    /vbscript:/i,
    /data:text\/html/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(text));
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * @param url - URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  if (dangerousProtocols.some((protocol) => trimmed.startsWith(protocol))) {
    return '';
  }

  // Only allow http, https, and relative URLs
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('/') &&
    !trimmed.startsWith('./')
  ) {
    return '';
  }

  return url.trim();
}

/**
 * Sanitize object by sanitizing all string values
 * @param obj - Object to sanitize
 * @param options - Sanitization options
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  options: SanitizationOptions = {}
): T {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value, options);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeInput(item, options) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, options);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 * @param phone - Phone number to validate
 * @returns True if valid phone format
 */
export function isValidPhone(phone: string): boolean {
  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-().]/g, '');
  // Check if it's 10-15 digits (international format)
  return /^\+?\d{10,15}$/.test(cleaned);
}
