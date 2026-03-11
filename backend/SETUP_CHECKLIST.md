# BioCycle Backend - Setup & Implementation Checklist

## ✅ Pre-Setup Checklist

### External Services

- [ ] Aiven PostgreSQL account created and database provisioned
- [ ] Aiven credentials obtained (host, port, database, user, password)
- [ ] Cloudinary account created
- [ ] Cloudinary credentials obtained (cloud name, API key, API secret)
- [ ] Frontend project running at http://localhost:5173 (or note your frontend URL)

### Local Environment

- [ ] Node.js v14+ installed
- [ ] npm or yarn available
- [ ] Git configured
- [ ] Code editor ready (VS Code recommended)

---

## 📦 Installation Checklist

### 1. Download & Setup

- [ ] Clone/extract backend folder
- [ ] Navigate to backend directory: `cd backend`
- [ ] Run `npm install`
- [ ] Verify no errors during installation

### 2. Environment Configuration

- [ ] Copy `.env.example` to `.env`
- [ ] Fill in all Aiven PostgreSQL credentials:
  - [ ] `DB_HOST` - Your Aiven service URL
  - [ ] `DB_USER` - avnadmin (default)
  - [ ] `DB_PASSWORD` - Your Aiven password
  - [ ] `DB_NAME` - Database name
- [ ] Fill in all Cloudinary credentials:
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
- [ ] Generate JWT secrets (run: `openssl rand -base64 32`):
  - [ ] `JWT_SECRET` = generated string
  - [ ] `JWT_REFRESH_SECRET` = different generated string
- [ ] Set `CORS_ORIGIN` to your frontend URL:
  - [ ] `CORS_ORIGIN=http://localhost:5173`

### 3. Database Initialization

- [ ] Run `npm run db:init`
- [ ] Verify output shows ✓ signs
- [ ] Verify admin user created with credentials shown
- [ ] Verify categories created (Cellular, Ecological, etc.)

### 4. Start Server

- [ ] Run `npm run dev`
- [ ] Verify output shows:
  - [ ] ✓ Database connection established
  - [ ] ✓ Database models synchronized
  - [ ] ✓ Server running on http://localhost:5000
- [ ] Keep terminal open

---

## 🧪 API Testing Checklist

### 1. Health Check

- [ ] Open browser or Postman
- [ ] GET `http://localhost:5000/api/health`
- [ ] Verify `"success": true` response

### 2. Authentication Setup

- [ ] Save admin email: `admin@biocycles.com`
- [ ] Save admin password: (from db:init output)
- [ ] POST to `/api/auth/login` with credentials
- [ ] Copy `accessToken` to clipboard
- [ ] Copy `refreshToken` to clipboard

### 3. Test Protected Routes

- [ ] Add `Authorization: Bearer <accessToken>` header
- [ ] GET `/api/auth/profile`
- [ ] Verify returns user data

### 4. Test User Management

- [ ] GET `/api/users/stats` (admin endpoint)
- [ ] GET `/api/users?page=1&limit=10`
- [ ] Verify returns user list

### 5. Test Categories

- [ ] GET `/api/categories`
- [ ] Verify returns categories created in db:init

### 6. Test Cycles (Content)

- [ ] GET `/api/cycles?page=1&limit=10`
- [ ] Verify returns empty array initially

### 7. Create Test Cycle

- [ ] POST `/api/cycles` with editor/admin token
- [ ] Include required fields:
  - [ ] title
  - [ ] slug
  - [ ] description
  - [ ] categoryId (from categories list)
  - [ ] steps array
  - [ ] quickFacts array
- [ ] Verify returns cycle with `status: "draft"`

### 8. Publish Test Cycle

- [ ] Use admin token
- [ ] PUT `/api/cycles/{cycleId}/publish`
- [ ] Verify cycle status changed to `published`

---

## 🔐 Security Checklist

### Immediate (Before Development)

- [ ] Change admin password if using in development
- [ ] Generate new JWT secrets
- [ ] Use strong Cloudinary API secret

### Before Production

