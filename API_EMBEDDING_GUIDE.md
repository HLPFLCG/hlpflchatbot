# 🔌 API-First Chatbot Deployment & Embedding Guide

This guide shows you how to deploy the HLPFL Chatbot as a REST API and embed it into your existing website.

## 🎯 Use Case Overview

- **Primary Function**: REST API for chatbot functionality
- **Embedding**: Integrate into existing website
- **Purpose**: Additional feature instead of live representatives
- **Hosting**: GitHub + Cloudflare Workers
- **Domain**: Optional, but recommended for production

## 🏗️ Architecture Overview

```
Your Website (React/Vue/HTML)
    ↓ (API Calls)
Cloudflare Workers (Chatbot API)
    ↓ (Knowledge Base)
GitHub Repository (Source Code)
```

## 🚀 Deployment Options

### Option 1: Cloudflare Workers Only (Recommended - No Domain Needed)

Perfect for API-only deployment without custom domain.

#### Step 1: Create Cloudflare Worker

Create `worker.js` in your repository:

```javascript
// worker.js - Complete API-only chatbot
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
function generateResponse(intent, message) {
  const templates = knowledgeBase.responseTemplates;
  let responseText = '';
  let quickActions = [];
  let suggestions = [];
  
  switch (intent) {
    case 'greeting':
      responseText = templates.greeting[Math.floor(Math.random() * templates.greeting.length)];
      quickActions = ["Submit Music", "Learn About Services", "Company Info", "Contact Us"];
      break;
      
    case 'artist_submission':
      responseText = templates.artistSubmission[Math.floor(Math.random() * templates.artistSubmission.length)];
      quickActions = ["Submit Music", "Contact Us"];
      break;
      
    case 'services':
      responseText = templates.services[Math.floor(Math.random() * templates.services.length)];
      quickActions = Object.keys(knowledgeBase.services);
      break;
      
    case 'company_info':
      responseText = templates.companyInfo[Math.floor(Math.random() * templates.companyInfo.length)];
      break;
      
    case 'contact':
      responseText = templates.contact[Math.floor(Math.random() * templates.contact.length)];
      break;
      
    default:
      responseText = templates.fallback[Math.floor(Math.random() * templates.fallback.length)];
      quickActions = ["Submit Music", "Learn About Services", "Company Info", "Contact Us"];
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
        version: '1.0.0'
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
        title: "HLPFL Chatbot API",
        version: "1.0.0",
        endpoints: {
          chat: {
            method: "POST",
            path: "/api/chat",
            description: "Send a message to the chatbot",
            parameters: {
              message: "string (required)",
              conversationHistory: "array (optional)"
            }
          },
          health: {
            method: "GET", 
            path: "/api/health",
            description: "Check API health status"
          }
        }
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Default response
    return new Response(JSON.stringify({
      message: "HLPFL Chatbot API",
      version: "1.0.0",
      endpoints: ["/api/chat", "/api/health", "/api/docs"]
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
```

#### Step 2: Deploy to Cloudflare Workers

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create wrangler.toml configuration
echo "name = &quot;hlpfl-chatbot&quot;" > wrangler.toml
echo "main = &quot;worker.js&quot;" >> wrangler.toml
echo "compatibility_date = &quot;2023-12-01&quot;" >> wrangler.toml

# Deploy the worker
wrangler deploy
```

#### Step 3: Get Your API URL

After deployment, you'll get a URL like:
```
https://hlpfl-chatbot.your-subdomain.workers.dev
```

Your API endpoints will be:
- Chat: `https://hlpfl-chatbot.your-subdomain.workers.dev/api/chat`
- Health: `https://hlpfl-chatbot.your-subdomain.workers.dev/api/health`
- Docs: `https://hlpfl-chatbot.your-subdomain.workers.dev/api/docs`

### Option 2: With Custom Domain (Recommended for Production)

#### Step 1: Add Domain to Cloudflare

1. Go to Cloudflare Dashboard
2. Add your domain (e.g., `hlpfl.org`)
3. Update nameservers as instructed
4. Wait for DNS propagation

#### Step 2: Configure Worker Route

```bash
# Update wrangler.toml with custom domain
cat >> wrangler.toml << EOF

[env.production]
routes = [
  { pattern = "api.hlpfl.org/*", zone_name = "hlpfl.org" }
]
EOF

# Deploy with custom domain
wrangler deploy --env production
```

Your API will be available at:
```
https://api.hlpfl.org/api/chat
```

