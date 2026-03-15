# BioCycle - Vercel Deployment Guide

## 🚀 Quick Start

This guide covers optimizations and deployment of BioCycle to Vercel for production use with super-fast loading and response times.

## ✅ Optimizations Implemented

### Backend Optimizations

1. **Compression Middleware**
   - Gzip compression for responses > 1KB
   - Reduces payload size by 60-80%

2. **Response Caching**
   - GET requests cached for 5 minutes (client) / 10 minutes (CDN)
   - Reduces database queries

3. **Connection Pooling**
   - Optimized for serverless (max 5 connections)
   - Auto-eviction of idle connections after 15 seconds
   - Prevents connection exhaustion

4. **Request Deduplication**
   - Identical GET requests within 5 seconds return cached response
   - Particularly useful for rapid/redundant API calls

5. **Database Query Optimization**
   - Set isolation level to READ_COMMITTED (faster)
   - Automatic connection retry (max 3 attempts)

6. **Security Headers**
   - Content Security Policy (CSP)
   - X-Frame-Options, X-XSS-Protection
   - All handled by Helmet.js

### Frontend Optimizations

1. **Code Splitting**
   - Separate vendor chunks for React, UI libraries, forms
   - Lazy loading of routes
   - Better caching with immutable chunks

2. **Build Optimizations**
   - Terser minification with console removal
   - No source maps in production
   - CSS code splitting enabled

3. **Asset Caching**
   - Assets cached for 1 year (immutable)
   - HTML cached for 1 hour
   - Optimal cache headers set

4. **Performance Monitoring**
   - Response time tracking on backend
   - Slow API detection (> 1 second)

## 📋 Prerequisites

