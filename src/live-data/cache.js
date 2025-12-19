/**
 * Caching Layer for Live Data
 * Provides intelligent caching with TTL, invalidation, and fallback strategies
 */

export class CacheManager {
  constructor(storage, options = {}) {
    this.storage = storage; // Cloudflare KV or Map
    this.defaultTTL = options.defaultTTL || 300; // 5 minutes in seconds
    this.maxCacheSize = options.maxCacheSize || 1000; // Max items in memory cache
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Get item from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Cached data or null
   */
  async get(key) {
    try {
      let cached;

      if (this.storage instanceof Map) {
        cached = this.storage.get(key);
      } else {
        // Cloudflare KV
        const data = await this.storage.get(key, 'json');
        cached = data;
      }

      if (!cached) {
        this.cacheMisses++;
        return null;
      }

      // Check if expired
      if (cached.expiresAt && Date.now() > cached.expiresAt) {
        await this.delete(key);
        this.cacheMisses++;
        return null;
      }

      this.cacheHits++;
      return cached.data;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      this.cacheMisses++;
      return null;
    }
  }

  /**
   * Set item in cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<void>}
   */
  async set(key, data, ttl = null) {
    try {
      const expiresAt = Date.now() + (ttl || this.defaultTTL) * 1000;
      const cacheData = {
        data: data,
        cachedAt: Date.now(),
        expiresAt: expiresAt,
      };

      if (this.storage instanceof Map) {
        // Memory cache - check size limit
        if (this.storage.size >= this.maxCacheSize) {
          await this.evictOldest();
        }
        this.storage.set(key, cacheData);
      } else {
        // Cloudflare KV
        await this.storage.put(key, JSON.stringify(cacheData), {
          expirationTtl: ttl || this.defaultTTL,
        });
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete item from cache
   * @param {string} key - Cache key
   * @returns {Promise<void>}
   */
  async delete(key) {
    try {
      if (this.storage instanceof Map) {
        this.storage.delete(key);
      } else {
        await this.storage.delete(key);
      }
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Clear all cache
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      if (this.storage instanceof Map) {
        this.storage.clear();
      } else {
        // For KV, we'd need to track keys separately
        console.warn('KV cache clear not fully implemented');
      }
      this.cacheHits = 0;
      this.cacheMisses = 0;
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   * @returns {object} - Cache stats
   */
  getStats() {
    const total = this.cacheHits + this.cacheMisses;
    const hitRate = total > 0 ? ((this.cacheHits / total) * 100).toFixed(2) : 0;

    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      total: total,
      hitRate: `${hitRate}%`,
      size: this.storage instanceof Map ? this.storage.size : 'N/A',
    };
  }

  /**
   * Evict oldest cache entry (for memory cache)
   * @returns {Promise<void>}
   */
  async evictOldest() {
    if (!(this.storage instanceof Map)) return;

    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, value] of this.storage.entries()) {
      if (value.cachedAt < oldestTime) {
        oldestTime = value.cachedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      await this.delete(oldestKey);
    }
  }

  /**
   * Get or set pattern - fetch from cache or compute
   * @param {string} key - Cache key
   * @param {function} fetchFn - Function to fetch data if not cached
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} - Cached or fresh data
   */
  async getOrSet(key, fetchFn, ttl = null) {
    // Try to get from cache
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    try {
      const data = await fetchFn();
      await this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error(`Error in getOrSet for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Invalidate cache by pattern
   * @param {string} pattern - Pattern to match keys
   * @returns {Promise<number>} - Number of keys invalidated
   */
  async invalidatePattern(pattern) {
    if (!(this.storage instanceof Map)) {
      console.warn('Pattern invalidation only supported for Map storage');
      return 0;
    }

    let count = 0;
    const regex = new RegExp(pattern);

    for (const key of this.storage.keys()) {
      if (regex.test(key)) {
        await this.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Warm up cache with predefined data
   * @param {object} data - Key-value pairs to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<void>}
   */
  async warmUp(data, ttl = null) {
    const promises = Object.entries(data).map(([key, value]) => this.set(key, value, ttl));
    await Promise.all(promises);
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  async has(key) {
    const data = await this.get(key);
    return data !== null;
  }

  /**
   * Get multiple keys at once
   * @param {array} keys - Array of cache keys
   * @returns {Promise<object>} - Object with key-value pairs
   */
  async getMultiple(keys) {
    const results = {};
    const promises = keys.map(async (key) => {
      results[key] = await this.get(key);
    });
    await Promise.all(promises);
    return results;
  }

  /**
   * Set multiple keys at once
   * @param {object} data - Key-value pairs to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<void>}
   */
  async setMultiple(data, ttl = null) {
    const promises = Object.entries(data).map(([key, value]) => this.set(key, value, ttl));
    await Promise.all(promises);
  }
}

/**
 * Cache key generator utility
 */
export class CacheKeyGenerator {
  static forCompanyStats() {
    return 'hlpfl:stats:company';
  }

  static forArtistRoster() {
    return 'hlpfl:artists:roster';
  }

  static forRecentReleases(days = 30) {
    return `hlpfl:releases:recent:${days}`;
  }

  static forUpcomingEvents() {
    return 'hlpfl:events:upcoming';
  }

  static forServiceAvailability(serviceType) {
    return `hlpfl:service:${serviceType}:availability`;
  }

  static forBlogPosts(limit = 5) {
    return `hlpfl:blog:posts:${limit}`;
  }

  static forTestimonials(category = null) {
    return category ? `hlpfl:testimonials:${category}` : 'hlpfl:testimonials:all';
  }

  static forTeamMembers() {
    return 'hlpfl:team:members';
  }

  static forServicePricing(serviceType) {
    return `hlpfl:service:${serviceType}:pricing`;
  }

  static forConversation(sessionId) {
    return `conversation:${sessionId}`;
  }

  static forUserProfile(sessionId) {
    return `user:profile:${sessionId}`;
  }
}

export default CacheManager;
