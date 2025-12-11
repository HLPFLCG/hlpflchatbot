#!/bin/bash

echo "🔍 Testing hlpfl.io configuration..."

# Test 1: Check if hlpfl.io resolves
echo "1. Testing DNS resolution..."
if nslookup hlpfl.io > /dev/null 2>&1; then
    echo "✅ hlpfl.io resolves"
else
    echo "❌ hlpfl.io doesn't resolve - check DNS"
fi

# Test 2: Check if it's on Cloudflare
echo "2. Testing Cloudflare connection..."
if curl -I -s https://hlpfl.io | grep -i "cloudflare" > /dev/null; then
    echo "✅ hlpfl.io is behind Cloudflare"
else
    echo "❌ hlpfl.io not detected on Cloudflare"
fi

# Test 3: Check current API status
echo "3. Testing current API status..."
if curl -s https://hlpfl.io/api/health > /dev/null 2>&1; then
    echo "✅ API is responding"
else
    echo "❌ API not responding - needs deployment"
fi

echo ""
echo "📋 Next steps:"
echo "1. Deploy manually with: wrangler deploy --env production"
echo "2. Or use Cloudflare dashboard GitHub integration"
echo "3. Test with: curl https://hlpfl.io/api/health"
