# BioCycle Backend API

A complete Express.js backend with role-based access control (RBAC), content management system (CMS) for biology cycles, and admin features for managing users and approving new editors.

## Features

✅ **Authentication & Authorization**

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC) with 4 roles: super_admin, admin, editor, viewer
- User registration with admin approval workflow

✅ **Content Management**

- Full CRUD for cycles (biology cycles content)
- CMS features: draft, pending review, published status
- Steps and quick facts management
- Category management
- Activity logging

✅ **Admin Features**

- User management and approval system
- Dashboard statistics
- Role assignment
- User activation/deactivation

✅ **Image Management**

- Cloudinary integration for image storage
- Automatic image upload handling
- Secure file management

✅ **Database**

- PostgreSQL via Aiven
- Sequelize ORM for database operations
- Full data validation and error handling

## Prerequisites

- Node.js v14+
- npm or yarn
- PostgreSQL database (Aiven account recommended)
- Cloudinary account for image storage
- Git

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

#### Required Credentials:

**Database (Aiven PostgreSQL):**

- Go to [Aiven Console](https://console.aiven.io)
- Create PostgreSQL service
- Copy connection details to `.env`:
  ```
  DB_HOST=your-service.aivencloud.com
  DB_PORT=5432
  DB_NAME=defaultdb
  DB_USER=avnadmin
  DB_PASSWORD=your_password
  DB_SSL=true
  ```

**Cloudinary:**

- Go to [Cloudinary Dashboard](https://cloudinary.com/console)
- Get your credentials:
  ```
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret
  ```

**JWT Configuration:**

```
JWT_SECRET=your_super_secret_jwt_key_generate_random_string
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_generate_random_string
JWT_REFRESH_EXPIRE=30d
```

**CORS Configuration:**

```
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### 3. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "editor@biocycles.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe"
}
```

**Response:** User created with `pending` status (awaiting admin approval)

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@biocycles.com",
  "password": "AdminPassword123!"
}
```

**Response:**

```json
{
  "success": true,
  "user": { ... },
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

#### Get Profile

```http
GET /auth/profile
Authorization: Bearer <accessToken>
```

#### Update Profile

```http
PUT /auth/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "fullName": "Jane Doe",
  "profileImage": "image_url"
}
```

#### Refresh Token

```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

---

### User Management Endpoints (Admin Only)

#### Get All Users

```http
GET /users?page=1&limit=10&role=editor&status=active
Authorization: Bearer <adminToken>
```

#### Get Pending Editors

```http
GET /users/pending?page=1&limit=10
Authorization: Bearer <adminToken>
```

#### Get Dashboard Stats

```http
GET /users/stats
Authorization: Bearer <adminToken>
```

#### Approve Editor

```http
PUT /users/{userId}/approve
Authorization: Bearer <adminToken>
```

#### Reject/Deactivate User

```http
PUT /users/{userId}/reject
Authorization: Bearer <adminToken>
```

#### Change User Role

```http
PUT /users/{userId}/role
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "role": "admin"
}
```

---

### Cycles Endpoints

#### Get All Cycles

```http
GET /cycles?page=1&limit=10&category=uuid&difficulty=Beginner&status=published&search=krebs
Authorization: Optional
```

- **Public viewers:** Only see published cycles
- **Editors/Admins:** See all cycles including drafts

#### Get Cycle by Slug

```http
GET /cycles/slug/krebs-cycle
Authorization: Optional
```

#### Get Cycle by ID

```http
GET /cycles/{cycleId}
Authorization: Optional
```

#### Create Cycle (Editors & Admins)

```http
POST /cycles
Authorization: Bearer <editorToken>
Content-Type: application/json

{
  "title": "Krebs Cycle",
  "slug": "krebs-cycle",
  "description": "The central metabolic pathway...",
  "categoryId": "category-uuid",
  "difficulty": "Advanced",
  "videoUrl": "https://youtube.com/embed/...",
  "coverImage": "https://cloudinary-url",
  "tags": ["Metabolism", "Energy", "Mitochondria"],
  "icon": "Flame",
  "color": "emerald",
  "steps": [
    {
      "title": "Step 1",
      "description": "Description",
      "detail": "Detailed explanation",
      "memoryTrick": "Optional memory trick"
    }
  ],
  "quickFacts": [
    {
      "label": "Location",
      "value": "Mitochondrial Matrix"
    }
  ]
}
```

**Status:** Created as `draft`

#### Update Cycle (Editors Own/Admins)

```http
PUT /cycles/{cycleId}
Authorization: Bearer <editorToken>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  ...
}
```

**Note:** Resets status to `draft` when edited

#### Publish Cycle (Admins Only)

```http
PUT /cycles/{cycleId}/publish
Authorization: Bearer <adminToken>
```

**Status:** Changed to `published` with publishedAt timestamp

#### Delete Cycle (Admins Only)

```http
DELETE /cycles/{cycleId}
Authorization: Bearer <adminToken>
```

---

### Categories Endpoints

#### Get All Categories

```http
GET /categories?page=1&limit=10&search=cellular
Authorization: Optional
```

#### Get Category by ID

```http
GET /categories/{categoryId}
Authorization: Optional
```

#### Create Category (Admins)

```http
POST /categories
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "name": "Cellular",
  "slug": "cellular",
  "description": "Cycles happening inside cells"
}
```

#### Update Category (Admins)

```http
PUT /categories/{categoryId}
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### Delete Category (Admins)

```http
DELETE /categories/{categoryId}
Authorization: Bearer <adminToken>
```

---

## Role-Based Access Control (RBAC)

