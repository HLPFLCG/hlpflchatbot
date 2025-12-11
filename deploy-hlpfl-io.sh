#!/bin/bash

# HLPFL.io Chatbot Deployment Script
# Deploys the chatbot API to hlpfl.io domain using Cloudflare Workers

set -e

echo "🚀 Starting HLPFL.io Chatbot Deployment"

# Check if Wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if user is logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Please login to Cloudflare:"
    wrangler login
fi

# Validate environment
echo "🔍 Validating deployment configuration..."

# Check if wrangler.toml exists
if [ ! -f "wrangler.toml" ]; then
    echo "❌ wrangler.toml not found!"
    exit 1
fi

# Test the worker locally first
echo "🧪 Testing worker locally..."
wrangler dev --local --port 8787 &
DEV_PID=$!

# Wait for worker to start
sleep 5

# Test health endpoint
echo "🏥 Testing health endpoint..."
curl -f http://localhost:8787/api/health || {
    echo "❌ Health check failed!"
    kill $DEV_PID
    exit 1
}

# Stop local development
kill $DEV_PID

# Deploy to staging first
echo "🚀 Deploying to staging environment..."
wrangler deploy --env staging

# Test staging deployment
echo "🧪 Testing staging deployment..."
STAGING_URL="https://staging.hlpfl.io/api/health"
for i in {1..10}; do
    if curl -f $STAGING_URL; then
        echo "✅ Staging deployment successful!"
        break
    fi
    echo "⏳ Waiting for staging deployment... (attempt $i/10)"
    sleep 10
done

# Deploy to production
echo "🚀 Deploying to production environment..."
wrangler deploy --env production

# Test production deployment
echo "🧪 Testing production deployment..."
PROD_URL="https://hlpfl.io/api/health"
for i in {1..10}; do
    if curl -f $PROD_URL; then
        echo "✅ Production deployment successful!"
        break
    fi
    echo "⏳ Waiting for production deployment... (attempt $i/10)"
    sleep 10
done

# Test chat endpoint
echo "💬 Testing chat endpoint..."
curl -X POST $PROD_URL/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello, this is a test"}' || {
    echo "❌ Chat endpoint test failed!"
    exit 1
}

echo "🎉 Deployment completed successfully!"
echo "📍 Your API is now available at: https://hlpfl.io/api/chat"
echo ""
echo "📋 Next Steps:"
echo "1. Update your website's DNS if needed"
echo "2. Test the embedded components on hlpfl.org"
echo "3. Monitor the API health and performance"
echo ""
echo "🔧 Useful Commands:"
echo "- View logs: wrangler tail"
echo "- Check status: curl https://hlpfl.io/api/health"
echo "- Test chat: curl -X POST https://hlpfl.io/api/chat -d '{&quot;message&quot;:&quot;test&quot;}'"