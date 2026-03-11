# BioCycle Backend - Complete Project Overview

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js              # Sequelize database configuration
│   │   └── cloudinary.js            # Cloudinary setup
│   │
│   ├── controllers/
│   │   ├── authController.js        # Login, register, token management
│   │   ├── userController.js        # User management, approval workflow
│   │   ├── cycleController.js       # CMS - cycles CRUD operations
│   │   └── categoryController.js    # Categories management
│   │
│   ├── models/
│   │   ├── User.js                  # User model with password hashing
│   │   ├── Cycle.js                 # Cycle/Content model
│   │   ├── CycleStep.js             # Steps within cycles
│   │   ├── Category.js              # Content categories
│   │   ├── QuickFact.js             # Quick facts for cycles
│   │   └── ActivityLog.js           # Audit trail
│   │
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication & RBAC
│   │   └── errorHandler.js          # Error handling & 404
│   │
│   ├── routes/
│   │   ├── auth.js                  # /api/auth endpoints
│   │   ├── users.js                 # /api/users endpoints (admin)
│   │   ├── cycles.js                # /api/cycles endpoints
│   │   └── categories.js            # /api/categories endpoints
│   │
│   ├── utils/
│   │   ├── jwt.js                   # JWT token operations
│   │   └── cloudinary.js            # Cloudinary upload utilities
│   │
│   ├── seeds/
│   │   └── init.js                  # Database initialization script
│   │
│   └── db.js                        # Database initialization & models
│
├── package.json                     # Dependencies
├── .env                            # Environment variables (git ignored)
├── .env.example                    # Template for .env
├── .gitignore                      # Git ignore rules
├── README.md                       # Full documentation
├── QUICKSTART.md                   # Quick setup guide
└── BioCycle-API.postman_collection.json  # Postman API collection
```

---

## 🔧 Technology Stack

### Backend Framework

- **Express.js** - Web framework
- **Node.js** - Runtime

### Database

- **PostgreSQL** (via Aiven) - Primary database
- **Sequelize ORM** - Database abstraction layer

### Authentication & Security

- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### File Storage

- **Cloudinary** - Image/media hosting
- **Multer** - File upload middleware

### Development

- **Nodemon** - Auto-reload development
- **dotenv** - Environment variable management

---

## 🏗️ Architecture Overview

### Request Flow

```
1. Client Request
   ↓
2. Middleware (CORS, helmet, parsing)
   ↓
3. Route Handler
   ↓
4. Authentication Middleware (JWT verification)
   ↓
5. Authorization Middleware (Role checking)
   ↓
6. Controller Logic
   ↓
7. Database Operations (Sequelize)
   ↓
8. Response
```

### Data Models & Relationships

```
User (1) ──created──→ (many) Cycle
User (1) ──updated──→ (many) Cycle
User (1) ──has──→ (many) ActivityLog

Category (1) ──has──→ (many) Cycle
Cycle (1) ──has──→ (many) CycleStep
Cycle (1) ──has──→ (many) QuickFact
```

---

## 🔐 Role-Based Access Control

### Roles Hierarchy

```
Super Admin (0)  → Full system access
    ↓
Admin (1)        → Content & user management
    ↓
Editor (2)       → Create/edit own content
    ↓
