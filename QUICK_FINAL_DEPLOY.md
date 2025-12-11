# Final Deployment: hlpfl.io Chatbot

## Step 1: Deploy to Cloudflare Workers

### Option A: Quick Dashboard Deploy (5 minutes)

1. **Go to**: https://dash.cloudflare.com/workers/
2. **Create Worker** → "Create Worker"
3. **Name**: `hlpfl-chatbot`
4. **Click** "Deploy"
5. **Edit Code** → Delete default code
6. **Get worker.js**: https://github.com/HLPFLCG/hlpflchatbot/blob/main/worker.js
7. **Copy-paste entire worker.js** into the editor
8. **Deploy**

### Option B: Command Line Deploy

```bash
npm install -g wrangler
wrangler login
git clone https://github.com/HLPFLCG/hlpflchatbot.git
cd hlpflchatbot
wrangler deploy
```

## Step 2: Configure Custom Domain

1. **In Cloudflare Dashboard**: Go to your worker
2. **Settings** → "Triggers" → "Custom Domains"
3. **Add domain**: `hlpfl.io`
4. **Route pattern**: `hlpfl.io/api/*`

## Step 3: Test API

```bash
# Test health
curl https://hlpfl.io/api/health

# Test chat
curl -X POST https://hlpfl.io/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello!"}'
```

Expected response: `{"status":"ok"}` and chat response