- [ ] Review all environment variables
- [ ] Disable debug logging in production
- [ ] Enable HTTPS on server
- [ ] Set `NODE_ENV=production`
- [ ] Whitelist specific CORS origins (not use `*`)
- [ ] Setup database backups
- [ ] Add rate limiting
- [ ] Add request logging
- [ ] Security audit review

---

## 📚 Documentation Review Checklist

### Read Documentation

- [ ] README.md - Full API documentation
- [ ] QUICKSTART.md - Quick setup guide
- [ ] PROJECT_OVERVIEW.md - Architecture & structure
- [ ] FRONTEND_INTEGRATION.md - How to connect frontend
- [ ] This checklist - Setup verification

### Understand Key Concepts

- [ ] JWT token authentication flow
- [ ] Role-based access control (RBAC)
- [ ] User registration & approval workflow
- [ ] Cycle content management workflow
- [ ] Cloudinary image storage
- [ ] Database relationships & models

---

## 🎯 Feature Implementation Checklist

### Core Features Ready

- [ ] Authentication (Register, Login, Token Refresh)
- [ ] RBAC (4 roles: super_admin, admin, editor, viewer)
- [ ] User Management & Approval
- [ ] Cycle/Content CRUD
- [ ] Category Management
- [ ] Cloudinary Integration
- [ ] Activity Logging
- [ ] Error Handling

### Optional Features to Add

- [ ] Email notifications
- [ ] Advanced search & filtering
- [ ] Content versioning
- [ ] Team collaboration
- [ ] Analytics dashboard
- [ ] API rate limiting
- [ ] Redis caching

---

## 🔌 Frontend Integration Checklist

### Setup API Service

- [ ] Create `src/services/api.js` with axios instance
- [ ] Setup request/response interceptors
- [ ] Add token to Authorization header
- [ ] Handle token refresh on 401
- [ ] Create `src/services/authService.js`
- [ ] Create `src/services/cycleService.js`
- [ ] Create `src/services/userService.js`

### Update Frontend Components

- [ ] Update LoginPage to use authService
- [ ] Update AdminDashboard to fetch data from API
- [ ] Update AdminContent to list cycles from API
- [ ] Update AdminUsers to list users and approve editors
- [ ] Add ProtectedRoute wrapper for admin routes
- [ ] Add proper error handling & toast notifications

### Environment Setup

- [ ] Create `.env.local` in frontend
- [ ] Set `VITE_API_URL=http://localhost:5000/api`
- [ ] Verify frontend can reach backend

---

## 🚀 Pre-Launch Testing Checklist

### Manual Testing

- [ ] Register new user (should be pending)
- [ ] Login as admin
- [ ] Approve new user from admin panel
- [ ] Login as approved editor
- [ ] Create draft cycle
- [ ] Edit draft cycle
- [ ] Submit cycle for publishing
- [ ] Admin publishes cycle
- [ ] View published cycle as viewer
- [ ] Create category (admin only)
- [ ] Assign cycle to category
- [ ] Delete category (should fail if cycles exist)

### Browser Testing

- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on mobile Safari
- [ ] Test on Chrome Mobile
- [ ] Check responsive design on small screens

### API Testing

- [ ] All endpoints with Postman/Insomnia
- [ ] Error responses (401, 403, 404, 500)
- [ ] Pagination works correctly
- [ ] Filters work correctly
- [ ] Search functionality works

### Performance Testing

- [ ] Load time for cycle list
- [ ] Large file upload to Cloudinary
- [ ] Multiple concurrent requests
- [ ] Database query performance

---

## 📊 Monitoring & Logging Checklist

### Setup Logging

- [ ] Console logs in development
- [ ] Error tracking in production
- [ ] Request logging middleware
- [ ] Database query logging option

### Monitor

- [ ] Server uptime
- [ ] Database connection status
- [ ] API response times
- [ ] Error rates
- [ ] Failed login attempts

---

## 🚀 Deployment Preparation Checklist

### Code Quality

