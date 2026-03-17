import compression from "compression";

/**
 * Middleware for response compression and caching optimization
 * Gzip compress responses larger than 1KB
 */
export const compressionMiddleware = () => {
  return compression({
    level: 6, // Balance between compression and CPU usage
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      // Don't compress responses with this request header
      if (req.headers["x-no-compression"]) {
        return false;
      }
      // Use compression filter function
      return compression.filter(req, res);
    },
  });
};

/**
 * Cache headers middleware for optimal caching
 */
export const cacheHeaders = (req, res, next) => {
  const isAuthenticatedRequest = Boolean(req.headers.authorization);

  // Cache API responses for read operations
  if (req.method === "GET") {
    // Never cache authenticated/admin reads
    if (isAuthenticatedRequest) {
      res.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
    }
    // Cache public data
    else if (
      req.path.includes("/cycles") ||
      req.path.includes("/categories") ||
      req.path.includes("/class-levels")
    ) {
      res.set("Cache-Control", "public, max-age=300, s-maxage=600"); // 5 min client, 10 min CDN
    }
    // Cache health check
    else if (req.path === "/api/health") {
      res.set("Cache-Control", "public, max-age=60");
    }
  }
  // Don't cache mutations
  else {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
  }

  next();
};

/**
 * Response time tracking middleware
 */
export const responseTimeMiddleware = (req, res, next) => {
  const start = Date.now();

  // Wrap res.end to set headers before response is sent
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;

    // Set header before response is finalized (BEFORE calling originalEnd)
    if (!res.headersSent) {
      res.setHeader("X-Response-Time", `${duration}ms`);
    }

    // Log slow responses in production
    if (process.env.NODE_ENV === "production" && duration > 1000) {
      console.warn(`[SLOW API] ${req.method} ${req.path} took ${duration}ms`);
    }

    return originalEnd.apply(res, args);
  };

  next();
};

/**
 * Request deduplication middleware for Vercel serverless optimization
 */
export const requestDeduplication = (() => {
  const cache = new Map();
  const CACHE_TTL = 5000; // 5 seconds

  return (req, res, next) => {
    // Only deduplicate GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Skip non-API requests
    if (!req.path.startsWith("/api/")) {
      return next();
    }

    const cacheKey = `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      // Return cached response
      res.set(cached.headers);
      res.status(cached.status).json(cached.data);
      return;
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = function (data) {
      if (res.statusCode === 200) {
        cache.set(cacheKey, {
          data,
          status: res.statusCode,
          headers: res.getHeaders(),
          timestamp: Date.now(),
        });
      }
      return originalJson(data);
    };

    next();
  };
})();
