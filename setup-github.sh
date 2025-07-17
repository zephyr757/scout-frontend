#!/bin/bash

# Scout Frontend - GitHub Repository Setup Script

echo "🚀 Setting up Scout Frontend for Cloudflare Pages deployment"

REPO_NAME="scout-frontend"
REPO_DESC="Scout Instagram Creator Monitoring Frontend - Cloudflare Pages Deployment"

echo ""
echo "📋 Repository Details:"
echo "   Name: $REPO_NAME"
echo "   Description: $REPO_DESC"
echo "   Visibility: Public (for free Cloudflare Pages)"

echo ""
echo "🔧 Option 1: Create via GitHub Web"
echo "   1. Go to: https://github.com/new"
echo "   2. Repository name: $REPO_NAME"
echo "   3. Description: $REPO_DESC"
echo "   4. Set to Public"
echo "   5. Don't initialize with README (we have one)"
echo "   6. Click 'Create repository'"

echo ""
echo "🔧 Option 2: Install GitHub CLI and create automatically"
echo "   brew install gh"
echo "   gh auth login"
echo "   gh repo create $REPO_NAME --description=\"$REPO_DESC\" --public"

echo ""
echo "📤 After creating the repository, run:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"

echo ""
echo "🎯 Current directory: $(pwd)"
echo "📁 Files ready for deployment:"
ls -la
