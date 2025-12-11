// HLPFL Records Chatbot API for Cloudflare Workers
// Complete self-contained API for embedding in websites

const knowledgeBase = {
  company: {
    name: "HLPFL Records",
    founded: 2009,
    location: "Grand Rapids, Michigan",
    description: "Independent record label specializing in artist development and global music distribution",
    stats: {
      artists: "50+",
      releases: "200+", 
      streams: "1B+"
    },
    mission: "Empowering independent artists with professional development, global distribution, and career advancement"
  },
  
  services: {
    artistDevelopment: {
      name: "Artist Development",
      description: "Comprehensive artist development programs including vocal coaching, performance training, and brand development",
      features: ["Vocal coaching", "Performance training", "Brand development", "Social media strategy"]
    },
    musicProduction: {
      name: "Music Production", 
      description: "Professional music production services with state-of-the-art recording facilities",
      features: ["Recording sessions", "Mixing & mastering", "Producer collaboration", "Studio access"]
    },
    globalDistribution: {
      name: "Global Distribution",
      description: "Worldwide music distribution across all major streaming platforms",
      features: ["Spotify", "Apple Music", "Amazon Music", "YouTube Music", "150+ platforms"]
    },
    publishingRights: {
      name: "Publishing & Rights",
      description: "Music publishing administration and rights management services", 
      features: ["Copyright registration", "Royalty collection", "Publishing administration", "Licensing"]
    },
    marketingPromotion: {
      name: "Marketing & Promotion",
      description: "Strategic marketing and promotional campaigns for music releases",
      features: ["Digital marketing", "PR campaigns", "Radio promotion", "Playlist pitching"]
    },
    careerManagement: {
      name: "Career Management",
      description: "Long-term career management and strategic planning for artists",
      features: ["Career planning", "Tour management", "Brand partnerships", "Financial planning"]
    }
  },

  responseTemplates: {
    greeting: [
      "Welcome to HLPFL Records! I'm here to help you learn about our services and answer any questions about working with us.",
      "Hi there! Thanks for visiting HLPFL Records. How can I assist you with your music career today?",
      "Hello! Welcome to HLPFL Records - Grand Rapids' home for independent artists. What would you like to know?"
    ],
    
    artistSubmission: [
      "Great to hear you're interested in working with us! You can submit your music through our online portal at hlpfl.org/submit. Please include 3-5 of your best tracks and a bio about yourself.",
      "We'd love to hear your music! Please submit your tracks through our website at hlpfl.org/submit. Our A&R team reviews every submission personally.",
      "Thanks for your interest in HLPFL Records! Head over to hlpfl.org/submit to share your music with our team."
    ],
    
    services: [
      "HLPFL Records offers comprehensive services including artist development, music production, global distribution, publishing & rights management, marketing & promotion, and career management.",
      "We provide end-to-end support for artists: from vocal coaching and production to worldwide distribution and marketing campaigns.",
      "Our services cover every aspect of an artist's career - development, production, distribution, marketing, and management."
    ],
    
    companyInfo: [
      "HLPFL Records was founded in 2009 in Grand Rapids, Michigan. We're an independent label supporting 50+ artists with 200+ releases and over 1 billion streams worldwide.",
      "We're a Grand Rapids-based independent record label founded in 2009, dedicated to empowering independent artists.",
      "Since 2009, HLPFL Records has been helping independent artists achieve their dreams from our home in Grand Rapids."
    ],
    
    contact: [
      "You can reach HLPFL Records at info@hlpfl.org or (616) 555-0123. Our office is located at 456 Fulton Street, Grand Rapids, MI 49503.",
      "Contact us via email at info@hlpfl.org or call (616) 555-0123. We're available Monday-Friday, 9 AM - 6 PM EST.",
      "Get in touch with us at info@hlpfl.org or visit our office downtown in Grand Rapids. We'd love to hear from you!"
    ],
    
    fallback: [
      "I'm here to help with information about HLPFL Records, our services, artist submissions, or general inquiries. Could you rephrase your question?",
      "I can assist with questions about our record label services, artist opportunities, or company information. What would you like to know?",
      "I'd be happy to help you learn about HLPFL Records! You can ask about our services, submitting music, or contact information."
    ]
  }
};

