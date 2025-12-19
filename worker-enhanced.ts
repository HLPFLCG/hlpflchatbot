/**
 * HLPFL Records Chatbot API - Enhanced Version with Security
 * Phase 1 Complete: Real-Time Information Integration + Security Layer
 * Phase 2 Ready: AI-Powered Intelligence
 */

// @ts-ignore - JavaScript modules will be migrated to TypeScript
import { LiveDataIntegration } from './src/live-data/integration.js';
// @ts-ignore - JavaScript modules will be migrated to TypeScript
import { CacheManager } from './src/live-data/cache.js';
import {
  createSecurityMiddleware,
  validateMessage,
  createSecureJsonResponse,
  applyCorsHeaders,
  DEFAULT_CORS_OPTIONS,
} from './src/security';
import type { Env, ChatRequest } from './src/types';

// Initialize cache storage
const cacheStorage = new Map<string, any>();

// Security middleware
const securityMiddleware = createSecurityMiddleware({
  enableRateLimit: true,
  enableCors: true,
  enableSecurityHeaders: true,
});

/**
 * Main worker export
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Apply security middleware
    const securityResponse = await securityMiddleware(request);
    if (securityResponse) {
      return securityResponse;
    }

    // Initialize services
    const cache = new CacheManager(env.CACHE || cacheStorage);
    const liveData = new LiveDataIntegration(env, cache);

    try {
      let response: Response;

      // Route handling
      switch (url.pathname) {
        case '/':
        case '':
          response = handleRoot();
          break;

        case '/api/health':
          response = await handleHealth(liveData);
          break;

        case '/api/docs':
          response = handleDocs();
          break;

        case '/api/services':
          response = handleServices();
          break;

        case '/api/company':
          response = await handleCompany(liveData);
          break;

        case '/api/artists':
          response = await handleArtists(liveData);
          break;

        case '/api/releases':
          response = await handleReleases(liveData, url);
          break;

        case '/api/events':
          response = await handleEvents(liveData);
          break;

        case '/api/blog':
          response = await handleBlog(liveData, url);
          break;

        case '/api/testimonials':
          response = await handleTestimonials(liveData);
          break;

        case '/api/chat':
          if (request.method === 'POST') {
            response = await handleChat(request, liveData, env);
          } else {
            response = createSecureJsonResponse({ error: 'Method not allowed' }, 405);
          }
          break;

        case '/api/cache/stats':
          response = handleCacheStats(cache);
          break;

        default:
          response = createSecureJsonResponse({ error: 'Not found' }, 404);
      }

      // Apply CORS headers to response
      return applyCorsHeaders(response, request, DEFAULT_CORS_OPTIONS);
    } catch (error) {
      console.error('Request error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return createSecureJsonResponse(
        {
          error: 'Internal server error',
          message: errorMessage,
        },
        500
      );
    }
  },
};

/**
 * Route Handlers
 */

function handleRoot(): Response {
  return createSecureJsonResponse({
    message: 'HLPFL Records Chatbot API - Enhanced',
    version: '2.0.0',
    company: 'HLPFL Records',
    tagline: 'World-Class Record Label & Artist Development',
    features: [
      'Real-time data integration',
      'Intelligent caching',
      'Comprehensive validation',
      'Security hardening (CSP, HSTS, Rate Limiting)',
      'TypeScript with strict mode',
      'Live company statistics',
      'Dynamic artist roster',
      'Recent releases feed',
      'Upcoming events',
      'Blog posts integration',
    ],
    endpoints: {
      info: '/',
      health: '/api/health',
      docs: '/api/docs',
      services: '/api/services',
      company: '/api/company',
      artists: '/api/artists',
      releases: '/api/releases',
      events: '/api/events',
      blog: '/api/blog',
      testimonials: '/api/testimonials',
      chat: '/api/chat',
      cacheStats: '/api/cache/stats',
    },
    documentation: '/api/docs',
  });
}

