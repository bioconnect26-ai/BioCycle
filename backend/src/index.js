import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { sequelize } from "./db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import cycleRoutes from "./routes/cycles.js";
import categoryRoutes from "./routes/categories.js";
import classLevelRoutes from "./routes/classLevels.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import {
  compressionMiddleware,
  cacheHeaders,
  responseTimeMiddleware,
  requestDeduplication,
} from "./middleware/optimization.js";

dotenv.config();

let dbInitialized = false;

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ============================================================================
// PERFORMANCE & SECURITY MIDDLEWARE (CRITICAL - FIRST)
// ============================================================================

// Compression middleware - MUST be early
app.use(compressionMiddleware());

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
); // Set security HTTP headers

// HTTPS enforcement (production only)
if (NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(301, `https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}

// CORS configuration - optimized
app.use(
  cors({
    origin: (
      process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:8080"
    ).split(","),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours
  }),
);

// ============================================================================
// REQUEST PARSING MIDDLEWARE
// ============================================================================

// Body parsing middleware - optimized
app.use(express.json({ limit: "5mb" })); // Reduced from 10mb for faster parsing
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// ============================================================================
// OPTIMIZATION MIDDLEWARE
// ============================================================================

// Response time tracking
app.use(responseTimeMiddleware);

// Request deduplication (for Vercel serverless optimization)
app.use(requestDeduplication);

// Cache headers - MUST be before routes
app.use(cacheHeaders);

// Rate limiting
app.use(globalLimiter);

// ============================================================================
// REQUEST LOGGING (DEVELOPMENT ONLY)
// ============================================================================

if (NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================================================
// API ROUTES
// ============================================================================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cycles", cycleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/class-levels", classLevelRoutes);

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    dbConnected: dbInitialized,
  });
});

// ============================================================================
// 404 HANDLER
// ============================================================================

app.use(notFoundHandler);

// ============================================================================
// ERROR HANDLER (MUST BE LAST)
// ============================================================================

app.use(errorHandler);

// ============================================================================
// DATABASE INITIALIZATION & SERVER START
// ============================================================================

// Single database connection for serverless compatibility
const initializeDatabase = async () => {
  if (dbInitialized) {
    return;
  }

  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("✓ Database connection established");

    // Sync models with database (only alter in development)
    await sequelize.sync({
      alter: NODE_ENV === "development",
      force: false,
    });
    console.log("✓ Database models synchronized");

    dbInitialized = true;
  } catch (error) {
    console.error("✗ Database initialization failed:", error.message);
    throw error;
  }
};

// Export app for serverless (Vercel)
export default app;

// Start server only when run directly (not imported)
if (process.env.NODE_ENV !== "production" || !process.env.SERVERLESS) {
  const startServer = async () => {
    try {
      await initializeDatabase();

      app.listen(PORT, () => {
        console.log(`✓ Server running on http://localhost:${PORT}`);
        console.log(`✓ Environment: ${NODE_ENV}`);
        console.log(`✓ API Base URL: http://localhost:${PORT}/api`);
        console.log(`✓ Health Check: http://localhost:${PORT}/api/health`);
      });
    } catch (error) {
      console.error("✗ Failed to start server:", error.message);
      process.exit(1);
    }
  };

  startServer();
}

// For serverless: initialize database on first request if needed
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
    } catch (error) {
      console.error("Database initialization failed during request:", error);
      return res.status(503).json({
        success: false,
        error: "Database connection failed",
      });
    }
  }
  next();
});
