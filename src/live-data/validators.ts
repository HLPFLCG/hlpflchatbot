/**
 * Data Validators
 * Validates and sanitizes data from external sources
 */

export class DataValidator {
  /**
   * Validate company info
   */
  static validateCompanyInfo(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    return !!(data.name && data.tagline && data.founded);
  }

  /**
   * Validate artist data
   */
  static validateArtist(artist: any): boolean {
    if (!artist || typeof artist !== 'object') return false;
    return !!(artist.id && artist.name && artist.genre);
  }

  /**
   * Validate release data
   */
  static validateRelease(release: any): boolean {
    if (!release || typeof release !== 'object') return false;
    return !!(release.id && release.title && release.artist && release.releaseDate);
  }

  /**
   * Validate event data
   */
  static validateEvent(event: any): boolean {
    if (!event || typeof event !== 'object') return false;
    return !!(event.id && event.title && event.date && event.location);
  }

  /**
   * Validate blog post
   */
  static validateBlogPost(post: any): boolean {
    if (!post || typeof post !== 'object') return false;
    return !!(post.id && post.title && post.content && post.publishDate);
  }

  /**
   * Validate testimonial
   */
  static validateTestimonial(testimonial: any): boolean {
    if (!testimonial || typeof testimonial !== 'object') return false;
    return !!(testimonial.id && testimonial.author && testimonial.content);
  }

  /**
   * Sanitize string
   */
  static sanitizeString(str: any): string {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
  }

  /**
   * Validate URL
   */
  static isValidUrl(url: any): boolean {
    if (typeof url !== 'string') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate email
   */
  static isValidEmail(email: any): boolean {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate date
   */
  static isValidDate(date: any): boolean {
    if (!date) return false;
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }

  /**
   * Sanitize array
   */
  static sanitizeArray<T>(arr: any, validator: (item: any) => boolean): T[] {
    if (!Array.isArray(arr)) return [];
    return arr.filter(validator) as T[];
  }
}

export default DataValidator;