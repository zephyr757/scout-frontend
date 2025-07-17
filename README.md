# Scout Frontend - Cloudflare Pages Deployment

This repository contains the Scout Instagram Creator Monitoring frontend, optimized for deployment on Cloudflare Pages.

## 🚀 Architecture

- **Frontend**: Cloudflare Pages (this repo)
- **Backend**: Your home server via Cloudflare Tunnel
- **Database**: PostgreSQL on your NAS
- **Images**: Stored on your local server

## 📦 Deployment

This repository is automatically deployed to Cloudflare Pages:

- **Production**: `https://scout.ozdust.me`
- **Staging**: Auto-generated preview URLs for PRs

## 🔧 Environment Variables

Production environment variables are configured in Cloudflare Pages dashboard:

```
VITE_API_URL=https://api.ozdust.me
VITE_APP_ENV=production
```

## 🛠 Development

To run locally:

```bash
npm install
npm run dev
```

For production build:

```bash
npm run build
npm run preview
```

## 📋 Build Settings (Cloudflare Pages)

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node.js version**: `18`

## 🔗 Related Repositories

- Main Scout Project: `/Volumes/docker/scout-project`
- Backend: Scout backend runs on your home server
