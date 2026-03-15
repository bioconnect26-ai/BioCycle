# BioCycle Login Security Improvements

## Overview

Implemented production-ready security features for high-volume student login scenarios with **rate limiting**, **account lockout**, **input validation**, and **secure token management**.

---

## 🔒 Security Implementations

### 1. **Account Lockout System** ✅

- **Failed Login Tracking**: Tracks failed attempts per user
- **Automatic Lockout**: Locks account after 5 failed attempts for 30 minutes
- **Status Indicators**: User model tracks:
  - `failedLoginAttempts` - Count of consecutive failed attempts
  - `lockoutUntil` - When the lockout expires
  - `lastFailedLogin` - Timestamp of last failed attempt

**Files Modified:**

- [backend/src/models/User.js](backend/src/models/User.js) - Added lockout fields and methods
- [backend/src/controllers/authController.js](backend/src/controllers/authController.js) - Check lockout status, track attempts

### 2. **Rate Limiting** ✅

Multi-layered rate limiting prevents brute force attacks:

| Endpoint         | Limit           | Window                      |
| ---------------- | --------------- | --------------------------- |
| `/login`         | 5 attempts      | 15 minutes (per IP + email) |
| `/register`      | 3 registrations | 1 hour (per IP)             |
| `/refresh-token` | 10 refreshes    | 5 minutes (per IP)          |
| Global API       | 100 requests    | 15 minutes (per IP)         |

**Files Modified:**

- [backend/src/middleware/rateLimiter.js](backend/src/middleware/rateLimiter.js) - NEW rate limiting middleware
- [backend/src/routes/auth.js](backend/src/routes/auth.js) - Apply rate limiters to endpoints
- [backend/src/index.js](backend/src/index.js) - Apply global rate limiter

### 3. **Input Validation** ✅

Strong validation on both frontend and backend:

**Email Validation:**

- Format: `example@domain.com`
- Max length: 100 characters
- Case-insensitive storage

**Password Validation (Registration):**

- Minimum: 8 characters
- Must include: uppercase, lowercase, number
- Example valid: `Student@2024`
- Example invalid: `student1` or `STUDENT1`

**Full Name Validation:**

- Min: 2 characters
- Max: 100 characters

**Files Modified:**

- [backend/src/controllers/authController.js](backend/src/controllers/authController.js) - Server-side validation
- [frontend/src/pages/LoginPage.tsx](frontend/src/pages/LoginPage.tsx) - Client-side validation + real-time feedback

### 4. **Secure Token Management** ✅

**Backend (JWT):**

- 7-day access token expiry
- 30-day refresh token expiry
- Tokens include user ID and role
- Configurable via environment variables

**Frontend (Session Storage):**

- Switched from `localStorage` to `sessionStorage` (cleared on browser close)
- Token expiry tracking for automatic logout
- Fallback to `localStorage` for session persistence if needed

**Files Modified:**

- [frontend/src/services/authService.ts](frontend/src/services/authService.ts) - Secure storage, token management
- [frontend/src/services/api.ts](frontend/src/services/api.ts) - Auto token refresh on 401

### 5. **Enhanced Error Messages** ✅

Different error scenarios handled appropriately:

| Scenario            | Status | Message                                                |
| ------------------- | ------ | ------------------------------------------------------ |
| Invalid credentials | 401    | "Invalid email or password"                            |
| Account locked      | 429    | "Account temporarily locked. Try again in 30 minutes." |
| Too many attempts   | 429    | "Too many login attempts..."                           |
| Pending approval    | 403    | "Your account is pending admin approval"               |
| Inactive account    | 403    | "Your account has been deactivated"                    |
| Invalid format      | 400    | Specific validation message                            |

**Files Modified:**

- [frontend/src/pages/LoginPage.tsx](frontend/src/pages/LoginPage.tsx) - Display lockout/error info

### 6. **HTTPS Enforcement** ✅

Production-only redirect to HTTPS:

- Checks `x-forwarded-proto` header
- Redirects HTTP to HTTPS in production
- Development allows HTTP for local testing

**Files Modified:**

- [backend/src/index.js](backend/src/index.js) - HTTPS middleware

### 7. **Enhanced CORS** ✅

- Specific allowed origins (no wildcards in production)
- Credentials enabled
- Specific HTTP methods allowed: GET, POST, PUT, DELETE, PATCH
- Specific headers: Content-Type, Authorization

**Files Modified:**

- [backend/src/index.js](backend/src/index.js) - CORS configuration

### 8. **Security Headers** ✅

Via Helmet middleware:

- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Content-Security-Policy
- Strict-Transport-Security (production)

---

## 📊 Login Flow (Multi-Student Scenario)

