/**
 * Caching Layer for Live Data
 * Provides intelligent caching with TTL, invalidation, and fallback strategies
 */

import type { CacheEntry, CacheStats } from '../types';

export interface CacheManagerOptions {
  defaultTTL?: number;
  maxCacheSize?: number;
}

export class CacheManager {
  private storage: KVNamespace | Map<string, CacheEntry>;
  private defaultTTL: number;
  private maxCacheSize: number;
  private cacheHits: number;
  private cacheMisses: number;

  constructor(storage: KVNamespace | Map<string, CacheEntry>, options: CacheManagerOptions = {}) {
    this.storage = storage;
    this.defaultTTL = options.defaultTTL || 300; // 5 minutes in seconds
    this.maxCacheSize = options.maxCacheSize || 1000;
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Get item from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      let cached: CacheEntry<T> | null = null;

      if (this.storage instanceof Map) {
        cached = this.storage.get(key) as CacheEntry<T> | undefined || null;
      } else {
        const data = await this.storage.get(key, 'json');
        cached = data as CacheEntry<T> | null;
      }

      if (!cached) {
        this.cacheMisses++;
        return null;
      }

      // Check if expired
      if (cached.timestamp && Date.now() > cached.timestamp + cached.ttl * 1000) {
        await this.delete(key);
        this.cacheMisses++;
        return null;
      }

      this.cacheHits++;
      cached.hits = (cached.hits || 0) + 1;
      return cached.value;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      this.cacheMisses++;
      return null;
    }
  }

  /**
   * Set item in cache
   */
  async set<T = any>(key: string, data: T, ttl: number | null = null): Promise<void> {
    try {
      const cacheData: CacheEntry<T> = {
        key,
        value: data,
        timestamp: Date.now(),
        ttl: ttl || this.defaultTTL,
        hits: 0,
      };

      if (this.storage instanceof Map) {
        if (this.storage.size >= this.maxCacheSize) {
          await this.evictOldest();
        }
        this.storage.set(key, cacheData as CacheEntry);
      } else {
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
   */
  async delete(key: string): Promise<void> {
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
   */
  async clear(): Promise<void> {
    try {
      if (this.storage instanceof Map) {
        this.storage.clear();
      }
      // Note: KV doesn't have a clear method, would need to delete keys individually
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Evict oldest entry
   */
  private async evictOldest(): Promise<void> {
    if (!(this.storage instanceof Map)) return;

    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.storage.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      await this.delete(oldestKey);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? this.cacheHits / totalRequests : 0;

    let totalEntries = 0;
    let oldestEntry: number | undefined;
    let newestEntry: number | undefined;

    if (this.storage instanceof Map) {
      totalEntries = this.storage.size;
      for (const entry of this.storage.values()) {
        if (!oldestEntry || entry.timestamp < oldestEntry) {
          oldestEntry = entry.timestamp;
        }
        if (!newestEntry || entry.timestamp > newestEntry) {
          newestEntry = entry.timestamp;
        }
      }
    }

    return {
      totalEntries,
      totalHits: this.cacheHits,
      totalMisses: this.cacheMisses,
      hitRate,
      averageResponseTime: 0, // Would need to track this separately
      oldestEntry,
      newestEntry,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
}

/**
 * Cache key generator utility
 */
export class CacheKeyGenerator {
  static forCompanyInfo(): string {
    return 'company:info';
  }

  static forArtists(): string {
    return 'artists:all';
  }

  static forReleases(days: number = 30): string {
    return `releases:recent:${days}`;
  }

  static forEvents(): string {
    return 'events:upcoming';
  }

  static forBlog(limit: number = 5): string {
    return `blog:posts:${limit}`;
  }

  static forTestimonials(): string {
    return 'testimonials:all';
  }

  static custom(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }
}

export default CacheManager;