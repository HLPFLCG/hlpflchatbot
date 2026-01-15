/**
 * HLPFL Records Chatbot - Simple Worker for hlpfl.org Integration
 * Serves static assets (CSS/JS) and API endpoints
 */

// Static file content (embedded)
const CHAT_WIDGET_CSS = `
/* HLPFL Chat Widget Styles */
.hlpfl-chat-widget-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.hlpfl-chat-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #CD8B5C, #B87A4D);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(205, 139, 92, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.hlpfl-chat-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(205, 139, 92, 0.6);
}

.hlpfl-chat-button svg {
  width: 28px;
  height: 28px;
  fill: white;
}

.hlpfl-chat-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 380px;
  max-width: calc(100vw - 40px);
  height: 520px;
  max-height: calc(100vh - 120px);
  background: #1A1A1A;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  display: none;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.hlpfl-chat-window.open {
  display: flex;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hlpfl-chat-header {
  background: linear-gradient(135deg, #CD8B5C, #B87A4D);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hlpfl-chat-header h3 {
  margin: 0;
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.hlpfl-chat-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.hlpfl-chat-close:hover {
  opacity: 1;
}

.hlpfl-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #1A1A1A;
}

.hlpfl-chat-message {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.hlpfl-chat-message.bot {
  align-items: flex-start;
}

.hlpfl-chat-message.user {
  align-items: flex-end;
}

.hlpfl-chat-message-bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.hlpfl-chat-message.bot .hlpfl-chat-message-bubble {
  background: #2A2A2A;
  color: #E0E0E0;
  border-bottom-left-radius: 4px;
}

.hlpfl-chat-message.user .hlpfl-chat-message-bubble {
  background: linear-gradient(135deg, #CD8B5C, #B87A4D);
  color: white;
  border-bottom-right-radius: 4px;
}

.hlpfl-chat-input-container {
  padding: 16px;
  background: #2A2A2A;
  border-top: 1px solid #3A3A3A;
  display: flex;
  gap: 12px;
}

.hlpfl-chat-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: #3A3A3A;
  color: white;
  font-size: 14px;
  outline: none;
}

.hlpfl-chat-input::placeholder {
  color: #888;
}

.hlpfl-chat-send {
  padding: 12px 20px;
  background: linear-gradient(135deg, #CD8B5C, #B87A4D);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.hlpfl-chat-send:hover {
  opacity: 0.9;
  transform: scale(1.05);
}

.hlpfl-chat-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Typing indicator */
.hlpfl-typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: #2A2A2A;
  border-radius: 12px;
  width: fit-content;
  margin-bottom: 16px;
}

.hlpfl-typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #CD8B5C;
  animation: typingAnimation 1.4s infinite ease-in-out;
}

.hlpfl-typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.hlpfl-typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingAnimation {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

/* Scrollbar styling */
.hlpfl-chat-messages::-webkit-scrollbar {
  width: 6px;
}

.hlpfl-chat-messages::-webkit-scrollbar-track {
  background: #1A1A1A;
}

.hlpfl-chat-messages::-webkit-scrollbar-thumb {
  background: #CD8B5C;
  border-radius: 3px;
}

.hlpfl-chat-messages::-webkit-scrollbar-thumb:hover {
  background: #B87A4D;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .hlpfl-chat-window {
    width: calc(100vw - 20px);
    height: calc(100vh - 100px);
    bottom: 70px;
    right: 10px;
  }
  
  .hlpfl-chat-button {
    width: 50px;
    height: 50px;
  }
}
`;