## 🔌 Embedding in Your Website

### Option 1: JavaScript Widget (Easiest)

Create `chat-widget.js`:

```javascript
class HLPFLChatWidget {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || 'https://hlpfl-chatbot.your-subdomain.workers.dev';
    this.container = options.container || 'chat-widget-container';
    this.conversationHistory = [];
    this.isOpen = false;
    
    this.init();
  }
  
  init() {
    this.createWidgetHTML();
    this.attachEventListeners();
  }
  
  createWidgetHTML() {
    const widgetHTML = `
      <div id="hlpfl-chat-widget">
        <div id="chat-toggle">
          💬 Chat
        </div>
        <div id="chat-window">
          <div id="chat-header">
            <h3>HLPFL Records</h3>
            <button id="chat-close">×</button>
          </div>
          <div id="chat-messages"></div>
          <div id="chat-input-container">
            <input type="text" id="chat-input" placeholder="Ask about our services...">
            <button id="chat-send">Send</button>
          </div>
        </div>
      </div>
    `;
    
    const container = document.getElementById(this.container);
    if (container) {
      container.innerHTML = widgetHTML;
    } else {
      document.body.insertAdjacentHTML('beforeend', widgetHTML);
    }
  }
  
  attachEventListeners() {
    const toggle = document.getElementById('chat-toggle');
    const close = document.getElementById('chat-close');
    const send = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');
    
    toggle?.addEventListener('click', () => this.toggleChat());
    close?.addEventListener('click', () => this.toggleChat());
    send?.addEventListener('click', () => this.sendMessage());
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }
  
  toggleChat() {
    const window = document.getElementById('chat-window');
    this.isOpen = !this.isOpen;
    window.style.display = this.isOpen ? 'block' : 'none';
  }
  
  async sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input?.value.trim();
    
    if (!message) return;
    
    this.addMessage(message, 'user');
    input.value = '';
    
    this.showTypingIndicator();
    
    try {
      const response = await fetch(`${this.apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: this.conversationHistory
        })
      });
      
      const data = await response.json();
      
      this.hideTypingIndicator();
      this.addMessage(data.response, 'bot');
      this.conversationHistory.push({ role: 'user', content: message });
      this.conversationHistory.push({ role: 'assistant', content: data.response });
      
      if (data.quickActions && data.quickActions.length > 0) {
        this.addQuickActions(data.quickActions);
      }
      
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage('Sorry, I\'m having trouble connecting. Please try again later.', 'bot');
    }
  }
  
  addMessage(text, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    messageElement.textContent = text;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  addQuickActions(actions) {
    const messagesContainer = document.getElementById('chat-messages');
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'quick-actions';
    
    actions.forEach(action => {
      const button = document.createElement('button');
      button.className = 'quick-action-btn';
      button.textContent = action;
      button.onclick = () => {
        document.getElementById('chat-input').value = action;
        this.sendMessage();
      };
      actionsContainer.appendChild(button);
    });
    
    messagesContainer.appendChild(actionsContainer);
  }
  
  showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    const indicator = document.createElement('div');
    indicator.className = 'message bot-message typing';
    indicator.innerHTML = '<span>●</span><span>●</span><span>●</span>';
    indicator.id = 'typing-indicator';
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }
}

// Auto-initialize if script is included
if (typeof window !== 'undefined') {
  window.HLPFLChatWidget = HLPFLChatWidget;
  
  // Auto-initialize with default options
  document.addEventListener('DOMContentLoaded', () => {
    new HLPFLChatWidget({
      apiUrl: 'https://hlpfl-chatbot.your-subdomain.workers.dev'
    });
  });
}
```

Create `chat-widget.css`:

```css
#hlpfl-chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  font-family: Arial, sans-serif;
}

#chat-toggle {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

#chat-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

#chat-window {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  display: none;
  flex-direction: column;
  overflow: hidden;
}

#chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#chat-header h3 {
  margin: 0;
  font-size: 16px;
}

#chat-close {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
}

#chat-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background: #f9f9f9;
}

.message {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 80%;
}

.user-message {
  background: #667eea;
  color: white;
  margin-left: auto;
  text-align: right;
}

.bot-message {
  background: white;
  color: #333;
  border: 1px solid #e0e0e0;
}

.typing {
  color: #999;
  font-style: italic;
}

.typing span {
  animation: typing 1.4s infinite;
}

.typing span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }
}

.quick-actions {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.quick-action-btn {
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 15px;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

#chat-input-container {
  padding: 15px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 8px;
}

#chat-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
}

