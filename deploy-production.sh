#!/bin/bash

# Production Deployment Script for HLPFL Chatbot
# Deploys enhanced worker with safety checks

set -e

echo "=========================================="
echo "HLPFL Chatbot Production Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Error: Wrangler CLI not found${NC}"
    echo "Install with: npm install -g wrangler"
    exit 1
fi

echo -e "${GREEN}✓${NC} Wrangler CLI found"

# Check if logged in
if ! wrangler whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Cloudflare${NC}"
    echo "Please run: wrangler login"
    exit 1
fi

echo -e "${GREEN}✓${NC} Authenticated with Cloudflare"
echo ""

# Show current configuration
echo "📋 Deployment Configuration:"
echo "   Worker: worker-enhanced.js"
echo "   Environment: production"
echo "   Domain: hlpfl.io"
echo ""

# Confirm deployment
read -p "🚀 Deploy to production? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Deployment cancelled${NC}"
    exit 1
fi

echo ""
echo "🚀 Deploying to production..."
echo ""

# Deploy
if wrangler deploy --env production; then
    echo ""
    echo "=========================================="
    echo -e "${GREEN}✅ Deployment Successful!${NC}"
    echo "=========================================="
    echo ""
    echo "🌐 Your chatbot is now live at:"
    echo "   https://hlpfl.io/"
    echo ""
    echo "📡 API Endpoints:"
    echo "   https://hlpfl.io/api/health"
    echo "   https://hlpfl.io/api/company"
    echo "   https://hlpfl.io/api/artists"
    echo "   https://hlpfl.io/api/chat"
    echo ""
    echo "🧪 Test your deployment:"
    echo "   ./test-enhanced-api.sh https://hlpfl.io"
    echo ""
    echo "📊 View logs:"
    echo "   wrangler tail --env production"
    echo ""
else
    echo ""
    echo "=========================================="
    echo -e "${RED}❌ Deployment Failed${NC}"
    echo "=========================================="
    echo ""
    echo "Check the error messages above for details."
    echo "You can try again or contact support."
    exit 1
fi