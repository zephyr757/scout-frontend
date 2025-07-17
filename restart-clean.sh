#!/bin/bash
echo "🧹 Clearing Vite cache and restarting Scout..."

# Clear node_modules cache
rm -rf node_modules/.vite

# Clear any dist builds
rm -rf dist

# Restart with fresh cache
npm run dev