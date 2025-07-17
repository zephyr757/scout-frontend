#!/bin/bash

# Scout API Tunnel Setup - Connect Home Server to Cloudflare
# This creates a secure tunnel from Cloudflare to your Scout backend

echo "🔒 Scout API Tunnel Setup"
echo "========================"

API_DOMAIN="api.ozdust.me"
LOCAL_API="http://localhost:3001"

echo ""
echo "📋 Tunnel Configuration:"
echo "   External: https://$API_DOMAIN"
echo "   Internal: $LOCAL_API"
echo "   Purpose: Secure access to Scout backend"

# Check if cloudflared is installed
echo ""
echo "🔍 Checking Cloudflare Tunnel..."
if command -v cloudflared &> /dev/null; then
    echo "✅ cloudflared is installed"
else
    echo "📦 Installing cloudflared..."
    if command -v brew &> /dev/null; then
        brew install cloudflared
    else
        echo "❌ Homebrew not found. Installing manually..."
        curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64 -o /usr/local/bin/cloudflared
        chmod +x /usr/local/bin/cloudflared
    fi
fi

# Authenticate with Cloudflare
echo ""
echo "🔐 Cloudflare Authentication Required:"
echo "   1. Run: cloudflared tunnel login"
echo "   2. This will open your browser"
echo "   3. Select the ozdust.me zone"
echo "   4. Authorize the tunnel"

read -p "Press Enter after completing authentication..."

# Create tunnel
echo ""
echo "🚇 Creating tunnel..."
TUNNEL_NAME="scout-api"
cloudflared tunnel create $TUNNEL_NAME

# Get tunnel ID
TUNNEL_ID=$(cloudflared tunnel list | grep $TUNNEL_NAME | awk '{print $1}')
echo "✅ Tunnel created: $TUNNEL_ID"

# Create tunnel configuration
echo ""
echo "📝 Creating tunnel configuration..."
mkdir -p ~/.cloudflared

cat > ~/.cloudflared/config.yml << EOF
tunnel: $TUNNEL_ID
credentials-file: ~/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: $API_DOMAIN
    service: $LOCAL_API
    originRequest:
      httpHostHeader: localhost:3001
  - service: http_status:404
EOF

echo "✅ Configuration created at ~/.cloudflared/config.yml"

# Create DNS record
echo ""
echo "🌐 Creating DNS record..."
cloudflared tunnel route dns $TUNNEL_NAME $API_DOMAIN

echo ""
echo "🎯 Starting tunnel test..."
echo "   This will run the tunnel for 30 seconds to test connectivity"
echo "   You should be able to access: https://$API_DOMAIN"

# Start tunnel in background for testing
cloudflared tunnel run $TUNNEL_NAME &
TUNNEL_PID=$!

echo "⏳ Testing for 30 seconds..."
sleep 30

# Test the tunnel
echo ""
echo "🧪 Testing API access..."
if curl -s -f https://$API_DOMAIN/api/health > /dev/null; then
    echo "✅ API tunnel is working!"
    echo "   Test URL: https://$API_DOMAIN/api/health"
else
    echo "⚠️  API tunnel test failed - may need time to propagate"
fi

# Stop test tunnel
kill $TUNNEL_PID 2>/dev/null

echo ""
echo "🚀 Production Tunnel Setup:"
echo "=========================="
echo ""
echo "To run the tunnel permanently:"
echo "   cloudflared tunnel run $TUNNEL_NAME"
echo ""
echo "To run as a service (recommended):"
echo "   sudo cloudflared service install"
echo "   sudo launchctl start com.cloudflare.cloudflared"
echo ""
echo "📊 Monitor tunnel status:"
echo "   cloudflared tunnel list"
echo "   cloudflared tunnel info $TUNNEL_NAME"
echo ""
echo "🔗 Your API is now accessible at:"
echo "   https://$API_DOMAIN"
echo ""
echo "🎉 Tunnel setup complete!"
echo "   Next: Update Scout frontend to use https://$API_DOMAIN"
