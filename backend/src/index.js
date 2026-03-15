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

const app = express();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

let dbInitialized = false;

//
// ============================================================================
// PERFORMANCE & SECURITY MIDDLEWARE
// ============================================================================
//

// Compression first
app.use(compressionMiddleware());

// Security headers
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
  })
);

//
// ============================================================================
// CORS
// ============================================================================
//

app.use(
  cors({
    origin: (
      process.env.CORS_ORIGIN ||
      "http://localhost:5173,http://localhost:8080"
    ).split(","),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

//
// ============================================================================
// BODY PARSING
// ============================================================================
//

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

//
// ============================================================================
// OPTIMIZATION MIDDLEWARE
// ============================================================================
//

app.use(responseTimeMiddleware);
app.use(requestDeduplication);
app.use(cacheHeaders);
app.use(globalLimiter);

//
// ============================================================================
// DEVELOPMENT LOGGING
// ============================================================================
//

if (NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

//
// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================
//

const initializeDatabase = async () => {
  if (dbInitialized) return;

  try {
    await sequelize.authenticate();
    console.log("✓ Database connection established");

    if (NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("✓ Database models synchronized");
    }

    dbInitialized = true;
  } catch (error) {
    console.error("✗ Database initialization failed:", error.message);
    throw error;
  }
};

// Initialize DB before routes (important for serverless)
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
    } catch (error) {
      console.error("Database initialization failed:", error);
      return res.status(503).json({
        success: false,
        error: "Database connection failed",
      });
    }
  }
  next();
});

//
// ============================================================================
// API ROUTES
// ============================================================================
//

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cycles", cycleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/class-levels", classLevelRoutes);

//
// ============================================================================
// HEALTH CHECK
// ============================================================================
//

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    dbConnected: dbInitialized,
  });
});

//
// ============================================================================
// 404 HANDLER
// ============================================================================
//

app.use(notFoundHandler);

//
// ============================================================================
// ERROR HANDLER
// ============================================================================
//

app.use(errorHandler);

//
// ============================================================================
// LOCAL SERVER START (NOT FOR SERVERLESS)
// ============================================================================
//

if (!process.env.SERVERLESS) {
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

//
// ============================================================================
// EXPORT FOR SERVERLESS
// ============================================================================
//

export default app;