// HLPFL Records Chatbot API for Cloudflare Workers
// Complete self-contained API for embedding in websites

const knowledgeBase = {
  company: {
    name: "HLPFL Records",
    tagline: "World-Class Record Label & Artist Development",
    mission: "Elevating artists to global recognition",
    founded: 2009,
    location: "Grand Rapids, Michigan",
    description: "HLPFL Records is a premier record label dedicated to discovering, developing, and promoting exceptional musical talent with cutting-edge production, strategic guidance, and global distribution networks.",
    stats: {
      artists: "50+",
      releases: "200+",
      streams: "1B+",
      years: "15+",
      awards: "30+",
      team_members: "50+"
    },
    contact: {
      email: "contact@hlpflrecords.com",
      phone: "+1 (555) 123-4567",
      address: "123 Music Row, Nashville, TN 37203",
      office_hours: "Monday-Friday 9:00 AM - 6:00 PM EST",
      website: "https://hlpfl.org",
      api: "https://hlpfl.io"
    }
  },
  
  services: {
    artistDevelopment: {
      name: "Artist Development",
      description: "Comprehensive artist development programs to nurture talent and build successful, sustainable music careers.",
      features: ["Career Planning", "Brand Development", "Performance Training", "Marketing Strategy"]
    },
    musicProduction: {
      name: "Music Production",
      description: "State-of-the-art production facilities with world-class producers, engineers, and cutting-edge technology.",
      features: ["Recording Studios", "Mixing & Mastering", "Production Services", "Sound Design"]
    },
    globalDistribution: {
      name: "Global Distribution",
      description: "Worldwide distribution network to get your music to every major platform and reach millions of listeners.",
      features: ["Digital Distribution", "Physical Releases", "Playlist Placement", "International Marketing"],
      platforms: ["Spotify", "Apple Music", "YouTube Music", "Amazon Music", "Tidal", "150+ platforms"]
    },
    publishingRights: {
      name: "Publishing & Rights Management",
      description: "Complete music publishing services including copyright protection, royalty collection, and licensing.",
      features: ["Copyright Registration", "Royalty Management", "Sync Licensing", "Publishing Administration"]
    },
    marketingPromotion: {
      name: "Marketing & Promotion",
      description: "Strategic marketing campaigns and promotional services to maximize your music's reach and impact.",
      features: ["Social Media Marketing", "PR Campaigns", "Radio Promotion", "Influencer Partnerships"]
    },
    careerManagement: {
      name: "Career Management",
      description: "Personalized career management and strategic guidance to navigate the music industry successfully.",
      features: ["Contract Negotiation", "Tour Management", "Brand Partnerships", "Long-term Strategy"]
    }
  },

  responseTemplates: {
    greeting: [
      "Hello! Welcome to HLPFL Records. I'm here to help you with any questions about our artists, services, or how to submit your music. What can I assist you with today?",
      "Hi there! Thanks for visiting HLPFL Records. How can I help you with your music career today?",
      "Welcome to HLPFL Records - elevating artists to global recognition. What would you like to know?"
    ],
    
    artistSubmission: [
      "Great question! We're always excited to discover new talent. Here's how you can submit your music to HLPFL Records:\n\n1. Visit our submission page: hlpfl.org/contact\n2. Fill out the form with your information\n3. Include links to your music (SoundCloud, Spotify, YouTube, etc.)\n4. Add a brief bio about yourself and your musical journey\n\nOur A&R team reviews all submissions within 1-2 weeks. We look for artists who demonstrate exceptional talent, unique vision, and dedication to their craft.\n\nWould you like to know more about what we look for in artists?",
      "We'd love to hear your music! Please submit your tracks through our website at hlpfl.org/contact. Include your best 3-5 tracks and a brief bio. Our A&R team reviews every submission personally within 1-2 weeks.",
      "Thanks for your interest in HLPFL Records! Head over to hlpfl.org/contact to share your music with our team. Make sure to include high-quality recordings and tell us your story!"
    ],
    
    services: [
      "HLPFL Records provides comprehensive music business solutions to help artists build successful, sustainable careers. Our services include:\n\n🎵 Artist Development - Career planning, brand development, performance training\n🎙️ Music Production - Recording, mixing, mastering with world-class producers\n🌍 Global Distribution - Digital and physical distribution to all major platforms\n📄 Publishing & Rights - Copyright protection, royalty management, sync licensing\n📢 Marketing & Promotion - Social media, PR campaigns, radio promotion\n💼 Career Management - Contract negotiation, tour management, strategic guidance\n\nWhich area would you like to learn more about?",
      "We provide end-to-end support for artists: from vocal coaching and production to worldwide distribution and marketing campaigns. Our comprehensive services cover every aspect of an artist's career.",
      "Our services cover artist development, music production, global distribution, publishing & rights management, marketing & promotion, and career management. We're here to support you at every stage of your music journey."
    ],
    
    companyInfo: [
      "HLPFL Records is a premier record label dedicated to discovering, developing, and promoting exceptional musical talent. Founded in 2009, we've grown from a small independent label to a respected name in the industry.\n\n**Our Mission:** Elevating artists to global recognition through artist-first partnerships and comprehensive support.\n\n**Our Track Record:**\n• 50+ Active Artists\n• 200+ Music Releases\n• 1B+ Global Streams\n• 15+ Years in Business\n• 30+ Industry Awards\n\nWe believe in creating partnerships that go beyond traditional label relationships, providing personalized attention and resources to help each artist achieve their unique vision.\n\nIs there anything specific you'd like to know about our work or artists?",
      "Since 2009, HLPFL Records has been helping independent artists achieve their dreams from our home in Grand Rapids, Michigan. We're an independent label supporting 50+ artists with 200+ releases and over 1 billion streams worldwide.",
      "We're a Grand Rapids-based independent record label founded in 2009, dedicated to empowering independent artists with comprehensive support and global reach."
    ],
    
    contact: [
      "You can reach HLPFL Records at:\n\n📧 Email: contact@hlpflrecords.com\n📞 Phone: +1 (555) 123-4567\n📍 Address: 123 Music Row, Nashville, TN 37203\n🕐 Office Hours: Monday-Friday, 9 AM - 6 PM EST\n🌐 Website: https://hlpfl.org\n\nWe'd love to hear from you!",
      "Contact us via email at contact@hlpflrecords.com or call +1 (555) 123-4567. We're available Monday-Friday, 9 AM - 6 PM EST. You can also use our contact form at hlpfl.org/contact.",
      "Get in touch with us at contact@hlpflrecords.com or visit our office. We're here to help with any questions about our services or artist opportunities!"
    ],
    
    fallback: [
      "That's a great question! While I don't have specific information about that right now, I'd be happy to connect you with our team who can provide more details.\n\nYou can reach us at:\n• Email: contact@hlpflrecords.com\n• Phone: +1 (555) 123-4567\n• Contact form: hlpfl.org/contact\n\nIs there anything else I can help you with?",
      "I can assist with questions about our record label services, artist opportunities, or company information. Could you rephrase your question or let me know what specific area you'd like to learn about?",
      "I'd be happy to help you learn about HLPFL Records! You can ask about our services, submitting music, company information, or contact details. What would you like to know?"
    ]
  }
};

