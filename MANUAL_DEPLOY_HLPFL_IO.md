# Manual Deployment: hlpfl.io Chatbot

## Quick Setup Guide

### Step 1: Install Wrangler
```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare
```bash
wrangler login
# This will open your browser to authenticate
```

### Step 3: Verify Configuration
```bash
# Check your wrangler.toml is valid
cat wrangler.toml

# Test Cloudflare connection
wrangler whoami
```

### Step 4: Deploy to Staging First
```bash
wrangler deploy --env staging
```

### Step 5: Test Staging
```bash
# Wait 30 seconds for deployment to propagate
sleep 30

# Test staging API
curl https://staging.hlpfl.io/api/health

# Test staging chat
curl -X POST https://staging.hlpfl.io/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello from staging!"}'
```

### Step 6: Deploy to Production
```bash
wrangler deploy --env production
```

### Step 7: Test Production
```bash
# Wait 30 seconds for deployment to propagate
sleep 30

# Test production API
curl https://hlpfl.io/api/health

# Test production chat
curl -X POST https://hlpfl.io/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello from hlpfl.io!"}'
```

## Troubleshooting

### If DNS doesn't work:
1. Make sure hlpfl.io is in your Cloudflare account
2. Check DNS settings point to Cloudflare
3. Wait 5-10 minutes for DNS propagation

### If deployment fails:
1. Check wrangler.toml syntax
2. Verify hlpfl.io zone exists in Cloudflare
3. Check API token permissions

### If API returns 404:
1. Check routing pattern in wrangler.toml
2. Verify worker deployed successfully
3. Check custom domain configuration

## Expected URLs
- Staging: https://staging.hlpfl.io/api/chat
- Production: https://hlpfl.io/api/chat
- Health: https://hlpfl.io/api/health
- Docs: https://hlpfl.io/api/docs