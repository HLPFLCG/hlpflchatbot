# 🤖 AI Studio Deployment Guide

## 🚫 The Issue

Ninja Cline AI Studio has limitations with:
- Browser-based authentication (Cloudflare login requires this)
- External service connections
- Interactive prompts

## ✅ **Solution 1: GitHub Actions (Recommended)**

### Step 1: Get Cloudflare API Token
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Choose "Custom token"
4. Permissions: `Cloudflare Workers:Edit`
5. Account Resources: Include your account
6. Click "Create token"
7. Copy the token

### Step 2: Add to GitHub Secrets
1. Go to: https://github.com/HLPFLCG/hlpflchatbot/settings/secrets/actions
2. Click "New repository secret"
3. Name: `CLOUDFLARE_API_TOKEN`
4. Value: Paste your Cloudflare API token
5. Click "Add secret"

### Step 3: Deploy Automatically
Just push to the main branch:
```bash
# Make any changes to your code
git add .
git commit -m "Update chatbot responses"
git push origin main
```

**That's it!** GitHub Actions will automatically deploy your API.

## ✅ **Solution 2: API Token in AI Studio**

If you want to deploy directly from the AI Studio:

```bash
# 1. Get your Cloudflare API token (from step 1 above)
# 2. Set environment variable
export CLOUDFLARE_API_TOKEN="your_token_here"

# 3. Deploy
wrangler deploy
```

## ✅ **Solution 3: Manual Dashboard Deployment**

1. Go to Cloudflare Dashboard → Workers & Pages
2. Click "Create Application" → "Create Worker"
3. Copy the entire content of `worker.js`
4. Paste into the Cloudflare editor
5. Click "Save and Deploy"
6. Your API will be at the provided URL

## 🎯 **Recommended Workflow**

Since you're using AI Studio:

1. **Development**: Edit code in AI Studio
2. **Version Control**: Push changes to GitHub
3. **Deployment**: GitHub Actions deploys automatically
4. **Testing**: Use the provided API URL

This way you never have to leave the AI Studio environment for deployment!

## 🔍 **Monitor Deployment**

After setting up GitHub Actions, you can:
1. Go to: https://github.com/HLPFLCG/hlpflchatbot/actions
2. See deployment status and logs
3. Get your API URL from the workflow output

## 📱 **Test Your API**

Once deployed, test with:
```bash
# Health check
curl https://your-worker-url.workers.dev/api/health

# Chat test
curl -X POST https://your-worker-url.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello from AI Studio"}'
```

---

**The GitHub Actions method is the most reliable for AI Studio environments!** 🚀