/**
 * Data Validation Utilities
 * Validates data from external APIs to ensure consistency and safety
 */

export class DataValidator {
  /**
   * Validate company stats object
   * @param {object} stats - Stats object to validate
   * @returns {object} - Validated and sanitized stats
   */
  static validateCompanyStats(stats) {
    return {
      artists: this.sanitizeString(stats.artists) || '50+',
      releases: this.sanitizeString(stats.releases) || '200+',
      streams: this.sanitizeString(stats.streams) || '1B+',
      years: this.sanitizeString(stats.years) || '15+',
      awards: this.sanitizeString(stats.awards) || '30+',
      team_members: this.sanitizeString(stats.team_members) || '50+',
      lastUpdated: this.validateDate(stats.lastUpdated) || new Date().toISOString()
    };
  }

  /**
   * Validate artist object
   * @param {object} artist - Artist object to validate
   * @returns {object} - Validated artist
   */
  static validateArtist(artist) {
    if (!artist.name) {
      throw new Error('Artist name is required');
    }

    return {
      name: this.sanitizeString(artist.name),
      genre: this.sanitizeString(artist.genre) || 'Unknown',
      bio: this.sanitizeString(artist.bio, 500) || '',
      image: this.validateUrl(artist.image) || null,
      spotifyUrl: this.validateUrl(artist.spotifyUrl) || null,
      instagramUrl: this.validateUrl(artist.instagramUrl) || null,
      status: this.validateEnum(artist.status, ['active', 'inactive', 'upcoming']) || 'active',
      joinedDate: this.validateDate(artist.joinedDate) || null
    };
  }

  /**
   * Validate release object
   * @param {object} release - Release object to validate
   * @returns {object} - Validated release
   */
  static validateRelease(release) {
    if (!release.title || !release.artist) {
      throw new Error('Release title and artist are required');
    }

    return {
      title: this.sanitizeString(release.title),
      artist: this.sanitizeString(release.artist),
      releaseDate: this.validateDate(release.releaseDate) || new Date().toISOString(),
      type: this.validateEnum(release.type, ['single', 'EP', 'album', 'compilation']) || 'single',
      coverArt: this.validateUrl(release.coverArt) || null,
      streamingLinks: {
        spotify: this.validateUrl(release.streamingLinks?.spotify) || null,
        appleMusic: this.validateUrl(release.streamingLinks?.appleMusic) || null,
        youtubeMusic: this.validateUrl(release.streamingLinks?.youtubeMusic) || null
      },
      streams: this.validateNumber(release.streams, 0) || 0
    };
  }

  /**
   * Validate event object
   * @param {object} event - Event object to validate
   * @returns {object} - Validated event
   */
  static validateEvent(event) {
    if (!event.title || !event.date) {
      throw new Error('Event title and date are required');
    }

    return {
      title: this.sanitizeString(event.title),
      type: this.validateEnum(event.type, ['show', 'release', 'announcement', 'other']) || 'other',
      date: this.validateDate(event.date),
      location: this.sanitizeString(event.location) || 'TBA',
      artist: this.sanitizeString(event.artist) || null,
      description: this.sanitizeString(event.description, 500) || '',
      ticketUrl: this.validateUrl(event.ticketUrl) || null,
      imageUrl: this.validateUrl(event.imageUrl) || null
    };
  }

  /**
   * Validate blog post object
   * @param {object} post - Blog post object to validate
   * @returns {object} - Validated post
   */
  static validateBlogPost(post) {
    if (!post.title || !post.url) {
      throw new Error('Blog post title and URL are required');
    }

    return {
      title: this.sanitizeString(post.title),
      excerpt: this.sanitizeString(post.excerpt, 300) || '',
      author: this.sanitizeString(post.author) || 'HLPFL Team',
      publishDate: this.validateDate(post.publishDate) || new Date().toISOString(),
      url: this.validateUrl(post.url),
      imageUrl: this.validateUrl(post.imageUrl) || null,
      category: this.sanitizeString(post.category) || 'General'
    };
  }

  /**
   * Validate testimonial object
   * @param {object} testimonial - Testimonial object to validate
   * @returns {object} - Validated testimonial
   */
  static validateTestimonial(testimonial) {
    if (!testimonial.name || !testimonial.quote) {
      throw new Error('Testimonial name and quote are required');
    }

    return {
      name: this.sanitizeString(testimonial.name),
      quote: this.sanitizeString(testimonial.quote, 500),
      service: this.sanitizeString(testimonial.service) || 'General',
      rating: this.validateNumber(testimonial.rating, 1, 5) || 5,
      date: this.validateDate(testimonial.date) || new Date().toISOString(),
      imageUrl: this.validateUrl(testimonial.imageUrl) || null
    };
  }

  /**
   * Validate service availability object
   * @param {object} availability - Availability object to validate
   * @returns {object} - Validated availability
   */
  static validateServiceAvailability(availability) {
    return {
      available: Boolean(availability.available),
      nextAvailableSlot: this.sanitizeString(availability.nextAvailableSlot) || 'Contact us',
      bookingUrl: this.validateUrl(availability.bookingUrl) || 'https://hlpfl.org/contact',
      estimatedWaitTime: this.sanitizeString(availability.estimatedWaitTime) || 'Varies',
      currentCapacity: this.sanitizeString(availability.currentCapacity) || 'Available'
    };
  }