### Roles & Permissions

| Feature               | Super Admin | Admin | Editor | Viewer |
| --------------------- | :---------: | :---: | :----: | :----: |
| View Published Cycles |      ✓      |   ✓   |   ✓    |   ✓    |
| View All Cycles       |      ✓      |   ✓   |  ✓\*   |   ✗    |
| Create Cycle          |      ✓      |   ✓   |   ✓    |   ✗    |
| Edit Own Cycle        |      ✓      |   ✓   |   ✓    |   ✗    |
| Edit Any Cycle        |      ✓      |   ✓   |   ✗    |   ✗    |
| Publish Cycle         |      ✓      |   ✓   |   ✗    |   ✗    |
| Delete Cycle          |      ✓      |   ✓   |   ✗    |   ✗    |
| Manage Users          |      ✓      |   ✓   |   ✗    |   ✗    |
| Approve Editors       |      ✓      |   ✓   |   ✗    |   ✗    |
| Manage Categories     |      ✓      |   ✓   |   ✗    |   ✗    |
| View All Users        |      ✓      |   ✓   |   ✗    |   ✗    |

\*Editors can see draft cycles they created

### User Registration & Approval Flow

1. **User registers** → Status: `pending`
2. **Admin approves** → Status: `active` → User can login
3. **Admin rejects** → Status: `inactive` → User cannot login

---

## Database Schema

### Users Table

```sql
- id (UUID, PK)
- email (STRING, unique)
- password (STRING, hashed)
- fullName (STRING)
- role (ENUM: super_admin, admin, editor, viewer)
- status (ENUM: active, inactive, pending)
- profileImage (STRING, optional)
- lastLogin (DATETIME)
- createdAt, updatedAt
```

### Cycles Table

```sql
- id (UUID, PK)
- title (STRING)
- slug (STRING, unique)
- description (TEXT)
- categoryId (UUID, FK)
- difficulty (ENUM: Beginner, Intermediate, Advanced)
- videoUrl (STRING, optional)
- coverImage (STRING, optional)
- tags (ARRAY)
- status (ENUM: draft, pending_review, published)
- createdBy (UUID, FK → Users)
- updatedBy (UUID, FK → Users)
- publishedAt (DATETIME, optional)
- createdAt, updatedAt
```

### CycleSteps Table

```sql
- id (UUID, PK)
- cycleId (UUID, FK)
- stepOrder (INTEGER)
- title (STRING)
- description (TEXT)
- detail (TEXT)
- memoryTrick (TEXT, optional)
- createdAt, updatedAt
```

### QuickFacts Table

```sql
- id (UUID, PK)
- cycleId (UUID, FK)
- label (STRING)
- value (STRING)
- position (INTEGER)
- createdAt, updatedAt
```

### Categories Table

```sql
- id (UUID, PK)
- name (STRING, unique)
- slug (STRING, unique)
- description (TEXT, optional)
- createdAt, updatedAt
```

### ActivityLog Table

```sql
- id (UUID, PK)
- userId (UUID, FK)
- action (ENUM: create, edit, delete, publish, approve)
- entityType (ENUM: cycle, user, category)
- entityId (UUID)
- changes (JSONB)
- ipAddress (STRING, optional)
- createdAt
```

---

## Environment Variables Reference

```
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Database - Aiven PostgreSQL
DB_HOST=xxx.aivencloud.com
DB_PORT=5432
DB_NAME=database_name
DB_USER=avnadmin
DB_PASSWORD=password
DB_SSL=true

# JWT
JWT_SECRET=long_random_secret_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=another_long_secret_key
JWT_REFRESH_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=cloud_name
CLOUDINARY_API_KEY=api_key
CLOUDINARY_API_SECRET=api_secret

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Admin Credentials (for first setup)
ADMIN_EMAIL=admin@biocycles.com
ADMIN_PASSWORD=ChangeMe@123
```

---

## Development Tips

### Running in Development

```bash
npm run dev  # Uses nodemon for auto-restart
```

### Testing Endpoints

Use Postman, Insomnia, or VS Code Thunder Client:

1. Import the provided API endpoints
2. Set Authorization token in headers
3. Test each endpoint

### Debugging

```javascript
// Add console logs in controllers
console.log("User ID:", req.userId);
console.log("User Role:", req.role);
```

### Database Inspection

Connect to Aiven PostgreSQL using any database client:

- DBeaver
- pgAdmin
- VS Code SQL Tools

---

## Production Deployment

### Before deploying:

1. **Update environment variables** - Use strong, unique values
2. **Enable HTTPS** - Deploy with SSL certificate
3. **Database backup** - Set up automatic backups in Aiven
4. **Error logging** - Implement production logging
5. **Rate limiting** - Add rate limiting for API endpoints
6. **CORS whitelisting** - Only allow frontend domain

### Deploy to Heroku, Railway, Render, or similar:

```bash
# Set environment variables in hosting dashboard
# Push code to repository
# Platform auto-deploys
```

---

## Troubleshooting

### "Database connection failed"

- Check Aiven credentials in `.env`
- Ensure database is running
- Check firewall/IP whitelisting

### "Cloudinary upload failed"

- Verify API credentials
- Check file size limits
- Ensure folder structure exists

### "Invalid token"

- Token might be expired
- Use refresh-token endpoint to get new access token
- Check JWT_SECRET matches during signing

### "CORS error"

- Update CORS_ORIGIN in `.env`
- Restart server after changes

---

## Support

For issues or questions:

1. Check `.env` configuration
2. Review error messages in console
3. Check database connection
4. Review API response status codes

---

## License

MIT
