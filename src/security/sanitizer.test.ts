/**
 * Unit Tests for Input Sanitization
 * Tests XSS prevention, input validation, and sanitization
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  escapeHtml,
  removeScripts,
  validateMessage,
  containsSuspiciousPatterns,
  sanitizeUrl,
  isValidEmail,
  isValidPhone,
} from './sanitizer';

describe('sanitizeInput', () => {
  it('should trim whitespace', () => {
    const result = sanitizeInput('  hello world  ');
    expect(result).toBe('hello world');
  });

  it('should enforce max length', () => {
    const longText = 'a'.repeat(3000);
    const result = sanitizeInput(longText, { maxLength: 2000 });
    expect(result.length).toBe(2000);
  });

  it('should remove null bytes', () => {
    const result = sanitizeInput('hello\0world');
    expect(result).not.toContain('\0');
  });

  it('should escape HTML by default', () => {
    const result = sanitizeInput('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('should handle empty input', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput(null as any)).toBe('');
    expect(sanitizeInput(undefined as any)).toBe('');
  });
});

describe('escapeHtml', () => {
  it('should escape HTML entities', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
    expect(escapeHtml('&')).toBe('&amp;');
    expect(escapeHtml('"')).toBe('&quot;');
    expect(escapeHtml("'")).toBe('&#x27;');
    expect(escapeHtml('/')).toBe('&#x2F;');
  });

  it('should escape multiple entities', () => {
    const result = escapeHtml('<div class="test">Hello & goodbye</div>');
    expect(result).toBe('&lt;div class=&quot;test&quot;&gt;Hello &amp; goodbye&lt;&#x2F;div&gt;');
  });
});

describe('removeScripts', () => {
  it('should remove script tags', () => {
    const html = '<div>Safe</div><script>alert("xss")</script><p>More safe</p>';
    const result = removeScripts(html);
    expect(result).not.toContain('<script>');
    expect(result).toContain('<div>Safe</div>');
  });

  it('should remove event handlers', () => {
    const html = '<div onclick="alert(\'xss\')">Click me</div>';
    const result = removeScripts(html);
    expect(result).not.toContain('onclick');
  });

  it('should remove javascript: protocol', () => {
    const html = '<a href="javascript:alert(\'xss\')">Link</a>';
    const result = removeScripts(html);
    expect(result).not.toContain('javascript:');
  });

  it('should remove data:text/html protocol', () => {
    const html = '<iframe src="data:text/html,<script>alert(\'xss\')</script>"></iframe>';
    const result = removeScripts(html);
    expect(result).not.toContain('data:text/html');
  });
});

describe('validateMessage', () => {
  it('should validate valid message', () => {
    const result = validateMessage('Hello, I need help with my music career');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.sanitized).toBe('Hello, I need help with my music career');
  });

  it('should reject empty message', () => {
    const result = validateMessage('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Message is required');
  });

  it('should reject whitespace-only message', () => {
    const result = validateMessage('   ');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Message cannot be empty');
  });

  it('should reject too long message', () => {
    const longMessage = 'a'.repeat(2001);
    const result = validateMessage(longMessage);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Message is too long (maximum 2000 characters)');
  });

  it('should sanitize XSS attempts', () => {
    const result = validateMessage('<script>alert("xss")</script>');
    expect(result.sanitized).not.toContain('<script>');
    expect(result.sanitized).toContain('&lt;script&gt;');
  });

  it('should detect suspicious patterns', () => {
    const result = validateMessage('<script>alert("xss")</script>');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Message contains suspicious content');
  });
});

describe('containsSuspiciousPatterns', () => {
  it('should detect script tags', () => {
    expect(containsSuspiciousPatterns('<script>')).toBe(true);
    expect(containsSuspiciousPatterns('<SCRIPT>')).toBe(true);
  });

  it('should detect javascript: protocol', () => {
    expect(containsSuspiciousPatterns('javascript:alert(1)')).toBe(true);
  });

  it('should detect event handlers', () => {
    expect(containsSuspiciousPatterns('onclick=')).toBe(true);
    expect(containsSuspiciousPatterns('onerror=')).toBe(true);
  });

  it('should detect iframe tags', () => {
    expect(containsSuspiciousPatterns('<iframe')).toBe(true);
  });

  it('should detect eval', () => {
    expect(containsSuspiciousPatterns('eval(')).toBe(true);
  });

  it('should not flag normal text', () => {
    expect(containsSuspiciousPatterns('Hello, I need help')).toBe(false);
  });
});

describe('sanitizeUrl', () => {
  it('should allow valid HTTP URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('should allow valid HTTPS URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('should allow relative URLs', () => {
    expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
    expect(sanitizeUrl('./relative')).toBe('./relative');
  });

  it('should block javascript: protocol', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
  });

  it('should block data: protocol', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
  });

  it('should block vbscript: protocol', () => {
    expect(sanitizeUrl('vbscript:alert(1)')).toBe('');
  });

  it('should block file: protocol', () => {
    expect(sanitizeUrl('file:///etc/passwd')).toBe('');
  });

  it('should handle empty input', () => {
    expect(sanitizeUrl('')).toBe('');
    expect(sanitizeUrl(null as any)).toBe('');
  });
});

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('invalid@domain')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('should validate correct phone numbers', () => {
    expect(isValidPhone('1234567890')).toBe(true);
    expect(isValidPhone('+1234567890')).toBe(true);
    expect(isValidPhone('123-456-7890')).toBe(true);
    expect(isValidPhone('(123) 456-7890')).toBe(true);
    expect(isValidPhone('+1 (123) 456-7890')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('abcdefghij')).toBe(false);
    expect(isValidPhone('')).toBe(false);
  });
});