- GitHub account with BioCycle repository
- Vercel account (https://vercel.com)
- PostgreSQL database (Aiven, AWS RDS, or similar)
- Cloudinary account (for image storage)

## 🔧 Environment Setup

### 1. Generate Secure Secrets

```bash
# Generate JWT secrets
node -e "console.log('JWT_SECRET: ' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET: ' + require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Update Backend Environment Variables

Create/update `.env.production` with:

```env
NODE_ENV=production
PORT=3000
SERVERLESS=true
DATABASE_URL=postgresql://user:password@host:5432/biocycle
JWT_SECRET=<generated-secret>
JWT_REFRESH_SECRET=<generated-secret>
CORS_ORIGIN=https://your-frontend.vercel.app,https://your-domain.com
ADMIN_EMAIL=admin@biocycles.com
ADMIN_PASSWORD=<strong-password>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>
```

### 3. Update Frontend Environment Variables

Create `.env.production` with:

```env
VITE_API_BASE_URL=https://your-backend.vercel.app/api
```

## 📦 Deployment Steps

### Backend Deployment

1. **Push to GitHub**

```bash
cd backend
git add .
git commit -m "Backend optimizations for Vercel"
git push origin main
```

2. **Deploy to Vercel**

- Connect GitHub repository: https://vercel.com/new
- Select `backend` folder as root directory
- Add environment variables from `.env.production`
- Deploy

3. **Verify Deployment**

```bash
# Health check endpoint
curl https://your-backend.vercel.app/api/health

# Expected response:
# {
#   "success": true,
#   "message": "Server is running",
#   "timestamp": "2024-03-15T...",
#   "environment": "production",
#   "dbConnected": true
# }
```

### Frontend Deployment

1. **Update API Base URL**

Edit `frontend/src/services/api.ts`:

```typescript
const API_BASE_URL =
  process.env.VITE_API_BASE_URL || "https://your-backend.vercel.app/api";
```

2. **Push to GitHub**

```bash
cd frontend
git add .
git commit -m "Frontend optimizations for Vercel"
git push origin main
```

3. **Deploy to Vercel**

- Connect GitHub repository: https://vercel.com/new
- Select `frontend` folder as root directory
- Add environment variables:
  - `VITE_API_BASE_URL=https://your-backend.vercel.app/api`
- Deploy

4. **Verify UI is working**

- Login page should load in < 2 seconds
- API calls should respond in < 500ms

## 🔍 Performance Monitoring

### Check Response Times

1. **Backend Response Times**

```bash
# Check X-Response-Time header
curl -i https://your-backend.vercel.app/api/health
# Look for: X-Response-Time: 45ms
```

2. **Frontend Build Size**

```bash
cd frontend
npm run build

# Check dist folder size:
ls -lh dist
# Should be < 500KB for optimal performance
```

### Performance Targets

- Page Load: < 2 seconds
- API Response: < 500ms
- TTV (Time to Interactive): < 3 seconds

## 🔐 Security Checklist

- [ ] Change admin password immediately after first deploy
- [ ] Enable database SSL
- [ ] Verify CORS_ORIGIN is set to your domain only
- [ ] Enable 2FA on Vercel account
- [ ] Backup database regularly
- [ ] Monitor failed login attempts in production logs

## 🐛 Troubleshooting

### Database Connection Failed

```
Error: connect ENOTFOUND host
```

**Solution:**

1. Verify DATABASE_URL format
2. Check if database allows Vercel's IP ranges
3. Test connection locally first:

```bash
psql $DATABASE_URL -c "SELECT 1"
```

### CORS Errors

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**

1. Update CORS_ORIGIN environment variable
2. Ensure frontend URL is included
3. Restart deployment

### Slow API Responses (> 1 second)

**Solutions:**

1. Check database performance
2. Review rate limits - may be hitting them
3. Increase connection pool max (if using PgBouncer)
4. Analyze slow queries in database logs

```bash
# Backend logs show slow queries:
[SLOW API] GET /api/cycles/search took 1234ms
```

## 📊 Monitoring & Logs

### View Vercel Logs

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs https://your-backend.vercel.app --follow
```

### Monitor Database

- Login to Aiven/AWS console
- Check connection count (should stay < 10)
- Monitor query performance

## 🚀 Optimization Tips

1. **Use CDN for Images**
   - Configure Cloudinary for image delivery
   - Enables global caching

2. **Database Indexes**
   - Add indexes on frequently queried columns:
     ```sql
     CREATE INDEX idx_cycles_categoryId ON cycles(categoryId);
     CREATE INDEX idx_users_email ON users(email);
     CREATE INDEX idx_cycles_createdBy ON cycles(createdBy);
     ```

3. **Query Optimization**
   - Use `include` selectively in Sequelize
   - Avoid N+1 queries
   - Use pagination for large lists

4. **Caching Strategy**
   - Cache category list (rarely changes)
   - Cache class levels
   - Invalidate on admin updates

## 📝 Environment Variables Summary

### Required Backend Variables

| Variable           | Description                  | Example             |
| ------------------ | ---------------------------- | ------------------- |
| DATABASE_URL       | PostgreSQL connection string | postgresql://...    |
| JWT_SECRET         | Secret for access tokens     | 64-char hex string  |
| JWT_REFRESH_SECRET | Secret for refresh tokens    | 64-char hex string  |
| CORS_ORIGIN        | Allowed frontend URLs        | https://app.com     |
| ADMIN_EMAIL        | Default admin email          | admin@biocycles.com |
| ADMIN_PASSWORD     | Default admin password       | Must be strong!     |
| CLOUDINARY\_\*     | Image storage credentials    | From Cloudinary     |

### Optional Backend Variables

| Variable         | Default    | Description                  |
| ---------------- | ---------- | ---------------------------- |
| NODE_ENV         | production | Deployment environment       |
| PORT             | 3000       | Server port (Vercel manages) |
| LOGIN_RATE_LIMIT | 5          | Max login attempts per 15min |
| LOCKOUT_DURATION | 30         | Minutes to lock account      |

## 🎯 Post-Deployment Checklist

- [ ] Verify health endpoint returns 200
- [ ] Test login flow end-to-end
- [ ] Check student can register (pending approval)
- [ ] Verify admin can approve students
- [ ] Test role change functionality
- [ ] Monitor error logs for the first hour
- [ ] Test from different regions to verify CDN
- [ ] Verify HTTPS is enforced
- [ ] Check response times < 500ms on dashboard

## 📞 Support

For deployment issues:

1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test database connection
4. Review error logs in Vercel console

---

**Last Updated:** March 2026
**Vercel Optimization Version:** 1.0