```
Student Attempt to Login
    ↓
[Rate Limit Check] ← 5 attempts per 15 min per IP+email
    ↓ (Pass)
[Input Validation] ← Email format, password length
    ↓ (Pass)
[Find User] ← Case-insensitive email lookup
    ↓
[Check Lockout] ← If lockoutUntil > now → 429 Locked
    ↓ (Not locked)
[Check Status] ← Must be "active"
    ↓ (Active)
[Verify Password] ← bcryptjs comparison
    ↓
[Incorrect] → recordFailedLogin() ← Increment counter, set lockout if >= 5
    ↓ 401 Error
[Correct] → resetLoginAttempts() ← Reset counter to 0
    ↓
[Generate Tokens] ← Access (7d) + Refresh (30d)
    ↓
[Update lastLogin] ← Timestamp
    ↓
[Store Securely] ← sessionStorage on client
    ↓
✅ Login Success
```

---

## 🔧 Configuration

### Backend Environment Variables (.env)

```env
# Rate Limiting
LOGIN_RATE_LIMIT=5              # Per 15 minutes
REGISTER_RATE_LIMIT=3           # Per hour
REFRESH_RATE_LIMIT=10           # Per 5 minutes

# Account Lockout
LOCKOUT_DURATION=30             # Minutes
MAX_FAILED_ATTEMPTS=5           # Failed attempts before lockout

# JWT (Generate strong secrets!)
JWT_SECRET=<generate-random-32-char>
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=<generate-random-32-char>
JWT_REFRESH_EXPIRE=30d
```

**Generate Strong Secrets:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Password Requirements Display

- Display to students: "At least 8 characters, with uppercase, lowercase, and numbers"
- Example: `Student@2024`
- Validated in real-time on login form

---

## 📱 Frontend User Experience

### Login Page Improvements:

1. **Real-Time Validation Feedback**
   - Email format check as you type
   - Password length indicator
   - Form button disabled if validation fails

2. **Account Lockout Display**
   - Orange/warning color for lockout
   - Clear message: "Account temporarily locked for security"
   - Countdown info (try again in 30 minutes)

3. **Error Handling**
   - Red errors for auth failures
   - Orange warnings for account lockout
   - Helpful messages without exposing system details

4. **Secure Storage**
   - Tokens cleared on browser close (sessionStorage)
   - Auto-logout on token expiry
   - Automatic redirect to login on token refresh failure

---

## 🧪 Testing the Security

### Test Case 1: Brute Force Protection

```bash
# Simulate 6 failed login attempts
# Student tries: wrong password 6 times within 15 minutes
# Expected: After 5 attempts → Account locked for 30 minutes (429 error)
```

### Test Case 2: Rate Limiting

```bash
# Simulate 6 login requests (not attempts)
# Expected: 6th request → "Too many login attempts" (429 error)
```

### Test Case 3: Invalid Password Requirements

```bash
# Try register with: "student1" (no uppercase)
# Try register with: "STUDENT1" (no lowercase)
# Expected: Validation error with requirements
```

### Test Case 4: Valid Login Success

```bash
# Email: user@example.com
# Password: ValidPass123
# Expected: Login success, redirect to dashboard
```

---

## 🚀 Deployment Checklist

Before going to production:

- [ ] Generate strong JWT secrets
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS with specific student domain
- [ ] Enable HTTPS (certificates via Let's Encrypt)
- [ ] Set ADMIN_EMAIL and ADMIN_PASSWORD to unique values
- [ ] Test rate limiting with multiple concurrent students
- [ ] Monitor failed login attempts in logs
- [ ] Set up email notifications for suspicious activity
- [ ] Configure database backups
- [ ] Test token refresh flow
- [ ] Verify HTTPS redirect works
- [ ] Test account lockout mechanism
- [ ] Load test with expected student count

---

## 📝 Admin Operations

### Monitor Failed Logins

```javascript
// Check which students have failed attempts
const user = await User.findOne({ where: { email: "student@uni.edu" } });
console.log("Failed attempts:", user.failedLoginAttempts);
console.log("Locked until:", user.lockoutUntil);
```

### Unlock Student Account

```javascript
// Manually unlock if student claims lockout is unfair
await user.update({
  failedLoginAttempts: 0,
  lockoutUntil: null,
});
```

### Reset Student Password

```javascript
// Student forgot password (implement reset flow)
await user.update({
  password: newPassword, // Will be auto-hashed by beforeUpdate hook
  failedLoginAttempts: 0,
  lockoutUntil: null,
});
```

---

## 📚 Related Documentation

- [README.md](README.md) - Project overview
- [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) - Setup instructions
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Architecture overview

---

## ✅ Security Compliance

This implementation follows:

- ✅ OWASP Top 10 Best Practices
- ✅ Password storage: bcryptjs (10 salt rounds)
- ✅ JWT best practices
- ✅ Rate limiting recommendations
- ✅ Input validation standards
- ✅ Secure headers (Helmet)
- ✅ CORS security
- ✅ Account lockout mechanisms

---

**Last Updated:** March 15, 2026  
**Status:** ✅ Production Ready for Multi-Student Logins