// Simple intent classification
function classifyIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('greet')) {
    return 'greeting';
  } else if (lowerMessage.includes('submit') || lowerMessage.includes('demo') || lowerMessage.includes('send music') || lowerMessage.includes('my music')) {
    return 'artist_submission';
  } else if (lowerMessage.includes('service') || lowerMessage.includes('offer') || lowerMessage.includes('what do you') || lowerMessage.includes('help with')) {
    return 'services';
  } else if (lowerMessage.includes('about') || lowerMessage.includes('company') || lowerMessage.includes('who are') || lowerMessage.includes('tell me about')) {
    return 'company_info';
  } else if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone') || lowerMessage.includes('reach')) {
    return 'contact';
  } else {
    return 'fallback';
  }
}

// Generate response based on intent
function generateResponse(intent) {
  const templates = knowledgeBase.responseTemplates;
  
  switch(intent) {
    case 'greeting':
      return templates.greeting[Math.floor(Math.random() * templates.greeting.length)];
    case 'artist_submission':
      return templates.artistSubmission[Math.floor(Math.random() * templates.artistSubmission.length)];
    case 'services':
      return templates.services[Math.floor(Math.random() * templates.services.length)];
    case 'company_info':
      return templates.companyInfo[Math.floor(Math.random() * templates.companyInfo.length)];
    case 'contact':
      return templates.contact[Math.floor(Math.random() * templates.contact.length)];
    default:
      return templates.fallback[Math.floor(Math.random() * templates.fallback.length)];
  }
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Root endpoint - API info
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(JSON.stringify({
        message: "HLPFL Records Chatbot API",
        version: "1.0.0",
        company: "HLPFL Records",
        endpoints: ["/api/chat", "/api/health", "/api/docs", "/api/services"],
        documentation: "/api/docs"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Health check endpoint
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        company: "HLPFL Records",
        location: "Grand Rapids, Michigan"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Documentation endpoint
    if (url.pathname === '/api/docs') {
      return new Response(JSON.stringify({
        api: "HLPFL Records Chatbot API",
        version: "1.0.0",
        endpoints: {
          "/": {
            method: "GET",
            description: "API information and available endpoints"
          },
          "/api/health": {
            method: "GET",
            description: "Health check endpoint"
          },
          "/api/chat": {
            method: "POST",
            description: "Chat with the HLPFL Records AI assistant",
            body: {
              message: "string (required) - User message",
              sessionId: "string (optional) - Session identifier"
            },
            response: {
              response: "string - Bot response",
              intent: "string - Detected intent",
              timestamp: "string - ISO timestamp"
            }
          },
          "/api/services": {
            method: "GET",
            description: "Get information about HLPFL Records services"
          }
        },
        company: knowledgeBase.company
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Services endpoint
    if (url.pathname === '/api/services') {
      return new Response(JSON.stringify({
        company: knowledgeBase.company.name,
        services: knowledgeBase.services
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Serve logo asset
    if (url.pathname === '/assets/hlpfl-logo.svg') {
      // Read the SVG file content
      const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg width="100%" height="100%" viewBox="0 0 612 612" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><use xlink:href="#_Image1" x="223" y="47" width="206px" height="518px"/></svg>`;
      
      return new Response(svgContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=31536000'
        }
      });
    }
    
    // Chat endpoint
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const body = await request.json();
        const userMessage = body.message || '';
        const sessionId = body.sessionId || 'default';
        
        if (!userMessage) {
          return new Response(JSON.stringify({
            error: "Message is required"
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // Classify intent and generate response
        const intent = classifyIntent(userMessage);
        const response = generateResponse(intent);
        
        return new Response(JSON.stringify({
          response: response,
          intent: intent,
          sessionId: sessionId,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        return new Response(JSON.stringify({
          error: "Invalid request format",
          message: error.message
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 404 for unknown routes
    return new Response(JSON.stringify({
      error: "Not Found",
      message: "The requested endpoint does not exist",
      availableEndpoints: ["/", "/api/health", "/api/chat", "/api/docs", "/api/services"]
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};