- [ ] Fix all linting errors: `npm run lint`
- [ ] Test all API endpoints
- [ ] Review error messages
- [ ] Remove debug console.logs (prod)
- [ ] Update README with production notes

### Database

- [ ] Test database backups
- [ ] Document backup procedure
- [ ] Setup automated backups
- [ ] Test restore procedure

### Deployment

- [ ] Choose hosting platform (Heroku, Railway, Render)
- [ ] Create production database
- [ ] Set all environment variables
- [ ] Deploy backend
- [ ] Test all endpoints on production
- [ ] Setup admin user on production
- [ ] Update frontend to use production URL

### Post-Deployment

- [ ] Monitor application logs
- [ ] Check error tracking
- [ ] Verify all features work
- [ ] Performance benchmarking
- [ ] Security audit
- [ ] Document deployment process

---

## 📋 Troubleshooting Checklist

### If Database Won't Connect

- [ ] Check Aiven service is running
- [ ] Verify `DB_HOST` is correct
- [ ] Verify `DB_USER` is `avnadmin`
- [ ] Verify `DB_PASSWORD` is correct
- [ ] Check IP whitelist in Aiven dashboard
- [ ] Verify `DB_SSL=true` is set

### If Cloudinary Won't Work

- [ ] Verify `CLOUDINARY_CLOUD_NAME` is correct
- [ ] Verify `CLOUDINARY_API_KEY` is correct
- [ ] Verify `CLOUDINARY_API_SECRET` is correct
- [ ] Check file size doesn't exceed limits
- [ ] Verify folder structure exists

### If Frontend Can't Connect to Backend

- [ ] Verify backend is running (`npm run dev`)
- [ ] Check `VITE_API_URL` in frontend `.env.local`
- [ ] Verify no typos in API endpoints
- [ ] Check `CORS_ORIGIN` includes frontend URL
- [ ] Verify no firewall blocking connection
- [ ] Check browser console for exact error

### If Authentication Fails

- [ ] Check admin credentials in `.env`
- [ ] Verify JWT_SECRET is set
- [ ] Verify tokens are stored in localStorage
- [ ] Check token hasn't expired
- [ ] Use refresh-token endpoint to get new access token

---

## 📞 Support Resources

### Documentation Files

```
backend/
├── README.md                      # Full API documentation
├── QUICKSTART.md                 # 5-minute setup
├── PROJECT_OVERVIEW.md           # Architecture details
├── FRONTEND_INTEGRATION.md       # Frontend connection
└── BioCycle-API.postman_collection.json  # API testing
```

### External Resources

- Aiven Documentation: https://aiven.io/docs
- Cloudinary Documentation: https://cloudinary.com/documentation
- Express.js Guide: https://expressjs.com
- Sequelize ORM: https://sequelize.org
- JWT.io: https://jwt.io

### Common Issues

- Q: "Cannot connect to database"
  A: Check Aiven credentials and IP whitelist

- Q: "CORS error when calling from frontend"
  A: Update CORS_ORIGIN in .env and restart server

- Q: "Invalid token"
  A: Token might be expired, use refresh-token endpoint

---

## ✨ Final Verification

Before considering setup complete, verify:

```bash
# Terminal Output
✓ Database connection established
✓ Database models synchronized
✓ Server running on http://localhost:5000

# Test Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@biocycles.com","password":"ChangeMe@123"}'

# Expected Response
{
  "success": true,
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}

# Test Protected Route
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <accessToken>"

# Expected Response
{
  "success": true,
  "user": { ... }
}
```

✅ **If all above passes, your backend is ready!**

---

## 🎉 Congratulations!

Your BioCycle backend is now:
✅ Fully functional with Express.js
✅ Connected to PostgreSQL via Aiven
✅ Equipped with role-based access control
✅ Integrated with Cloudinary for images
✅ Ready for content management
✅ Ready for admin user management

**Next Steps:**

1. Integrate frontend (see FRONTEND_INTEGRATION.md)
2. Deploy to production
3. Add additional features
4. Monitor and maintain

Good luck! 🚀
