# İşBul Backend API

Modern, scalable backend API for İşBul platform.

## 🚀 Quick Start

### Local Development
```bash
npm install
cp .env.example .env
npm run dev
```

### Production (Render.com)
Automatically deploys from GitHub.

## 📚 API Documentation

**Health Check:** `/api/health`
**Swagger Docs:** `/api/docs`
**Base URL:** `/api/v1`

## 🔐 Environment Variables

Required:
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - JWT signing key
- `FRONTEND_URL` - CORS origin

Optional:
- `DATABASE_URL` - PostgreSQL connection (for Supabase)
- `GOOGLE_CLIENT_ID` - Google OAuth
- `GOOGLE_CLIENT_SECRET` - Google OAuth

## 📦 Tech Stack

- Node.js + Express
- SQLite (development) / PostgreSQL (production)
- JWT Authentication
- Passport.js (Google OAuth)
- Swagger API Docs