const CHAT_WIDGET_JS = `
// HLPFL Chat Widget JavaScript
(function() {
  'use strict';

  const HLPFLChat = {
    apiUrl: 'https://hlpfl.io/api/chat',
    position: 'bottom-right',
    primaryColor: '#CD8B5C',
    companyName: 'HLPFL Records',
    isOpen: false,
    sessionId: null,

    init(options) {
      this.apiUrl = options.apiUrl || this.apiUrl;
      this.position = options.position || this.position;
      this.primaryColor = options.primaryColor || this.primaryColor;
      this.companyName = options.companyName || this.companyName;
      this.sessionId = this.generateSessionId();
      
      this.createWidget();
      this.attachEventListeners();
      
      if (options.showWelcomeMessage) {
        this.showWelcomeMessage(options.welcomeMessage);
      }
    },

    generateSessionId() {
      return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    createWidget() {
      // Create widget container
      const container = document.createElement('div');
      container.id = 'hlpfl-chat-widget';
      container.className = 'hlpfl-chat-widget-container';
      
      // Create chat button
      const button = document.createElement('button');
      button.className = 'hlpfl-chat-button';
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
      button.setAttribute('aria-label', 'Open chat');
      
      // Create chat window
      const window = document.createElement('div');
      window.className = 'hlpfl-chat-window';
      window.innerHTML = \`
        <div class="hlpfl-chat-header">
          <h3>\${this.companyName}</h3>
          <button class="hlpfl-chat-close" aria-label="Close chat">&times;</button>
        </div>
        <div class="hlpfl-chat-messages"></div>
        <div class="hlpfl-chat-input-container">
          <input type="text" class="hlpfl-chat-input" placeholder="Type your message...">
          <button class="hlpfl-chat-send">Send</button>
        </div>
      \`;
      
      container.appendChild(button);
      container.appendChild(window);
      document.body.appendChild(container);
      
      // Store references
      this.container = container;
      this.button = button;
      this.window = window;
      this.messagesContainer = window.querySelector('.hlpfl-chat-messages');
      this.input = window.querySelector('.hlpfl-chat-input');
      this.sendButton = window.querySelector('.hlpfl-chat-send');
      this.closeButton = window.querySelector('.hlpfl-chat-close');
    },

    attachEventListeners() {
      // Toggle chat window
      this.button.addEventListener('click', () => this.toggle());
      
      // Close chat
      this.closeButton.addEventListener('click', () => this.close());
      
      // Send message
      this.sendButton.addEventListener('click', () => this.sendMessage());
      
      // Send on Enter key
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage();
        }
      });
    },

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    },

    open() {
      this.isOpen = true;
      this.window.classList.add('open');
      this.input.focus();
    },

    close() {
      this.isOpen = false;
      this.window.classList.remove('open');
    },

    showWelcomeMessage(message) {
      if (message) {
        this.addBotMessage(message);
      }
    },

    addBotMessage(text) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'hlpfl-chat-message bot';
      messageDiv.innerHTML = '<div class="hlpfl-chat-message-bubble">' + this.escapeHtml(text) + '</div>';
      this.messagesContainer.appendChild(messageDiv);
      this.scrollToBottom();
    },

    addUserMessage(text) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'hlpfl-chat-message user';
      messageDiv.innerHTML = '<div class="hlpfl-chat-message-bubble">' + this.escapeHtml(text) + '</div>';
      this.messagesContainer.appendChild(messageDiv);
      this.scrollToBottom();
    },

    showTypingIndicator() {
      const typingDiv = document.createElement('div');
      typingDiv.className = 'hlpfl-typing-indicator';
      typingDiv.id = 'hlpfl-typing-indicator';
      typingDiv.innerHTML = '<div class="hlpfl-typing-dot"></div><div class="hlpfl-typing-dot"></div><div class="hlpfl-typing-dot"></div>';
      this.messagesContainer.appendChild(typingDiv);
      this.scrollToBottom();
    },

    hideTypingIndicator() {
      const typingDiv = document.getElementById('hlpfl-typing-indicator');
      if (typingDiv) {
        typingDiv.remove();
      }
    },

    async sendMessage() {
      const text = this.input.value.trim();
      if (!text) return;
      
      // Add user message
      this.addUserMessage(text);
      this.input.value = '';
      this.input.disabled = true;
      this.sendButton.disabled = true;
      
      // Show typing indicator
      this.showTypingIndicator();
      
      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: text,
            sessionId: this.sessionId
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to get response');
        }
        
        const data = await response.json();
        
        // Hide typing indicator
        this.hideTypingIndicator();
        
        // Add bot response
        if (data.response) {
          this.addBotMessage(data.response);
        }
      } catch (error) {
        this.hideTypingIndicator();
        this.addBotMessage('Sorry, I encountered an error. Please try again later.');
        console.error('Chat error:', error);
      } finally {
        this.input.disabled = false;
        this.sendButton.disabled = false;
        this.input.focus();
      }
    },

    scrollToBottom() {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    },

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };

  // Expose to global scope
  window.HLPFLChat = HLPFLChat;
})();
`;

