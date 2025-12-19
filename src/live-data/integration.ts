/**
 * Live Data Integration
 * Combines caching, validation, and API client for seamless data access
 */

import { CacheManager, CacheKeyGenerator } from './cache';
import { DataValidator } from './validators';
import { HLPFLApiClient } from './hlpfl-api-client';
import type { Env, Artist, Release, Event, BlogPost, Testimonial, CompanyInfo } from '../types';

export class LiveDataIntegration {
  private cache: CacheManager;
  private apiClient: HLPFLApiClient;

  constructor(_env: Env, cache: CacheManager) {
    this.cache = cache;
    this.apiClient = new HLPFLApiClient();
    // env available for future use (API keys, etc.)
  }

  /**
   * Get company information with caching
   */
  async getCompanyInfo(): Promise<CompanyInfo> {
    const cacheKey = CacheKeyGenerator.forCompanyInfo();
    
    // Try cache first
    const cached = await this.cache.get<CompanyInfo>(cacheKey);
    if (cached && DataValidator.validateCompanyInfo(cached)) {
      return cached;
    }

    // Fetch from API
    const data = await this.apiClient.getCompanyInfo();
    
    // Validate and cache
    if (DataValidator.validateCompanyInfo(data)) {
      await this.cache.set(cacheKey, data, 300); // 5 minutes
      return data;
    }

    throw new Error('Invalid company info data');
  }

  /**
   * Get artists with caching
   */
  async getArtists(): Promise<Artist[]> {
    const cacheKey = CacheKeyGenerator.forArtists();
    
    // Try cache first
    const cached = await this.cache.get<Artist[]>(cacheKey);
    if (cached && Array.isArray(cached)) {
      return cached;
    }

    // Fetch from API
    const data = await this.apiClient.getArtists();
    
    // Validate and cache
    const validated = DataValidator.sanitizeArray<Artist>(data, DataValidator.validateArtist);
    await this.cache.set(cacheKey, validated, 300); // 5 minutes
    
    return validated;
  }

  /**
   * Get recent releases with caching
   */
  async getRecentReleases(days: number = 30): Promise<Release[]> {
    const cacheKey = CacheKeyGenerator.forReleases(days);
    
    // Try cache first
    const cached = await this.cache.get<Release[]>(cacheKey);
    if (cached && Array.isArray(cached)) {
      return cached;
    }

    // Fetch from API
    const data = await this.apiClient.getRecentReleases(days);
    
    // Validate and cache
    const validated = DataValidator.sanitizeArray<Release>(data, DataValidator.validateRelease);
    await this.cache.set(cacheKey, validated, 300); // 5 minutes
    
    return validated;
  }

  /**
   * Get upcoming events with caching
   */
  async getUpcomingEvents(): Promise<Event[]> {
    const cacheKey = CacheKeyGenerator.forEvents();
    
    // Try cache first
    const cached = await this.cache.get<Event[]>(cacheKey);
    if (cached && Array.isArray(cached)) {
      return cached;
    }

    // Fetch from API
    const data = await this.apiClient.getUpcomingEvents();
    
    // Validate and cache
    const validated = DataValidator.sanitizeArray<Event>(data, DataValidator.validateEvent);
    await this.cache.set(cacheKey, validated, 300); // 5 minutes
    
    return validated;
  }

  /**
   * Get blog posts with caching
   */
  async getBlogPosts(limit: number = 5): Promise<BlogPost[]> {
    const cacheKey = CacheKeyGenerator.forBlog(limit);
    
    // Try cache first
    const cached = await this.cache.get<BlogPost[]>(cacheKey);
    if (cached && Array.isArray(cached)) {
      return cached;
    }

    // Fetch from API
    const data = await this.apiClient.getBlogPosts(limit);
    
    // Validate and cache
    const validated = DataValidator.sanitizeArray<BlogPost>(data, DataValidator.validateBlogPost);
    await this.cache.set(cacheKey, validated, 300); // 5 minutes
    
    return validated;
  }

  /**
   * Get testimonials with caching
   */
  async getTestimonials(): Promise<Testimonial[]> {
    const cacheKey = CacheKeyGenerator.forTestimonials();
    
    // Try cache first
    const cached = await this.cache.get<Testimonial[]>(cacheKey);
    if (cached && Array.isArray(cached)) {
      return cached;
    }

    // Fetch from API
    const data = await this.apiClient.getTestimonials();
    
    // Validate and cache
    const validated = DataValidator.sanitizeArray<Testimonial>(data, DataValidator.validateTestimonial);
    await this.cache.set(cacheKey, validated, 300); // 5 minutes
    
    return validated;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    return await this.apiClient.healthCheck();
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    await this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

export default LiveDataIntegration;