  /**
   * Validate pricing object
   * @param {object} pricing - Pricing object to validate
   * @returns {object} - Validated pricing
   */
  static validatePricing(pricing) {
    return {
      basePrice: this.sanitizeString(pricing.basePrice) || 'Contact for quote',
      currency: this.validateEnum(pricing.currency, ['USD', 'EUR', 'GBP']) || 'USD',
      packages: Array.isArray(pricing.packages) ? pricing.packages.map(pkg => ({
        name: this.sanitizeString(pkg.name),
        price: this.sanitizeString(pkg.price),
        features: Array.isArray(pkg.features) ? pkg.features.map(f => this.sanitizeString(f)) : []
      })) : [],
      customQuote: Boolean(pricing.customQuote),
      discounts: Array.isArray(pricing.discounts) ? pricing.discounts.map(d => ({
        name: this.sanitizeString(d.name),
        amount: this.sanitizeString(d.amount),
        validUntil: this.validateDate(d.validUntil) || null
      })) : []
    };
  }

  /**
   * Sanitize string - remove HTML, trim, limit length
   * @param {string} str - String to sanitize
   * @param {number} maxLength - Maximum length
   * @returns {string} - Sanitized string
   */
  static sanitizeString(str, maxLength = null) {
    if (typeof str !== 'string') return '';
    
    // Remove HTML tags
    let sanitized = str.replace(/<[^>]*>/g, '');
    
    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>&quot;']/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Limit length
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength) + '...';
    }
    
    return sanitized;
  }

  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {string|null} - Valid URL or null
   */
  static validateUrl(url) {
    if (!url || typeof url !== 'string') return null;
    
    try {
      const parsed = new URL(url);
      // Only allow http and https protocols
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return null;
      }
      return parsed.toString();
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate date string
   * @param {string} date - Date string to validate
   * @returns {string|null} - Valid ISO date string or null
   */
  static validateDate(date) {
    if (!date) return null;
    
    try {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        return null;
      }
      return parsed.toISOString();
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate number within range
   * @param {number} num - Number to validate
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number|null} - Valid number or null
   */
  static validateNumber(num, min = null, max = null) {
    const parsed = Number(num);
    if (isNaN(parsed)) return null;
    
    if (min !== null && parsed < min) return min;
    if (max !== null && parsed > max) return max;
    
    return parsed;
  }

  /**
   * Validate enum value
   * @param {string} value - Value to validate
   * @param {array} allowedValues - Array of allowed values
   * @returns {string|null} - Valid value or null
   */
  static validateEnum(value, allowedValues) {
    if (!value || typeof value !== 'string') return null;
    
    const normalized = value.toLowerCase();
    const found = allowedValues.find(v => v.toLowerCase() === normalized);
    
    return found || null;
  }

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {string|null} - Valid email or null
   */
  static validateEmail(email) {
    if (!email || typeof email !== 'string') return null;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email.toLowerCase() : null;
  }

  /**
   * Validate phone number
   * @param {string} phone - Phone number to validate
   * @returns {string|null} - Valid phone or null
   */
  static validatePhone(phone) {
    if (!phone || typeof phone !== 'string') return null;
    
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Check if it's a valid length (10-15 digits)
    if (digits.length < 10 || digits.length > 15) return null;
    
    return phone;
  }

  /**
   * Validate array of items with validator function
   * @param {array} items - Array to validate
   * @param {function} validatorFn - Validator function for each item
   * @returns {array} - Array of validated items
   */
  static validateArray(items, validatorFn) {
    if (!Array.isArray(items)) return [];
    
    const validated = [];
    for (const item of items) {
      try {
        const validItem = validatorFn(item);
        if (validItem) {
          validated.push(validItem);
        }
      } catch (error) {
        console.error('Item validation failed:', error);
        // Skip invalid items
      }
    }
    
    return validated;
  }

  /**
   * Validate and sanitize user input message
   * @param {string} message - User message
   * @returns {string} - Sanitized message
   */
  static validateUserMessage(message) {
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message');
    }
    
    // Trim and limit length
    let sanitized = message.trim();
    if (sanitized.length === 0) {
      throw new Error('Message cannot be empty');
    }
    if (sanitized.length > 2000) {
      sanitized = sanitized.substring(0, 2000);
    }
    
    // Remove potentially dangerous content
    sanitized = this.sanitizeString(sanitized);
    
    return sanitized;
  }

  /**
   * Validate session ID
   * @param {string} sessionId - Session ID to validate
   * @returns {string} - Valid session ID
   */
  static validateSessionId(sessionId) {
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('Invalid session ID');
    }
    
    // Session ID should be alphanumeric with optional hyphens/underscores
    const sessionIdRegex = /^[a-zA-Z0-9_-]+$/;
    if (!sessionIdRegex.test(sessionId)) {
      throw new Error('Invalid session ID format');
    }
    
    if (sessionId.length > 100) {
      throw new Error('Session ID too long');
    }
    
    return sessionId;
  }
}

export default DataValidator;