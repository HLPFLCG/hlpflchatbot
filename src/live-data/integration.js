/**
 * Live Data Integration Module
 * Fetches real-time data from HLPFL.org and other sources
 * Implements caching to reduce API calls and improve performance
 */

export class LiveDataIntegration {
  constructor(env, cache) {
    this.env = env;
    this.cache = cache; // Cloudflare KV or Map for caching
    this.cacheTimeout = 300000; // 5 minutes in milliseconds
    this.apiBaseUrl = env.HLPFL_API_URL || 'https://hlpfl.org/api';
  }

  /**
   * Fetch data from HLPFL.org API with caching
   * @param {string} endpoint - API endpoint to fetch from
   * @param {object} options - Fetch options
   * @returns {Promise<object>} - API response data
   */
  async fetchFromHLPFLOrg(endpoint, options = {}) {
    const cacheKey = `hlpfl_org_${endpoint}`;
    
    try {
      // Check cache first
      const cached = await this.getFromCache(cacheKey);
      if (cached && !options.skipCache) {
        console.log(`Cache hit for ${endpoint}`);
        return cached;
      }
      
      // Fetch fresh data
      console.log(`Fetching fresh data from ${endpoint}`);
      const url = `${this.apiBaseUrl}/${endpoint}`;
      
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Authorization': this.env.HLPFL_API_KEY ? `Bearer ${this.env.HLPFL_API_KEY}` : undefined,
          'Content-Type': 'application/json',
          'User-Agent': 'HLPFL-Chatbot/2.0',
          ...options.headers
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      await this.saveToCache(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      
      // Try to return cached data as fallback
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        console.log(`Using stale cache for ${endpoint} due to error`);
        return cached;
      }
      
      // Return fallback data
      return this.getFallbackData(endpoint);
    }
  }

