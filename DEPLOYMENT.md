# Deployment Guide

## Critical Issues Fixed

### 🔴 bun.lock Conflict (RESOLVED)

- **Problem**: Package manager conflict between bun.lock and npm package-lock.json
- **Solution**: Removed bun.lock file to ensure Vercel uses npm
- **Impact**: Fixes "Module not found" errors during Vercel build

### 🟡 Environment Configuration (RESOLVED)

- **Problem**: Frontend .env had duplicate values and stray database URL
- **Solution**: Cleaned up .env and created .env.example files
- **Impact**: Prevents configuration confusion during deployment

---

## Deployment Checklist

### Frontend (Vercel)

#### Build Configuration

- Framework: Next.js 14.2.35
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)

#### Required Environment Variables

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=77675829736-cou1kcr2umf1hiu5t5maoj65he01vvho.apps.googleusercontent.com
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com  # Update to production backend
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyD-aCOhRZO_gp_FjozkkPIyn4lriD-0YWc
```

#### Steps

1. Connect GitHub repository to Vercel
2. Select `frontend` as root directory
3. Add environment variables in Vercel dashboard
4. Deploy

---

### Backend (Vercel / Render / Railway)

#### Required Environment Variables

```
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_ACCESS_SECRET=your_secret_key
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN=your_refresh_secret
JWT_REFRESH_TOKEN_EXPIRY=1d

# Google OAuth
GOOGLE_CLIENT_ID=77675829736-...
GOOGLE_CLIENT_SECRET=your_secret

# CORS
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Server
PORT=4000
```

#### Post-Deployment

1. Run migrations: `npm run migrate`
2. Seed admin user: `npm run seed`
3. Verify endpoints with curl or Postman

---

## Common Issues & Solutions

### Issue: "Module not found: Can't resolve '@tanstack/react-query'"

**Cause**: bun.lock conflicts with npm  
**Solution**: Removed bun.lock from repository  
**Status**: ✅ FIXED

### Issue: Build takes too long

**Cause**: First build optimizes Next.js app  
**Solution**: Builds are cached after first deployment  
**Expected**: 2-3 minutes for first build, <1 minute for subsequent

### Issue: API calls to localhost:4000

**Cause**: Frontend env var points to local development server  
**Solution**: Update NEXT_PUBLIC_API_BASE_URL to production backend URL  
**Time to Fix**: 1 minute

---

## Verification

### After Frontend Deploy

```bash
# Check environment variables are loaded
curl https://your-frontend-domain.vercel.app -I
# Should see Next.js response headers

# Verify API communication
curl -X POST https://your-frontend-domain.vercel.app/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token":"..."}'
```

### After Backend Deploy

```bash
# Check health
curl https://your-backend-domain.com/api/products -I

# Verify database connection
curl https://your-backend-domain.com/api/products | jq .

# Test authentication
curl -X POST https://your-backend-domain.com/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token":"test_token"}'
```

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│           Frontend (Vercel)                      │
│  Next.js 14 + React 18 + Tailwind + shadcn/ui  │
│  @tanstack/react-query, Google Maps, OAuth2    │
└──────────────┬──────────────────────────────────┘
               │
               │ API Calls (REST)
               │
┌──────────────▼──────────────────────────────────┐
│    Backend (Render/Railway/Vercel)               │
│  Express.js + TypeScript + Prisma + PostgreSQL │
│  JWT Auth, Google OAuth, Order Management      │
└─────────────────────────────────────────────────┘
```

---

## Contact & Support

For deployment issues:

1. Check Vercel build logs
2. Review environment variables
3. Verify database connectivity
4. Check CORS configuration
