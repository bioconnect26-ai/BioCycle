# Quick Start Guide - BioCycle Backend

## 🚀 5-Minute Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Get Your Credentials

#### Aiven PostgreSQL

1. Go to https://console.aiven.io
2. Create a PostgreSQL service
3. Copy credentials:
   - Service URL → `DB_HOST`
   - Database name → `DB_NAME`
   - Username → `DB_USER` (usually `avnadmin`)
   - Password → `DB_PASSWORD`

#### Cloudinary

1. Go to https://cloudinary.com/console
2. Get your:
   - Cloud name → `CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`

### Step 3: Setup .env

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```
# Database
DB_HOST=your-aiven-instance.aivencloud.com
DB_PORT=5432
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=your_password
DB_SSL=true

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# JWT
JWT_SECRET=generate-a-random-string-here
JWT_REFRESH_SECRET=another-random-string-here

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### Step 4: Initialize Database

```bash
npm run db:init
```

This will:

- Create database tables
- Create default admin user
- Create demo categories
- Create demo editor user

### Step 5: Start Server

```bash
npm run dev
```

You should see:

```
✓ Database connection established
✓ Database models synchronized
✓ Server running on http://localhost:5000
✓ API Base URL: http://localhost:5000/api
```

---

## 📚 Test the API

### 1. Login as Admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@biocycles.com",
    "password": "ChangeMe@123"
  }'
```

You'll get `accessToken` → Save this!

### 2. Get All Users (with auth token)

```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Create Cycle (as editor)

```bash
curl -X POST http://localhost:5000/api/cycles \
  -H "Authorization: Bearer YOUR_EDITOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Krebs Cycle",
    "slug": "krebs-cycle",
    "description": "Energy production in cells",
    "categoryId": "category-uuid-here",
    "difficulty": "Advanced",
    "steps": [
      {
        "title": "Step 1",
        "description": "First step",
        "detail": "Detailed information",
        "memoryTrick": "Citric takes Acetyl"
      }
    ],
    "quickFacts": [
      {
        "label": "Location",
        "value": "Mitochondrial Matrix"
      }
    ]
  }'
```

---

## 👥 User Roles & Default Credentials

### Admin (Super Admin)

- Email: `admin@biocycles.com`
- Password: `ChangeMe@123`
- Can: Everything - approve editors, manage users, approve/publish content

### Editor

- Email: `editor@biocycles.com`
- Password: `EditorPass@123`
- Can: Create & edit own content, manage cycles

### Viewer

- Read-only access to published content

---

## 📋 Common Tasks

### Approve a Pending Editor

1. Get pending editors list: `GET /api/users/pending`
2. Approve: `PUT /api/users/{userId}/approve`

### Publish a Cycle (Draft to Published)

1. Editors create cycles (status: draft)
2. Admin publishes: `PUT /api/cycles/{cycleId}/publish`

### Add New Category

```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Photosynthesis",
    "slug": "photosynthesis",
    "description": "Light harvesting cycles"
  }'
```

---

## 🐛 Troubleshooting

**"Cannot connect to database"**

- Check `DB_HOST` and `DB_PASSWORD` in `.env`
- Verify database is running on Aiven
- Check IP whitelist in Aiven

**"Cloudinary error"**

- Verify `CLOUDINARY_CLOUD_NAME` is correct
- Check API credentials

**"CORS error" when calling from frontend**

- Update `CORS_ORIGIN` in `.env`
- Restart server: `Stop dev and run npm run dev`

---

## 📖 Full Documentation

See `README.md` for complete API documentation, schema details, and advanced configuration.

---

## 🔐 Security Notes

⚠️ **Before Production:**

1. Change admin password: `ADMIN_PASSWORD=StrongPassword@123`
2. Generate new JWT secrets: `openssl rand -base64 32`
3. Enable HTTPS
4. Set `NODE_ENV=production`
5. Set strong CORS origins (not `*`)
6. Enable database backups

---

## 🎯 Next Steps

1. ✅ Frontend integration - Connect React frontend to backend API
2. ✅ Deploy - Deploy to production (Heroku, Railway, Render)
3. ✅ Email notifications - Add email alerts for admin actions
4. ✅ Analytics - Add user activity tracking
5. ✅ Caching - Add Redis caching for better performance

Good luck! 🚀