async function handleHealth(liveData: LiveDataIntegration): Promise<Response> {
  const apiHealthy = await liveData.healthCheck();

  return createSecureJsonResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    company: 'HLPFL Records',
    location: 'Grand Rapids, Michigan',
    services: {
      api: apiHealthy ? 'operational' : 'degraded',
      cache: 'operational',
      database: 'operational',
      security: 'operational',
    },
  });
}

function handleDocs(): Response {
  return createSecureJsonResponse({
    api: 'HLPFL Records Chatbot API - Enhanced',
    version: '2.0.0',
    description: 'Real-time chatbot API with live data integration and security',

    endpoints: {
      '/': {
        method: 'GET',
        description: 'API information and available endpoints',
        authentication: 'None',
      },
      '/api/health': {
        method: 'GET',
        description: 'Health check endpoint with service status',
        authentication: 'None',
      },
      '/api/company': {
        method: 'GET',
        description: 'Get real-time company information and statistics',
        authentication: 'None',
        cache: '5 minutes',
      },
      '/api/artists': {
        method: 'GET',
        description: 'Get current artist roster with profiles',
        authentication: 'None',
        cache: '5 minutes',
      },
      '/api/releases': {
        method: 'GET',
        description: 'Get recent music releases (last 30 days)',
        authentication: 'None',
        cache: '5 minutes',
        queryParams: {
          days: 'Number of days to look back (default: 30)',
        },
      },
      '/api/events': {
        method: 'GET',
        description: 'Get upcoming events, shows, and releases',
        authentication: 'None',
        cache: '5 minutes',
      },
      '/api/blog': {
        method: 'GET',
        description: 'Get latest blog posts',
        authentication: 'None',
        cache: '5 minutes',
        queryParams: {
          limit: 'Number of posts to return (default: 5)',
        },
      },
      '/api/testimonials': {
        method: 'GET',
        description: 'Get artist testimonials',
        authentication: 'None',
        cache: '5 minutes',
      },
      '/api/chat': {
        method: 'POST',
        description: 'Chat with AI assistant',
        authentication: 'None',
        rateLimit: '20 requests per minute',
        requestBody: {
          message: 'User message (required, max 2000 characters)',
          sessionId: 'Optional session identifier',
        },
      },
      '/api/cache/stats': {
        method: 'GET',
        description: 'Get cache performance statistics',
        authentication: 'None',
      },
    },

    security: {
      headers: [
        'Content-Security-Policy',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Strict-Transport-Security',
        'Referrer-Policy',
        'Permissions-Policy',
      ],
      rateLimiting: {
        api: '60 requests per minute',
        chat: '20 requests per minute',
      },
      cors: {
        allowedOrigins: ['hlpfl.org', 'hlpfl.io', 'localhost'],
        allowedMethods: ['GET', 'POST', 'OPTIONS'],
      },
    },

    caching: {
      strategy: 'Intelligent caching with TTL',
      ttl: {
        company: '5 minutes',
        artists: '5 minutes',
        releases: '5 minutes',
        events: '5 minutes',
        blog: '5 minutes',
      },
    },
  });
}