  /**
   * Get company statistics (artists, releases, streams, etc.)
   * @returns {Promise<object>} - Company stats
   */
  async getCompanyStats() {
    try {
      const stats = await this.fetchFromHLPFLOrg('stats/overview');
      return {
        artists: stats.total_artists || '50+',
        releases: stats.total_releases || '200+',
        streams: stats.total_streams || '1B+',
        years: stats.years_in_business || '15+',
        awards: stats.industry_awards || '30+',
        team_members: stats.team_size || '50+',
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching company stats:', error);
      return this.getDefaultCompanyStats();
    }
  }

  /**
   * Get current artist roster
   * @returns {Promise<array>} - List of artists
   */
  async getArtistRoster() {
    try {
      const artists = await this.fetchFromHLPFLOrg('artists');
      return artists.map(artist => ({
        name: artist.name,
        genre: artist.genre,
        bio: artist.bio,
        image: artist.image_url,
        spotifyUrl: artist.spotify_url,
        instagramUrl: artist.instagram_url,
        status: artist.status || 'active',
        joinedDate: artist.joined_date
      }));
    } catch (error) {
      console.error('Error fetching artist roster:', error);
      return [];
    }
  }

  /**
   * Get recent releases (last 30 days)
   * @param {number} days - Number of days to look back
   * @returns {Promise<array>} - List of recent releases
   */
  async getRecentReleases(days = 30) {
    try {
      const releases = await this.fetchFromHLPFLOrg(`releases/recent?days=${days}`);
      return releases.map(release => ({
        title: release.title,
        artist: release.artist_name,
        releaseDate: release.release_date,
        type: release.type, // single, EP, album
        coverArt: release.cover_art_url,
        streamingLinks: {
          spotify: release.spotify_url,
          appleMusic: release.apple_music_url,
          youtubeMusic: release.youtube_music_url
        },
        streams: release.total_streams
      }));
    } catch (error) {
      console.error('Error fetching recent releases:', error);
      return [];
    }
  }

  /**
   * Get upcoming events (shows, releases, announcements)
   * @returns {Promise<array>} - List of upcoming events
   */
  async getUpcomingEvents() {
    try {
      const events = await this.fetchFromHLPFLOrg('events/upcoming');
      return events.map(event => ({
        title: event.title,
        type: event.type, // show, release, announcement
        date: event.date,
        location: event.location,
        artist: event.artist_name,
        description: event.description,
        ticketUrl: event.ticket_url,
        imageUrl: event.image_url
      }));
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return [];
    }
  }

  /**
   * Get service availability (studio booking, consultation slots)
   * @param {string} serviceType - Type of service
   * @returns {Promise<object>} - Availability information
   */
  async getServiceAvailability(serviceType) {
    try {
      const availability = await this.fetchFromHLPFLOrg(`services/${serviceType}/availability`);
      return {
        available: availability.is_available,
        nextAvailableSlot: availability.next_available_date,
        bookingUrl: availability.booking_url,
        estimatedWaitTime: availability.estimated_wait_time,
        currentCapacity: availability.current_capacity
      };
    } catch (error) {
      console.error(`Error fetching availability for ${serviceType}:`, error);
      return {
        available: true,
        nextAvailableSlot: 'Contact us for availability',
        bookingUrl: 'https://hlpfl.org/contact',
        estimatedWaitTime: 'Varies',
        currentCapacity: 'Available'
      };
    }
  }

  /**
   * Get latest blog posts
   * @param {number} limit - Number of posts to fetch
   * @returns {Promise<array>} - List of blog posts
   */
  async getBlogPosts(limit = 5) {
    try {
      const posts = await this.fetchFromHLPFLOrg(`blog/posts?limit=${limit}`);
      return posts.map(post => ({
        title: post.title,
        excerpt: post.excerpt,
        author: post.author,
        publishDate: post.publish_date,
        url: post.url,
        imageUrl: post.featured_image_url,
        category: post.category
      }));
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
  }

  /**
   * Get testimonials
   * @param {string} category - Category of testimonials
   * @returns {Promise<array>} - List of testimonials
   */
  async getTestimonials(category = null) {
    try {
      const endpoint = category 
        ? `testimonials?category=${category}` 
        : 'testimonials';
      const testimonials = await this.fetchFromHLPFLOrg(endpoint);
      return testimonials.map(testimonial => ({
        name: testimonial.artist_name,
        quote: testimonial.quote,
        service: testimonial.service,
        rating: testimonial.rating,
        date: testimonial.date,
        imageUrl: testimonial.artist_image_url
      }));
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  }

  /**
   * Get team members
   * @returns {Promise<array>} - List of team members
   */
  async getTeamMembers() {
    try {
      const team = await this.fetchFromHLPFLOrg('team');
      return team.map(member => ({
        name: member.name,
        role: member.role,
        bio: member.bio,
        imageUrl: member.image_url,
        email: member.email,
        availability: member.is_available
      }));
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  }

  /**
   * Get service pricing
   * @param {string} serviceType - Type of service
   * @returns {Promise<object>} - Pricing information
   */
  async getServicePricing(serviceType) {
    try {
      const pricing = await this.fetchFromHLPFLOrg(`services/${serviceType}/pricing`);
      return {
        basePrice: pricing.base_price,
        currency: pricing.currency || 'USD',
        packages: pricing.packages || [],
        customQuote: pricing.custom_quote_available,
        discounts: pricing.current_discounts || []
      };
    } catch (error) {
      console.error(`Error fetching pricing for ${serviceType}:`, error);
      return {
        basePrice: 'Contact for quote',
        currency: 'USD',
        packages: [],
        customQuote: true,
        discounts: []
      };
    }
  }

  /**
   * Cache management methods
   */
  async getFromCache(key) {
    if (this.cache instanceof Map) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
      return null;
    }
    
    // Cloudflare KV
    try {
      const cached = await this.cache.get(key, 'json');
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
    return null;
  }

  async saveToCache(key, data) {
    const cacheData = {
      data: data,
      timestamp: Date.now()
    };
    
    if (this.cache instanceof Map) {
      this.cache.set(key, cacheData);
      return;
    }
    
    // Cloudflare KV
    try {
      await this.cache.put(key, JSON.stringify(cacheData), {
        expirationTtl: Math.floor(this.cacheTimeout / 1000)
      });
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  /**
   * Fallback data methods
   */
  getDefaultCompanyStats() {
    return {
      artists: '50+',
      releases: '200+',
      streams: '1B+',
      years: '15+',
      awards: '30+',
      team_members: '50+',
      lastUpdated: new Date().toISOString()
    };
  }

  getFallbackData(endpoint) {
    const fallbacks = {
      'stats/overview': this.getDefaultCompanyStats(),
      'artists': [],
      'releases/recent': [],
      'events/upcoming': [],
      'blog/posts': [],
      'testimonials': [],
      'team': []
    };
    
    return fallbacks[endpoint] || null;
  }

  /**
   * Health check method
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`, {
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export default LiveDataIntegration;