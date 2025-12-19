/**
 * HLPFL.org API Client
 * Handles communication with HLPFL.org website
 * Uses web scraping as fallback if no API exists
 */

import { DataValidator } from './validators.js';

export class HLPFLApiClient {
  constructor(env, cache) {
    this.env = env;
    this.cache = cache;
    this.baseUrl = env.HLPFL_ORG_URL || 'https://hlpfl.org';
    this.apiKey = env.HLPFL_API_KEY;
  }

  /**
   * Check if HLPFL.org has an API endpoint
   * @returns {Promise<boolean>}
   */
  async hasApi() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Fetch data from API or fallback to web scraping
   * @param {string} endpoint - API endpoint
   * @returns {Promise<object>}
   */
  async fetchData(endpoint) {
    // Try API first
    if (await this.hasApi()) {
      return await this.fetchFromApi(endpoint);
    }
    
    // Fallback to web scraping
    return await this.fetchFromWebsite(endpoint);
  }

  /**
   * Fetch from API endpoint
   * @param {string} endpoint
   * @returns {Promise<object>}
   */
  async fetchFromApi(endpoint) {
    const url = `${this.baseUrl}/api/${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : undefined,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return await response.json();
  }

  /**
   * Fetch from website using web scraping
   * @param {string} dataType - Type of data to fetch
   * @returns {Promise<object>}
   */
  async fetchFromWebsite(dataType) {
    // For now, return mock data
    // In production, this would use web scraping tools
    return this.getMockData(dataType);
  }

  /**
   * Get mock data for development/testing
   * @param {string} dataType
   * @returns {object}
   */
  getMockData(dataType) {
    const mockData = {
      'stats/overview': {
        total_artists: 52,
        total_releases: 215,
        total_streams: '1.2B',
        years_in_business: 15,
        industry_awards: 34,
        team_size: 48
      },
      
      'artists': [
        {
          name: 'Sarah Johnson',
          genre: 'Pop',
          bio: 'Rising pop star with a unique voice',
          image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
          spotify_url: 'https://open.spotify.com/artist/example1',
          instagram_url: 'https://instagram.com/sarahjohnson',
          status: 'active',
          joined_date: '2022-03-15'
        },
        {
          name: 'The Midnight Collective',
          genre: 'Indie Rock',
          bio: 'Experimental indie rock band from Detroit',
          image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
          spotify_url: 'https://open.spotify.com/artist/example2',
          instagram_url: 'https://instagram.com/midnightcollective',
          status: 'active',
          joined_date: '2021-08-20'
        },
        {
          name: 'Marcus Williams',
          genre: 'Hip Hop',
          bio: 'Lyrical hip hop artist with powerful storytelling',
          image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
          spotify_url: 'https://open.spotify.com/artist/example3',
          instagram_url: 'https://instagram.com/marcuswilliams',
          status: 'active',
          joined_date: '2023-01-10'
        }
      ],
      
      'releases/recent': [
        {
          title: 'Summer Dreams',
          artist_name: 'Sarah Johnson',
          release_date: '2024-12-01',
          type: 'single',
          cover_art_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
          spotify_url: 'https://open.spotify.com/track/example1',
          apple_music_url: 'https://music.apple.com/track/example1',
          youtube_music_url: 'https://music.youtube.com/watch?v=example1',
          total_streams: 125000
        },
        {
          title: 'Midnight Sessions EP',
          artist_name: 'The Midnight Collective',
          release_date: '2024-11-15',
          type: 'EP',
          cover_art_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
          spotify_url: 'https://open.spotify.com/album/example2',
          apple_music_url: 'https://music.apple.com/album/example2',
          youtube_music_url: 'https://music.youtube.com/playlist?list=example2',
          total_streams: 450000
        }
      ],
      
      'events/upcoming': [
        {
          title: 'HLPFL Showcase Night',
          type: 'show',
          date: '2025-01-15T20:00:00Z',
          location: 'The Intersection, Grand Rapids, MI',
          artist_name: 'Various Artists',
          description: 'Monthly showcase featuring HLPFL artists',
          ticket_url: 'https://hlpfl.org/events/showcase-jan-2025',
          image_url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'
        },
        {
          title: 'New Album Release: Marcus Williams',
          type: 'release',
          date: '2025-02-01T00:00:00Z',
          location: 'Digital Release',
          artist_name: 'Marcus Williams',
          description: 'Debut album "Street Poetry" drops February 1st',
          ticket_url: null,
          image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f'
        }
      ],
      
      'blog/posts': [
        {
          title: '5 Tips for Independent Artists in 2025',
          excerpt: 'Navigate the music industry with these essential tips for success...',
          author: 'HLPFL Team',
          publish_date: '2024-12-10',
          url: 'https://hlpfl.org/blog/5-tips-independent-artists-2025',
          featured_image_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
          category: 'Artist Development'
        },
        {
          title: 'The Future of Music Distribution',
          excerpt: 'How streaming platforms are evolving and what it means for artists...',
          author: 'Sarah Mitchell',
          publish_date: '2024-12-05',
          url: 'https://hlpfl.org/blog/future-music-distribution',
          featured_image_url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae',
          category: 'Industry Insights'
        }
      ],
      
      'testimonials': [
        {
          artist_name: 'Sarah Johnson',
          quote: 'HLPFL Records believed in me from day one. Their support has been incredible!',
          service: 'Artist Development',
          rating: 5,
          date: '2024-11-20',
          artist_image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
        },
        {
          artist_name: 'The Midnight Collective',
          quote: 'The production quality and creative freedom we get at HLPFL is unmatched.',
          service: 'Music Production',
          rating: 5,
          date: '2024-11-15',
          artist_image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4'
        }
      ],
      
      'team': [
        {
          name: 'Michael Chen',
          role: 'A&R Director',
          bio: '15+ years experience discovering and developing talent',
          image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
          email: 'michael@hlpflrecords.com',
          is_available: true
        },
        {
          name: 'Jessica Rodriguez',
          role: 'Head of Marketing',
          bio: 'Digital marketing expert with major label experience',
          image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
          email: 'jessica@hlpflrecords.com',
          is_available: true
        }
      ],
      
      'services/artist_development/availability': {
        is_available: true,
        next_available_date: '2025-01-20',
        booking_url: 'https://hlpfl.org/booking/artist-development',
        estimated_wait_time: '2-3 weeks',
        current_capacity: 'Limited spots available'
      },
      
      'services/music_production/pricing': {
        base_price: 'Starting at $500/day',
        currency: 'USD',
        packages: [
          {
            name: 'Single Recording',
            price: '$1,500',
            features: ['1 day studio time', 'Mixing', 'Mastering', 'Producer consultation']
          },
          {
            name: 'EP Package',
            price: '$5,000',
            features: ['5 days studio time', 'Full production', 'Mixing & mastering', 'Dedicated producer']
          },
          {
            name: 'Album Package',
            price: '$15,000',
            features: ['15 days studio time', 'Full production', 'Mixing & mastering', 'Marketing support']
          }
        ],
        custom_quote_available: true,
        current_discounts: [
          {
            name: 'New Artist Special',
            amount: '20% off first session',
            valid_until: '2025-01-31'
          }
        ]
      }
    };
    
    return mockData[dataType] || null;
  }

  /**
   * Validate and return data
   * @param {string} dataType
   * @param {object} data
   * @returns {object}
   */
  validateData(dataType, data) {
    switch(dataType) {
      case 'stats/overview':
        return DataValidator.validateCompanyStats(data);
      case 'artists':
        return DataValidator.validateArray(data, DataValidator.validateArtist);
      case 'releases/recent':
        return DataValidator.validateArray(data, DataValidator.validateRelease);
      case 'events/upcoming':
        return DataValidator.validateArray(data, DataValidator.validateEvent);
      case 'blog/posts':
        return DataValidator.validateArray(data, DataValidator.validateBlogPost);
      case 'testimonials':
        return DataValidator.validateArray(data, DataValidator.validateTestimonial);
      default:
        return data;
    }
  }
}

export default HLPFLApiClient;