function handleServices(): Response {
  return createSecureJsonResponse({
    services: [
      {
        id: 'artist-development',
        name: 'Artist Development',
        category: 'Development',
        description:
          'Comprehensive artist development program including career planning, brand development, and performance training',
        features: [
          'Career Planning & Strategy',
          'Brand Development',
          'Performance Training',
          'Industry Connections',
        ],
      },
      {
        id: 'music-production',
        name: 'Music Production',
        category: 'Production',
        description:
          'Professional music production services with world-class producers and state-of-the-art studios',
        features: [
          'Recording Studios',
          'Mixing & Mastering',
          'World-Class Producers',
          'Sound Engineering',
        ],
      },
      {
        id: 'distribution',
        name: 'Global Distribution',
        category: 'Distribution',
        description: 'Worldwide music distribution to 150+ platforms including all major streaming services',
        features: [
          'Spotify Distribution',
          'Apple Music',
          'YouTube Music',
          '150+ Platforms',
        ],
      },
      {
        id: 'publishing',
        name: 'Publishing & Rights',
        category: 'Legal',
        description: 'Complete publishing services including copyright protection and royalty management',
        features: [
          'Copyright Protection',
          'Royalty Management',
          'Sync Licensing',
          'Rights Administration',
        ],
      },
      {
        id: 'marketing',
        name: 'Marketing & Promotion',
        category: 'Marketing',
        description: 'Comprehensive marketing and promotion services to build your audience',
        features: [
          'Social Media Marketing',
          'PR Campaigns',
          'Influencer Partnerships',
          'Content Creation',
        ],
      },
      {
        id: 'management',
        name: 'Career Management',
        category: 'Management',
        description: 'Professional career management and strategic guidance',
        features: [
          'Contract Negotiation',
          'Tour Management',
          'Strategic Guidance',
          'Industry Representation',
        ],
      },
    ],
  });
}

async function handleCompany(liveData: LiveDataIntegration): Promise<Response> {
  const companyInfo = await liveData.getCompanyInfo();
  return createSecureJsonResponse(companyInfo);
}

async function handleArtists(liveData: LiveDataIntegration): Promise<Response> {
  const artists = await liveData.getArtists();
  return createSecureJsonResponse({ artists, count: artists.length });
}

async function handleReleases(liveData: LiveDataIntegration, url: URL): Promise<Response> {
  const daysParam = url.searchParams.get('days');
  const days = daysParam ? parseInt(daysParam, 10) : 30;

  const releases = await liveData.getRecentReleases(days);
  return createSecureJsonResponse({
    releases,
    count: releases.length,
    period: `Last ${days} days`,
  });
}

async function handleEvents(liveData: LiveDataIntegration): Promise<Response> {
  const events = await liveData.getUpcomingEvents();
  return createSecureJsonResponse({ events, count: events.length });
}

async function handleBlog(liveData: LiveDataIntegration, url: URL): Promise<Response> {
  const limitParam = url.searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 5;

  const posts = await liveData.getBlogPosts(limit);
  return createSecureJsonResponse({ posts, count: posts.length });
}

async function handleTestimonials(liveData: LiveDataIntegration): Promise<Response> {
  const testimonials = await liveData.getTestimonials();
  return createSecureJsonResponse({ testimonials, count: testimonials.length });
}

async function handleChat(
  request: Request,
  liveData: LiveDataIntegration,
  _env: Env
): Promise<Response> {
  try {
    const body = (await request.json()) as ChatRequest;

    // Validate and sanitize message
    const validation = validateMessage(body.message);
    if (!validation.isValid) {
      return createSecureJsonResponse(
        {
          error: 'Invalid message',
          errors: validation.errors,
        },
        400
      );
    }

    const sanitizedMessage = validation.sanitized;

    // TODO: Integrate AI modules here (Phase 2)
    // For now, return a basic response with live data context

    const companyInfo = await liveData.getCompanyInfo();

    return createSecureJsonResponse({
      response: `Thank you for your message! I'm the HLPFL Records AI assistant. ${companyInfo.name} has been ${companyInfo.tagline.toLowerCase()} since ${companyInfo.founded}. How can I help you today?`,
      message: sanitizedMessage,
      sessionId: body.sessionId || generateSessionId(),
      timestamp: new Date().toISOString(),
      metadata: {
        cached: false,
        responseTime: 0,
        aiEnabled: false, // Will be true in Phase 2
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return createSecureJsonResponse(
      {
        error: 'Failed to process chat message',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
}

function handleCacheStats(cache: CacheManager): Response {
  const stats = cache.getStats();
  return createSecureJsonResponse({
    cache: stats,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Utility Functions
 */

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}