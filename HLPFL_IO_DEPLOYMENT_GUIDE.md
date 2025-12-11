# HLPFL.io Chatbot Deployment Guide

## Overview

This guide covers deploying the HLPFL Records chatbot API to `hlpfl.io` using Cloudflare Workers, enabling seamless integration with your main website at `hlpfl.org`.

## Architecture

```
Main Website: hlpfl.org (embed components)
     ↓ (API calls)
Chatbot API:  https://hlpfl.io/api/chat (Cloudflare Workers)
     ↓ (processing)
Backend: Cloudflare Worker with music industry knowledge base
```

## Prerequisites

### 1. Cloudflare Account Setup
- [Cloudflare Account](https://cloudflare.com/)
- [Cloudflare Workers](https://workers.cloudflare.com/) enabled
- Custom domain `hlpfl.io` added to Cloudflare
- DNS configured for `hlpfl.io`

### 2. Required Tokens & Secrets
- Cloudflare API Token with permissions:
  - Zone:Zone:Read (for hlpfl.io)
  - Zone:Zone:Edit (for hlpfl.io)
  - Account:Cloudflare Workers:Edit
  - User:User Details:Read

### 3. Development Environment
- Node.js 18+ installed
- Git installed
- Wrangler CLI (`npm install -g wrangler`)

## Quick Start (5-Minute Deployment)

### Option 1: Automatic Deployment (Recommended)

1. **Set up GitHub Secrets**:
   ```bash
   # In your GitHub repository settings:
   # Settings → Secrets and variables → Actions → New repository secret
   CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
   ```

2. **Push to Main Branch**:
   ```bash
   git add .
   git commit -m "Deploy chatbot to hlpfl.io"
   git push origin main
   ```

3. **Monitor Deployment**:
   - Go to: https://github.com/HLPFLCG/hlpflchatbot/actions
   - Watch the deployment progress
   - API will be live at: https://hlpfl.io/api/chat

### Option 2: Manual Deployment

1. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

2. **Deploy Using Script**:
   ```bash
   ./deploy-hlpfl-io.sh
   ```

3. **Verify Deployment**:
   ```bash
   curl https://hlpfl.io/api/health
   ```

## Detailed Setup

### Step 1: Domain Configuration

#### DNS Settings for hlpfl.io
Ensure your DNS is configured as follows:

```
Type: A
Name: @ (or hlpfl.io)
Content: 192.0.2.1 (Cloudflare proxy)
TTL: Auto
Proxy status: Proxied (orange cloud)
```

#### SSL Certificate
Cloudflare will automatically provide a free SSL certificate for `hlpfl.io`.

### Step 2: Cloudflare Workers Configuration

#### Update wrangler.toml
Your configuration should look like this:

```toml
name = "hlpfl-chatbot"
main = "worker.js"
compatibility_date = "2023-12-01"

[env.production]
routes = [
  { pattern = "hlpfl.io/api/*", zone_name = "hlpfl.io" }
]

[env.staging]
routes = [
  { pattern = "staging.hlpfl.io/api/*", zone_name = "hlpfl.io" }
]

[vars]
ENVIRONMENT = "production"
COMPANY_NAME = "HLPFL Records"
LOCATION = "Grand Rapids, Michigan"
```

### Step 3: Environment Variables

#### Production Environment
```bash
wrangler secret put OPENAI_API_KEY
# Enter your OpenAI API key when prompted

wrangler secret put ENVIRONMENT
# Enter: production
```

#### Staging Environment
```bash
wrangler secret put OPENAI_API_KEY --env staging
# Enter your OpenAI API key

wrangler secret put ENVIRONMENT --env staging
# Enter: staging
```

## API Endpoints

### Production
- **Chat API**: `https://hlpfl.io/api/chat`
- **Health Check**: `https://hlpfl.io/api/health`
- **API Docs**: `https://hlpfl.io/api/docs`
- **Services Info**: `https://hlpfl.io/api/services`

### Staging
- **Chat API**: `https://staging.hlpfl.io/api/chat`
- **Health Check**: `https://staging.hlpfl.io/api/health`
- **API Docs**: `https://staging.hlpfl.io/api/docs`
- **Services Info**: `https://staging.hlpfl.io/api/services`

## Testing the API

### Health Check
```bash
curl https://hlpfl.io/api/health
# Expected: {"status":"ok","timestamp":"2024-01-01T12:00:00.000Z"}
```

### Chat Test
```bash
curl -X POST https://hlpfl.io/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What services does HLPFL Records offer?",
    "conversationHistory": []
  }'
```

### API Documentation
Visit `https://hlpfl.io/api/docs` in your browser for interactive API documentation.

## Embedding Components in hlpfl.org

### React Component
```jsx
import ChatWidget from './components/ChatWidget.jsx';

function App() {
  return (
    <div>
      {/* Your website content */}
      <ChatWidget 
        apiUrl="https://hlpfl.io/api/chat"
        position="bottom-right"
        primaryColor="#667eea"
      />
    </div>
  );
}
```

### Vue Component
```vue
<template>
  <div>
    <!-- Your website content -->
    <ChatWidget 
      apiUrl="https://hlpfl.io/api/chat"
      position="bottom-right"
      primaryColor="#667eea"
    />
  </div>
</template>

<script>
import ChatWidget from './components/ChatWidget.vue';
export default {
  components: { ChatWidget }
}
</script>
```

### Universal JavaScript Widget
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="chat-widget.css">
</head>
<body>
  <!-- Your website content -->
  
  <script src="chat-widget.js"></script>
  <script>
    new HLPFLChatWidget({
      apiUrl: 'https://hlpfl.io/api/chat',
      position: 'bottom-right',
      primaryColor: '#667eea'
    });
  </script>
</body>
</html>
```

## CORS Configuration

The API is configured to accept requests from `hlpfl.org`. If you need to add additional domains:

```javascript
// In worker.js, update the CORS headers:
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://hlpfl.org',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

## Monitoring & Maintenance

### View Logs
```bash
# Real-time logs
wrangler tail

# Environment-specific logs
wrangler tail --env production
```

### Performance Monitoring
- Use Cloudflare Analytics: https://dash.cloudflare.com/analytics
- Monitor API response times
- Track error rates

### Health Monitoring
Set up automated health checks:
```bash
# Simple health check script
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" https://hlpfl.io/api/health)
if [ $response != "200" ]; then
  echo "API is down! HTTP status: $response"
  # Send alert (email, Slack, etc.)
fi
```

## Troubleshooting

### Common Issues

#### 1. DNS Propagation
```bash
# Check DNS status
dig hlpfl.io

# Should show Cloudflare IPs
```

#### 2. SSL Certificate Issues
```bash
# Check SSL status
curl -I https://hlpfl.io

# Look for: 200 OK and valid certificates
```

#### 3. Worker Deployment Issues
```bash
# Check worker status
wrangler deployments list

# View deployment logs
wrangler tail
```

#### 4. CORS Errors
- Verify the `Access-Control-Allow-Origin` header
- Check that requests are coming from allowed domains
- Ensure preflight OPTIONS requests are handled

#### 5. API Response Issues
```bash
# Test with curl for debugging
curl -v -X POST https://hlpfl.io/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

### Error Codes & Solutions

| Error Code | Description | Solution |
|------------|-------------|----------|
| 404 | API endpoint not found | Check URL path and routing configuration |
| 405 | Method not allowed | Ensure POST method for chat endpoint |
| 429 | Rate limit exceeded | Implement rate limiting or upgrade plan |
| 500 | Internal server error | Check worker logs and OpenAI API status |
| 503 | Service unavailable | Check Cloudflare Workers status |

## Security Considerations

### API Security
- Rate limiting implemented in the worker
- Input validation and sanitization
- Secure handling of conversation history

### Environment Variables
- Store API keys as Cloudflare secrets
- Never commit secrets to Git
- Rotate keys regularly

### HTTPS Enforcement
- All requests must use HTTPS
- Cloudflare automatically redirects HTTP to HTTPS

## Scaling & Performance

### Auto-Scaling
Cloudflare Workers automatically scale based on demand:
- No servers to manage
- Automatic load balancing
- Global edge network

### Performance Optimization
- Responses cached at edge when appropriate
- Minimal latency through global distribution
- Efficient JavaScript code execution

### Rate Limits
- Free tier: 100,000 requests/day
- Paid tiers: Higher limits available
- Implement client-side rate limiting

## Backup & Recovery

### Code Backup
- Code is stored in GitHub repository
- Multiple deployment environments (staging/production)
- Git history for rollback capability

### Data Backup
- Conversation logs (if implemented)
- Analytics data in Cloudflare
- Configuration backups

### Disaster Recovery
- Quick redeployment from GitHub
- Environment separation prevents issues
- Automated CI/CD pipeline

## Advanced Configuration

### Custom Domains
Add additional domains in `wrangler.toml`:
```toml
[env.production]
routes = [
  { pattern = "hlpfl.io/api/*", zone_name = "hlpfl.io" },
  { pattern = "api.your-domain.com/*", zone_name = "your-domain.com" }
]
```

### Analytics Integration
Add custom analytics:
```javascript
// In worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
  
  // Track usage
  trackAPICall(event.request);
});
```

### Custom Responses
Modify response format in `worker.js`:
```javascript
return new Response(JSON.stringify({
  response: botResponse,
  suggestions: ["Custom suggestion 1", "Custom suggestion 2"],
  metadata: {
    timestamp: new Date().toISOString(),
    requestId: generateRequestId()
  }
}), { headers: corsHeaders });
```

## Support & Resources

### Documentation
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Repository](https://github.com/HLPFLCG/hlpflchatbot)

### Community
- Cloudflare Discord Community
- Stack Overflow tags: `cloudflare-workers`, `wrangler`
- GitHub Issues for this project

### Emergency Contacts
- Cloudflare Support: https://support.cloudflare.com/
- GitHub Issues: https://github.com/HLPFLCG/hlpflchatbot/issues

---

## Deployment Checklist

Before going live with `hlpfl.io/api/chat`:

- [ ] DNS configured for hlpfl.io
- [ ] SSL certificate active
- [ ] Cloudflare API token configured
- [ ] Environment variables set
- [ ] Staging deployment tested
- [ ] Production deployment verified
- [ ] CORS headers configured
- [ ] Health checks passing
- [ ] Components embedded in hlpfl.org
- [ ] Monitoring and alerting set up
- [ ] Documentation updated
- [ ] Team trained on troubleshooting

Once complete, your chatbot API will be fully operational at `https://hlpfl.io/api/chat` and ready to serve visitors to `hlpfl.org`!