// Simple intent classification
function classifyIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return 'greeting';
  } else if (lowerMessage.includes('submit') || lowerMessage.includes('demo') || lowerMessage.includes('music')) {
    return 'artist_submission';
  } else if (lowerMessage.includes('service') || lowerMessage.includes('offer') || lowerMessage.includes('help')) {
    return 'services';
  } else if (lowerMessage.includes('about') || lowerMessage.includes('company') || lowerMessage.includes('who are')) {
    return 'company_info';
  } else if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone')) {
    return 'contact';
  } else {
    return 'fallback';
  }
}

// Generate response
function generateResponse(intent, message, conversationHistory = []) {
  const templates = knowledgeBase.responseTemplates;
  let responseText = '';
  let quickActions = [];
  let suggestions = [];
  
  switch (intent) {
    case 'greeting':
      responseText = templates.greeting[Math.floor(Math.random() * templates.greeting.length)];
      quickActions = ["Submit Music", "Learn About Services", "Company Info", "Contact Us"];
      suggestions = ["What services do you offer?", "How do I submit music?", "Tell me about HLPFL Records"];
      break;
      
    case 'artist_submission':
      responseText = templates.artistSubmission[Math.floor(Math.random() * templates.artistSubmission.length)];
      quickActions = ["Submit Music", "Contact Us"];
      suggestions = ["What are you looking for in artists?", "How long does review take?", "What are your contract terms?"];
      break;
      
    case 'services':
      responseText = templates.services[Math.floor(Math.random() * templates.services.length)];
      quickActions = Object.keys(knowledgeBase.services);
      suggestions = ["Artist Development", "Music Production", "Global Distribution"];
      break;
      
    case 'company_info':
      responseText = templates.companyInfo[Math.floor(Math.random() * templates.companyInfo.length)];
      quickActions = ["Our Mission", "Our Artists", "Our History"];
      suggestions = ["What's your mission?", "How many artists do you work with?", "Where are you located?"];
      break;
      
    case 'contact':
      responseText = templates.contact[Math.floor(Math.random() * templates.contact.length)];
      quickActions = ["Email Us", "Call Us", "Visit Office"];
      suggestions = ["What are your office hours?", "Do you offer virtual meetings?", "Best way to reach A&R?"];
      break;
      
    default:
      responseText = templates.fallback[Math.floor(Math.random() * templates.fallback.length)];
      quickActions = ["Submit Music", "Learn About Services", "Company Info", "Contact Us"];
      suggestions = ["What services do you offer?", "How do I submit music?", "Tell me about HLPFL Records"];
  }
  
  return {
    text: responseText,
    quickActions: quickActions,
    suggestions: suggestions
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }
    
    // Chat API endpoint
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { message, conversationHistory = [] } = await request.json();
        
        if (!message) {
          return new Response(JSON.stringify({ error: 'Message is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const intent = classifyIntent(message);
        const response = generateResponse(intent, message, conversationHistory);
        
        return new Response(JSON.stringify({
          response: response.text,
          intent: intent,
          quickActions: response.quickActions,
          suggestions: response.suggestions
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Health check endpoint
    if (url.pathname === '/api/health' && request.method === 'GET') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        company: knowledgeBase.company.name,
        location: knowledgeBase.company.location
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // API documentation endpoint
    if (url.pathname === '/api/docs' && request.method === 'GET') {
      return new Response(JSON.stringify({
        title: "HLPFL Records Chatbot API",
        version: "1.0.0",
        company: knowledgeBase.company,
        endpoints: {
          chat: {
            method: "POST",
            path: "/api/chat",
            description: "Send a message to the chatbot",
            parameters: {
              message: "string (required) - User's message to the chatbot",
              conversationHistory: "array (optional) - Previous conversation messages"
            },
            response: {
              response: "string - Chatbot's response",
              intent: "string - Classified intent",
              quickActions: "array - Suggested quick actions",
              suggestions: "array - Follow-up questions"
            }
          },
          health: {
            method: "GET", 
            path: "/api/health",
            description: "Check API health status",
            response: {
              status: "string - Health status",
              timestamp: "string - Current timestamp",
              version: "string - API version"
            }
          }
        }
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Services endpoint
    if (url.pathname === '/api/services' && request.method === 'GET') {
      return new Response(JSON.stringify({
        services: knowledgeBase.services
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Default response
    return new Response(JSON.stringify({
      message: "HLPFL Records Chatbot API",
      version: "1.0.0",
      company: knowledgeBase.company.name,
      endpoints: ["/api/chat", "/api/health", "/api/docs", "/api/services"],
      documentation: "/api/docs"
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};