#chat-send {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}

#chat-send:hover {
  background: #5a6fd8;
}

/* Mobile responsive */
@media (max-width: 768px) {
  #chat-window {
    width: 300px;
    height: 400px;
    right: -20px;
  }
}
```

#### Step 3: Add to Your Website

Add this to your HTML:

```html
<!-- Add to your existing website -->
<head>
  <link rel="stylesheet" href="chat-widget.css">
</head>

<body>
  <!-- Your existing website content -->
  
  <!-- Chat widget will be automatically added here -->
  
  <script src="chat-widget.js"></script>
</body>
```

### Option 2: React Component

If your website uses React:

```jsx
// ChatWidget.jsx
import React, { useState, useEffect, useRef } from 'react';

const ChatWidget = ({ apiUrl = 'https://hlpfl-chatbot.your-subdomain.workers.dev' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText })
      });

      const data = await response.json();
      const botMessage = { text: data.response, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { 
        text: 'Sorry, I\'m having trouble connecting. Please try again later.', 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-widget">
      <button 
        className="chat-toggle" 
        onClick={() => setIsOpen(!isOpen)}
      >
        💬 Chat
      </button>
      
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>HLPFL Records</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}-message`}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="message bot-message typing">
                <span>●</span><span>●</span><span>●</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-input-container">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about our services..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
```

Add to your React app:

```jsx
import ChatWidget from './ChatWidget';

function App() {
  return (
    <div>
      {/* Your existing app content */}
      
      <ChatWidget apiUrl="https://hlpfl-chatbot.your-subdomain.workers.dev" />
    </div>
  );
}
```

## 🔧 Building This Project with Git & Cloudflare

### Step 1: Repository Structure

```
hlpflchatbot/
├── worker.js                    # Cloudflare Worker (API)
├── wrangler.toml               # Cloudflare configuration
├── chat-widget.js              # Frontend widget
├── chat-widget.css             # Widget styles
├── README.md                   # Documentation
└── examples/                   # Example implementations
    ├── html-example.html
    ├── react-example.jsx
    └── vue-example.vue
```

### Step 2: Git Workflow

```bash
# Clone the repository
git clone https://github.com/HLPFLCG/hlpflchatbot.git
cd hlpflchatbot

# Create API branch
git checkout -b api-deployment

# Add your worker code
git add worker.js wrangler.toml
git commit -m "Add Cloudflare Worker API"

# Add widget code
git add chat-widget.js chat-widget.css
git commit -m "Add frontend widget for embedding"

# Push to GitHub
git push origin api-deployment

# Create pull request to main
gh pr create --title "API-First Deployment" --body "Add API and embedding widget"
```

### Step 3: Automated Deployment

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install Wrangler
      run: npm install -g wrangler

    - name: Deploy to Cloudflare Workers
      run: wrangler deploy
      env:
        CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## 🌐 Domain Questions

### Do You Need a Domain?

**No, you don't need a domain for development/testing:**
- Cloudflare Workers provides a `.workers.dev` subdomain
- Perfect for development and testing
- Free to use

**Yes, you should get a domain for production:**
- More professional appearance
- Better SEO and branding
- SSL certificates included
- Custom API endpoints (api.hlpfl.org)

### Domain Setup Steps

1. **Get a Domain** (if you don't have one)
   - Namecheap, GoDaddy, Cloudflare Registrar
   - Cost: ~$10-15/year

2. **Add to Cloudflare**
   - Go to Cloudflare Dashboard
   - Add your domain
   - Update nameservers

3. **Configure API Subdomain**
   ```bash
   # Add to wrangler.toml
   routes = [
     { pattern = "api.hlpfl.org/*", zone_name = "hlpfl.org" }
   ]
   ```

## 🎯 Next Steps

### For Development
1. Deploy to Cloudflare Workers (no domain needed)
2. Test the API endpoints
3. Embed the widget in a test page
4. Iterate and improve

### For Production
1. Get a custom domain
2. Set up DNS in Cloudflare
3. Configure custom worker routes
4. Embed in your main website
5. Monitor performance and usage

### Advanced Features
1. **Analytics**: Track chat interactions
2. **Rate Limiting**: Prevent abuse
3. **Custom Styling**: Match your brand
4. **Multi-language**: Support different languages
5. **Voice Support**: Add speech-to-text

---

**Result**: A professional chatbot API that can be embedded in any website, with optional custom domain for production use!