Viewer (3)       → Read-only published content
```

### Permission Matrix

| Operation         | Super Admin | Admin | Editor | Viewer |
| ----------------- | :---------: | :---: | :----: | :----: |
| Create Cycle      |      ✓      |   ✓   |   ✓    |   ✗    |
| Edit Own Cycle    |      ✓      |   ✓   |   ✓    |   ✗    |
| Edit Any Cycle    |      ✓      |   ✓   |   ✗    |   ✗    |
| Publish Cycle     |      ✓      |   ✓   |   ✗    |   ✗    |
| Delete Cycle      |      ✓      |   ✓   |   ✗    |   ✗    |
| Manage Users      |      ✓      |   ✓   |   ✗    |   ✗    |
| Approve Editors   |      ✓      |   ✓   |   ✗    |   ✗    |
| Manage Categories |      ✓      |   ✓   |   ✗    |   ✗    |

---

## 📊 Database Schema Details

### Users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  fullName VARCHAR NOT NULL,
  role ENUM('super_admin', 'admin', 'editor', 'viewer'),
  status ENUM('active', 'inactive', 'pending'),
  profileImage VARCHAR,
  lastLogin TIMESTAMP,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

**Registration Flow:**

1. User registers → Status: `pending` (awaits approval)
2. Admin approves → Status: `active` (can login)
3. Admin rejects → Status: `inactive` (cannot login)

### Cycles (Content)

```sql
CREATE TABLE cycles (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  description TEXT NOT NULL,
  categoryId UUID REFERENCES categories(id),
  difficulty ENUM('Beginner', 'Intermediate', 'Advanced'),
  videoUrl VARCHAR,
  coverImage VARCHAR,
  tags TEXT[], -- Array
  status ENUM('draft', 'pending_review', 'published'),
  createdBy UUID REFERENCES users(id),
  updatedBy UUID REFERENCES users(id),
  publishedAt TIMESTAMP,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

**Publication Workflow:**

1. Editor creates cycle → Status: `draft`
2. Editor can edit → Status: still `draft`
3. Admin publishes → Status: `published`
4. Public can see published cycles

### CycleSteps

```sql
CREATE TABLE cycleSteps (
  id UUID PRIMARY KEY,
  cycleId UUID REFERENCES cycles(id),
  stepOrder INTEGER,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  detail TEXT NOT NULL,
  memoryTrick TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### QuickFacts

```sql
CREATE TABLE quickFacts (
  id UUID PRIMARY KEY,
  cycleId UUID REFERENCES cycles(id),
  label VARCHAR NOT NULL,
  value VARCHAR NOT NULL,
  position INTEGER,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### ActivityLog

```sql
CREATE TABLE activityLogs (
  id UUID PRIMARY KEY,
  userId UUID REFERENCES users(id),
  action ENUM('create', 'edit', 'delete', 'publish', 'approve'),
  entityType ENUM('cycle', 'user', 'category'),
  entityId UUID,
  changes JSONB,
  ipAddress VARCHAR,
  createdAt TIMESTAMP
);
```

---

## 🔑 API Authentication

### Token-Based Authentication

1. **Login** → Receive `accessToken` + `refreshToken`

   ```
   accessToken: JWT valid for 7 days
   refreshToken: JWT valid for 30 days
   ```

2. **Attach to Requests**

   ```http
   Authorization: Bearer <accessToken>
   ```

3. **Token Expiration** → Use `refreshToken` to get new `accessToken`
   ```http
   POST /api/auth/refresh-token
   { "refreshToken": "..." }
   ```

---

## 📝 Environment Variables

### Example .env

```
# Server
NODE_ENV=development
PORT=5000

# Database - Aiven PostgreSQL
DB_HOST=db-xxxxx.aivencloud.com
DB_PORT=5432
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=password123
DB_SSL=true

# JWT Secrets
JWT_SECRET=your_secret_key_here_must_be_long_and_random
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Admin Credentials
ADMIN_EMAIL=admin@biocycles.com
ADMIN_PASSWORD=ChangeMe@123
```

---

## 🚀 Key Features Explained

### 1. Authentication System

- **JWT-based** with access + refresh tokens
- **Password hashing** with bcryptjs
- **User status workflow**: pending → active/inactive
- **Last login tracking**

### 2. Role-Based Access Control

- **4 user roles** with different permissions
- **Middleware enforcement** on routes
- **Permission checks** in controllers
- **Activity logging** of all actions

### 3. Content Management System (CMS)

- **Full CRUD** for cycles
- **Hierarchical** structure (cycle → steps → quick facts)
- **Draft & publish** workflow
- **Category** organization
- **Media support** via Cloudinary

### 4. User Management

- **Registration with approval**: New users pending → Admin approves
- **Role assignment**: Assign roles to users
- **Status management**: Active/Inactive/Pending
- **User listing & filtering**

### 5. Activity Tracking

- **Audit trail** of all changes
- **User attribution** (who did what)
- **Change logging** (what changed)
- **Action types**: create, edit, delete, publish, approve

### 6. Error Handling

- **Validation errors** with specific messages
- **Authentication errors** (401)
- **Authorization errors** (403)
- **Not found errors** (404)
- **Server errors** with logging

---

## 🔄 Workflow Examples

### Editor Publishing Content

```
1. Editor creates cycle (POST /api/cycles)
   → Status: draft
   → Stored in database

2. Editor edits cycle (PUT /api/cycles/{id})
   → Updates content
   → Status: stays draft

3. Admin approves/publishes (PUT /api/cycles/{id}/publish)
   → Status: published
   → Public can view
```

### New Editor Approval

```
1. New user registers (POST /api/auth/register)
   → Role: editor
   → Status: pending

2. Admin sees pending editors (GET /api/users/pending)

3. Admin approves (PUT /api/users/{userId}/approve)
   → Status: active
   → User can now login

4. User logs in (POST /api/auth/login)
   → Receives tokens
   → Can create content
```

---

## 📦 NPM Scripts

```bash
npm start           # Start production server
npm run dev         # Start development with nodemon
npm run db:init    # Initialize database & seed
npm run db:migrate  # Run migrations
npm run db:seed     # Seed database
```

---

## 🔒 Security Considerations

### Implemented

✅ Password hashing with bcryptjs
✅ JWT token authentication
✅ CORS validation
✅ Helmet security headers
✅ SQL injection prevention (via Sequelize ORM)
✅ Input validation
✅ Role-based access control
✅ Activity logging

### Recommended for Production

🔒 HTTPS/SSL encryption
🔒 Rate limiting
🔒 Request logging
🔒 Database backups
🔒 Secret management
🔒 API versioning
🔒 Request sanitization
🔒 WAF (Web Application Firewall)

---

## 📚 API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Optional error details"
}
```

---

## 🎯 Future Enhancements

- [ ] Email notifications for admin actions
- [ ] Advanced search & filters
- [ ] Content versioning & rollback
- [ ] Team collaboration features
- [ ] Content scheduling
- [ ] Analytics dashboard
- [ ] API rate limiting
- [ ] Caching with Redis
- [ ] Real-time notifications with WebSockets
- [ ] Mobile app API
- [ ] GraphQL API option
- [ ] Docker containerization

---

## 📞 Support & Debugging

### Common Issues & Solutions

**Database Connection Fails**

- Check Aiven credentials
- Verify IP whitelist

**Cloudinary Upload Fails**

- Verify API credentials
- Check file size limits
- Check upload folder permissions

**CORS Errors**

- Update CORS_ORIGIN in .env
- Restart server

**Authentication Issues**

- Verify JWT_SECRET is set
- Check token expiration
- Use refresh-token to get new access token

---

## 📖 Documentation Files

1. **README.md** - Full API documentation with examples
2. **QUICKSTART.md** - 5-minute setup guide
3. **Project Overview.md** - This file
4. **BioCycle-API.postman_collection.json** - Postman collection for testing

---

## 🚀 Deployment Checklist

- [ ] Update all environment variables
- [ ] Generate new JWT secrets
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure database backups
- [ ] Setup error logging
- [ ] Configure CDN for media
- [ ] Setup monitoring & alerts
- [ ] Test all API endpoints
- [ ] Security audit
- [ ] Load testing
- [ ] Create deployment documentation

---

**Ready to deploy? Follow QUICKSTART.md to get started! 🎉**
