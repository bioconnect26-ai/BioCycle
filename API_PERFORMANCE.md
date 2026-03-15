# BioCycle - API Performance Optimization Guide

## 🚀 Response Time Targets (Vercel Production)

- **Health Check**: < 50ms
- **Auth Endpoints**: < 200ms (auth has slowest operations)
- **Public Queries** (Cycles, Categories): < 100ms
- **Admin Operations**: < 300ms
- **Database Queries**: < 50ms (with indexes)

## 📊 Caching Strategy by Endpoint

### 🟢 Highly Cacheable (5+ minutes)

These endpoints rarely change and should be cached aggressively:

```
GET /api/categories
  Cache: 10 minutes (client) / 20 minutes (CDN)
  Reason: Categories updated only by admins

GET /api/class-levels
  Cache: 10 minutes
  Reason: Class levels are static

GET /api/cycles (browse/explore)
  Cache: 5 minutes
  Reason: New cycles published regularly but users browse same results

GET /api/cycles/{id}
  Cache: 10 minutes
  Reason: Cycle content rarely changes
```

### 🟡 Moderately Cacheable (1-3 minutes)

These endpoints change frequently but can still be cached:

```
GET /api/users (admin list)
  Cache: 2 minutes
  Reason: User list updates when new registrations come

GET /api/users/{id}
  Cache: 2 minutes
  Reason: User profiles can be edited
```

### 🔴 Not Cacheable (0 minutes)

These endpoints must return fresh data:

```
POST /api/auth/login
  Cache: NO-CACHE
  Reason: Authentication - must be fresh

POST /api/auth/register
  Cache: NO-CACHE
  Reason: Registration creates new user

PUT /api/users/{id}/role
  Cache: NO-CACHE
  Reason: Role changes affect permissions immediately

PUT /api/users/{id}/approve
  Cache: NO-CACHE
  Reason: Approval status must be current

POST /api/auth/refresh-token
  Cache: NO-CACHE
  Reason: Token refresh must be immediate

DELETE operations
  Cache: NO-CACHE
  Reason: Deletions must be immediate
```

## ⚡ Performance Tips

### 1. Pagination

Always paginate large result sets:

```bash
# Good
GET /api/cycles?page=1&limit=20

# Bad
GET /api/cycles  # Returns 10,000 cycles

# Implementation
Limit default page size: 20
Maximum page size: 100
```

### 2. Lazy Loading / Selective Includes

Only fetch related data when needed:

```javascript
// API endpoint optimization
router.get("/cycles/:id", async (req, res) => {
  const include = req.query.include?.split(",") || [];

  const options = {
    include: [],
  };

  // Only include requested relationships
  if (include.includes("steps")) {
    options.include.push("steps");
  }
  if (include.includes("creator")) {
    options.include.push("creator");
  }

  const cycle = await Cycle.findByPk(req.params.id, options);
  res.json(cycle);
});

// Usage
GET /api/cycles/123?include=steps,creator
```

### 3. Batch Queries

Support fetching multiple items:

```
GET /api/cycles?ids=1,2,3,4,5
  Less overhead than 5 separate requests
  Returns: [{cycle1}, {cycle2}, ...]
```

### 4. Field Filtering

Allow clients to request only needed fields:

```
GET /api/cycles/123?fields=id,name,description
GET /api/users?fields=id,email,role (no passwords!)
```

### 5. Search Optimization

```javascript
// Instead of full-text search in app
// Use database search with indexes

// Good: Database-level search
GET /api/cycles/search?q=photosynthesis
// Uses: CREATE INDEX idx_cycles_name_search ON cycles USING gin(to_tsvector('english', name));

// Bad: Get all and filter in app
GET /api/cycles
// Filter in JavaScript - extremely slow
```

## 🔍 Query Optimization Checklist

- [ ] All frequently queried columns have indexes
- [ ] Composite indexes exist for multi-column WHERE clauses
- [ ] JOIN queries use indexed foreign keys
- [ ] LIMIT clauses are used in paginated endpoints
- [ ] Unnecessary columns are not selected
- [ ] N+1 queries are avoided (use includes)
- [ ] Slow queries (> 100ms) are identified and optimized
- [ ] Database connection pool is configured (5 max for serverless)

## 📈 Monitoring Queries

### Check Current Query Performance

```sql
-- Most time-consuming queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Unused indexes
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;

-- Index usage stats
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## 🚀 Advanced Caching with Redis (Optional)

For ultra-fast responses, consider Redis caching:

```javascript
import redis from "redis";

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

// Cache middleware
export const withCache = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== "GET") return next();

    const cacheKey = `${req.method}:${req.originalUrl}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        res.set("X-Cache", "HIT");
        return res.json(JSON.parse(cached));
      }
    } catch (e) {
      console.warn("Redis get error:", e);
    }

    const originalJson = res.json;
    res.json = function (data) {
      if (res.statusCode === 200) {
        redisClient.setex(cacheKey, duration, JSON.stringify(data));
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

// Usage in routes
router.get("/cycles", withCache(300), getCycles);
```

## ✅ Response Header Examples

After optimizations, you should see:

```
HTTP/1.1 200 OK
X-Response-Time: 45ms
Cache-Control: public, max-age=300, s-maxage=600
X-Cache: HIT
X-Powered-By: Express
```

- ✅ Response time under 100ms
- ✅ Cache headers present
- ✅ Compression being used
- ✅ Security headers in place

## 📊 Performance Benchmarks

Run these commands to benchmark endpoints:

```bash
# Single request with timing
time curl https://api.biocycle.app/api/health

# Multiple requests (Apache Bench)
ab -n 100 -c 10 https://api.biocycle.app/api/health

# Load testing (requires -H flag for POST)
ab -n 1000 -c 50 \
  -H "Content-Type: application/json" \
  https://api.biocycle.app/api/cycles
```

Expected results on Vercel with optimal config:

- 100 sequential requests: Average 50-100ms
- 50 concurrent requests: Average 80-150ms
- 99th percentile: < 300ms

## 🔐 Caching Security Notes

🚨 **NEVER cache:**

- Authentication tokens
- User passwords
- Personal information
- Session data
- Dynamic user-specific content

✅ **SAFE to cache:**

- Public cycles/content
- Category/class level lists
- Static assets
- Page templates

---

**Version:** 1.0  
**Last Updated:** March 2026
