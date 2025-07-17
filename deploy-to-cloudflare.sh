#!/bin/bash

# Scout Frontend - Complete Cloudflare Pages Deployment Script

echo "🚀 Scout Frontend Deployment to Cloudflare Pages"
echo "================================================"

# Configuration
REPO_NAME="scout-frontend"
GITHUB_USERNAME="" # Will be filled after auth
PROJECT_NAME="scout-frontend"
DOMAIN="scout.ozdust.me"
API_DOMAIN="api.ozdust.me"

echo ""
echo "📋 Deployment Overview:"
echo "   Repository: $REPO_NAME"
echo "   Cloudflare Project: $PROJECT_NAME"
echo "   Production URL: https://$DOMAIN"
echo "   API Endpoint: https://$API_DOMAIN"

# Check GitHub authentication
echo ""
echo "🔐 Checking GitHub Authentication..."
if gh auth status &>/dev/null; then
    echo "✅ GitHub CLI authenticated"
    GITHUB_USERNAME=$(gh api user --jq '.login')
    echo "   Username: $GITHUB_USERNAME"
else
    echo "❌ GitHub authentication required"
    echo "   Run: gh auth login"
    echo "   Use code: 774A-FA82"
    echo "   URL: https://github.com/login/device"
    exit 1
fi

# Create GitHub repository
echo ""
echo "📦 Creating GitHub Repository..."
if gh repo create $REPO_NAME --description="Scout Instagram Creator Monitoring Frontend - Cloudflare Pages Deployment" --public; then
    echo "✅ Repository created: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
else
    echo "ℹ️  Repository may already exist"
fi

# Configure git remote
echo ""
echo "🔗 Configuring Git Remote..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
git branch -M main

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
if git push -u origin main; then
    echo "✅ Code pushed to GitHub"
else
    echo "❌ Push failed - check authentication"
    exit 1
fi

echo ""
echo "🎯 Next Steps for Cloudflare Pages Setup:"
echo "========================================"
echo ""
echo "1. 🌐 Open Cloudflare Dashboard:"
echo "   https://dash.cloudflare.com"
echo ""
echo "2. 📄 Go to Pages:"
echo "   Workers & Pages → Pages → Create a project"
echo ""
echo "3. 🔗 Connect to Git:"
echo "   - Connect to Git"
echo "   - Select GitHub"
echo "   - Choose: $GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "4. ⚙️  Build Settings:"
echo "   - Framework preset: React"
echo "   - Build command: npm run build"
echo "   - Build output directory: dist"
echo "   - Root directory: (leave empty)"
echo "   - Node.js version: 18"
echo ""
echo "5. 🌍 Environment Variables:"
echo "   Add these in Pages settings:"
echo "   - VITE_API_URL = https://$API_DOMAIN"
echo "   - VITE_APP_ENV = production"
echo ""
echo "6. 🔗 Custom Domain Setup:"
echo "   - Pages → Settings → Custom domains"
echo "   - Add: $DOMAIN"
echo "   - DNS will be auto-configured"
echo ""
echo "7. 🔒 Setup API Tunnel (for backend access):"
echo "   Run: ./setup-api-tunnel.sh"
echo ""
echo "📝 Repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "🎉 Ready for Cloudflare Pages deployment!"
