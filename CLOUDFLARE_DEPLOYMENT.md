# ☁️ GitHub + Cloudflare Deployment Guide

This guide shows you how to deploy the HLPFL Chatbot using GitHub for source control and Cloudflare for hosting.

## 🎯 Why GitHub + Cloudflare?

- **GitHub**: Free source control with automated deployments
- **Cloudflare**: Free hosting with global CDN, SSL, and edge computing
- **Cost**: $0 for both services
- **Performance**: Excellent with Cloudflare's global network
- **SSL**: Automatic SSL certificates
- **CI/CD**: Automated deployments from GitHub

## 📋 Prerequisites

- GitHub account (already have)
- Cloudflare account (free at cloudflare.com)
- Custom domain (optional, but recommended)
- Node.js installed locally for testing

## 🚀 Deployment Options

### Option 1: Cloudflare Pages (Recommended - Free)

Perfect for static sites with serverless functions.

#### Step 1: Prepare Your Repository

```bash
# Make sure your code is up to date
cd hlpflchatbot
git add .
git commit -m "Update for Cloudflare deployment"
git push origin main
```

#### Step 2: Setup Cloudflare Pages

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Sign up/login to your account

2. **Create Pages Project**
   - Click "Pages" in the left sidebar
   - Click "Create a project"
   - Connect to GitHub

3. **Configure Build Settings**
   ```
   Framework preset: React
   Build command: cd client && npm run build
   Build output directory: client/build
   Root directory: /
   ```

4. **Environment Variables**
   ```
   NODE_ENV: production
   API_URL: https://your-domain.workers.dev
   ```

#### Step 3: Deploy Serverless Functions

Create `functions/api/chat.js`:

```javascript
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { message, conversationHistory = [] } = await request.json();
    
    // Import your chatbot logic
    const { classifyIntent, generateResponse } = await import('../server/utils/chatbotLogic.js');
    const knowledgeBase = await import('../server/data/knowledgeBase.js');
    
    const intent = classifyIntent(message);
    const response = generateResponse(intent, message, conversationHistory);
    
    return new Response(JSON.stringify({
      response: response.text,
      intent: intent.name,
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
```

Create `wrangler.toml`:

```toml
name = "hlpfl-chatbot"
main = "functions/_worker.js"
compatibility_date = "2023-12-01"

[env.production]
vars = { ENVIRONMENT = "production" }
```

### Option 2: GitHub + Cloudflare Workers (Advanced)

For full serverless deployment.

#### Step 1: Create Worker Script

```javascript
// worker.js
import { classifyIntent, generateResponse } from './server/utils/chatbotLogic.js';
import knowledgeBase from './server/data/knowledgeBase.js';

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
    
    // API routes
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { message, conversationHistory = [] } = await request.json();
        const intent = classifyIntent(message);
        const response = generateResponse(intent, message, conversationHistory);
        
        return new Response(JSON.stringify({
          response: response.text,
          intent: intent.name,
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
    
    // Health check
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Serve static files (for hosting the React app)
    return new Response('Chatbot API is running', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};
```

#### Step 2: Deploy Worker

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy worker
wrangler deploy hlpfl-chatbot
```

### Option 3: GitHub + Cloudflare CDN (Easiest)

Use GitHub Pages for hosting and Cloudflare for CDN/proxy.

#### Step 1: Deploy to GitHub Pages

```bash
# Build the app
cd client
npm run build

# Deploy to gh-pages
git checkout -b gh-pages
rm -rf *
cp -r build/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

#### Step 2: Configure Cloudflare

1. **Add Custom Domain to Cloudflare**
   - Add your domain to Cloudflare dashboard
   - Update nameservers as instructed

2. **Configure DNS**
   ```
   Type: CNAME
   Name: www (or your subdomain)
   Target: HLPFLCG.github.io
   Proxy: Enabled (orange cloud)
   ```

3. **Page Rules (Optional)**
   - Cache everything for better performance
   - Redirect HTTP to HTTPS

## 🔧 Configuration

### Update React App for Cloudflare

In `client/src/App.tsx`, update the API URL:

```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-worker-name.your-subdomain.workers.dev'
  : 'http://localhost:3000';

// Update fetch calls
const response = await fetch(`${API_BASE_URL}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, conversationHistory })
});
```

### Environment Variables

Create `.env.production`:

```
REACT_APP_API_URL=https://your-worker-name.workers.dev
```

## 🧪 Testing

### Local Testing with Wrangler

```bash
# Start local development
wrangler dev

# Test your API
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

### Production Testing

1. **Deploy to Cloudflare**
2. **Test the API endpoint**
3. **Test the frontend**
4. **Check browser console for errors**

## 📊 Monitoring

### Cloudflare Analytics

1. Go to Cloudflare Dashboard
2. Select your domain
3. View Analytics & Logs
4. Monitor API requests and performance

### Health Checks

Your chatbot includes a health endpoint:
```
GET /api/health
```

## 🔒 Security Considerations

- **CORS**: Properly configured for your domain
- **Rate Limiting**: Configure in Cloudflare Dashboard
- **Input Validation**: Already included in the chatbot
- **SSL**: Automatic with Cloudflare

## 🚀 Custom Domain Setup

### Step 1: Add Domain to Cloudflare

1. In Cloudflare Dashboard, click "Add site"
2. Enter your domain name
3. Choose the free plan
4. Update nameservers as instructed

### Step 2: Configure DNS

```
# For Cloudflare Pages
Type: CNAME
Name: chat (or your preferred subdomain)
Target: pages.dev
Proxy: Enabled

# For Workers
Type: CNAME
Name: api
Target: your-worker.workers.dev
Proxy: Enabled
```

### Step 3: Update Configuration

Update your React app to use your custom domain:
```typescript
const API_BASE_URL = 'https://api.yourdomain.com';
```

## 💡 Pro Tips

1. **Use Subdomains**: `chat.yourdomain.com` for the app, `api.yourdomain.com` for the API
2. **Enable Caching**: Configure Cloudflare caching rules
3. **Monitor Usage**: Keep an eye on Cloudflare's free tier limits
4. **Backup**: Your code is already safe on GitHub

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```javascript
   // Make sure your worker includes proper CORS headers
   headers: {
     'Access-Control-Allow-Origin': 'https://yourdomain.com',
     'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
   }
   ```

2. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules client/node_modules
   npm run install-all
   npm run build
   ```

3. **Deployment Failures**
   - Check Cloudflare logs
   - Verify environment variables
   - Ensure build command is correct

## 📞 Support

- **Cloudflare Documentation**: https://developers.cloudflare.com
- **GitHub Pages Documentation**: https://docs.github.com/en/pages
- **Community Forums**: Both platforms have active communities

---

**🎉 Result**: Your HLPFL chatbot will be running on Cloudflare's global network with excellent performance and zero hosting costs!