// Knowledge base
const KNOWLEDGE_BASE = {
  greeting: {
    response: "Hello! 👋 Welcome to HLPFL Records. I'm here to help you with anything you need. You can ask me about our services, how to submit your music, or learn more about our company. What would you like to know?",
    keywords: ["hello", "hi", "hey", "greetings", "good morning", "good afternoon"]
  },
  services: {
    response: "HLPFL Records offers a comprehensive toolkit for artists:\n\n🎵 **Music Distribution** - Get your music on Spotify, Apple Music, and 150+ platforms with 100% royalty retention\n\n📱 **Social Media Manager** - Unified dashboard for scheduling and analytics across all platforms\n\n🔗 **Link in Bio Tool** - Create custom landing pages for your music, merch, and tour dates\n\n🎼 **Artist Management Services** - Professional support when you need it, on your terms\n\n📋 **Form Builder** - Professional forms for fan capture, bookings, and feedback\n\n🔒 **HLPFL Music Vault** - Access unreleased tracks and stems for remixing and collaboration\n\nWhich service would you like to learn more about?",
    keywords: ["services", "what do you offer", "tools", "offerings", "what you do"]
  },
  submission: {
    response: "Submitting your music to HLPFL is simple! 🎶\n\n1. Visit our Artist Portal at hlpfl.org/artist-portal/\n2. Create a free account (demo: demo@hlpfl.org / demo123)\n3. Upload your tracks and provide artist information\n4. Submit for distribution and other services\n\nNo application process needed - you're already approved! We believe in giving artists immediate access to professional tools.\n\nWould you like me to walk you through any specific part of the process?",
    keywords: ["submit", "submission", "how do i submit", "upload music", "send music", "demo"]
  },
  contact: {
    response: "You can reach HLPFL Records in several ways:\n\n📧 **Email:** contact@hlpflrecords.com\n🌐 **Website:** https://hlpfl.org\n📱 **Artist Portal:** https://hlpfl.org/artist-portal/\n\nOur office hours are Monday-Friday, 9 AM - 6 PM EST. We typically respond to inquiries within 24 hours.\n\nHow can I help you today?",
    keywords: ["contact", "reach", "email", "phone", "address", "how to reach"]
  },
  company: {
    response: "HLPFL Records is an artist-first platform founded in 2019 in Grand Rapids, Michigan. We're not a traditional record label - we're a comprehensive toolkit that gives artists the resources and advantages of a label without the contracts or exploitation.\n\n**Our Mission:** Tools, Not Contracts. Independence, Not Ownership.\n\n**What We Offer:**\n- Complete creative control (you own 100% of your music)\n- 100% royalty retention\n- Professional-grade tools and resources\n- No long-term contracts\n- Strategic guidance when you need it\n\n**Featured Artist:** PRIV - An emerging alternative/indie artist building a successful career on their own terms using our toolkit.\n\nWould you like to learn more about any specific aspect of HLPFL?",
    keywords: ["company", "about", "who are you", "what is hlpfl", "history", "mission"]
  },
  featured_artist: {
    response: "Meet PRIV! 🎤\n\nPRIV is an emerging artist on the HLPFL roster, bringing a fresh perspective with a unique sound that blends innovation and authenticity.\n\n**Genre:** Alternative • Indie • Experimental\n\n**About PRIV:**\n- Maintains complete creative control and ownership\n- Accesses professional tools through HLPFL's toolkit\n- Represents the next generation of independent music\n\n**Quote:** &quot;I've been making music my whole life, but I've never felt truly free until now. HLPFL gets it. They understand that the best art comes from artists who aren't afraid to experiment, fail, and try again. No pressure to fit a mold—just pure creation.&quot;\n\n**Listen:** [Spotify](https://open.spotify.com/artist/0jIqPF7laDAaZmSeoSzLlt) | [Instagram](https://instagram.com/priv)\n\nWould you like to learn more about becoming an HLPFL artist?",
    keywords: ["priv", "featured artist", "artists", "who is priv", "artist roster"]
  },
  default: {
    response: "I'm not sure I understood that correctly. 😊 Here are some things I can help you with:\n\n• Learn about our services\n• Submit your music\n• Contact information\n• About HLPFL Records\n• Our featured artists\n\nCould you please rephrase your question or try one of these topics?",
    keywords: []
  }
};

// Helper function to classify intent
function classifyIntent(message) {
  const lowerMessage = message.toLowerCase();
  let bestMatch = 'default';
  let bestScore = 0;

  for (const [intent, data] of Object.entries(KNOWLEDGE_BASE)) {
    let score = 0;
    for (const keyword of data.keywords) {
      if (lowerMessage.includes(keyword)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = intent;
    }
  }

  return bestMatch;
}

// Main worker
export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Serve static files
      if (path === '/chat-widget.css') {
        return new Response(CHAT_WIDGET_CSS, {
          headers: {
            'Content-Type': 'text/css; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
            ...corsHeaders
          }
        });
      }

      if (path === '/chat-widget.js') {
        return new Response(CHAT_WIDGET_JS, {
          headers: {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
            ...corsHeaders
          }
        });
      }

      // API endpoints
      if (path === '/') {
        return new Response(JSON.stringify({
          message: 'HLPFL Records Chatbot API',
          version: '2.0.0',
          company: 'HLPFL Records',
          endpoints: ['/api/chat', '/api/health', '/chat-widget.css', '/chat-widget.js'],
          documentation: 'https://hlpfl.org'
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      if (path === '/api/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '2.0.0',
          company: 'HLPFL Records',
          location: 'Grand Rapids, Michigan'
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      if (path === '/api/chat' && request.method === 'POST') {
        try {
          const body = await request.json();
          const message = body.message || '';
          
          // Classify intent
          const intent = classifyIntent(message);
          const response = KNOWLEDGE_BASE[intent] || KNOWLEDGE_BASE.default;
          
          return new Response(JSON.stringify({
            response: response.response,
            intent: intent,
            sessionId: body.sessionId,
            timestamp: new Date().toISOString(),
            metadata: {
              cached: false,
              responseTime: Date.now()
            }
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            error: 'Invalid request body',
            message: error instanceof Error ? error.message : 'Unknown error'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }

      // 404 for unknown paths
      return new Response(JSON.stringify({
        error: 'Not Found',
        message: `The requested path ${path} was not found`
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};