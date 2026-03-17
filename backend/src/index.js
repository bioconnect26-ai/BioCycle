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
const isServerlessRuntime = Boolean(
  process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.SERVERLESS === "true",
);

let dbInitialized = false;
let dbInitializationPromise = null;

//
// ============================================================================
// PERFORMANCE & SECURITY MIDDLEWARE
// ============================================================================
//

app.use(compressionMiddleware());

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
);

//
// ============================================================================
// CORS
// ============================================================================
//

const allowedOrigins = (
  process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:8080"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== "https:") {
      return false;
    }

    return hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
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

const getMissingDatabaseEnv = () => {
  if (process.env.DATABASE_URL) {
    return [];
  }

  return ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"].filter(
    (key) => !process.env[key],
  );
};

const initializeDatabase = async () => {
  if (dbInitialized) {
    return;
  }

  if (dbInitializationPromise) {
    await dbInitializationPromise;
    return;
  }

  dbInitializationPromise = (async () => {
    const missingEnv = getMissingDatabaseEnv();
    if (missingEnv.length > 0) {
      throw new Error(
        `Missing database environment variables: ${missingEnv.join(", ")}`,
      );
    }

    await sequelize.authenticate();
    console.log("Database connection established");

    if (NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("Database models synchronized");
    }

    dbInitialized = true;
  })();

  try {
    await dbInitializationPromise;
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    throw error;
  } finally {
    dbInitializationPromise = null;
  }
};

//
// ============================================================================
// HEALTH CHECK
// ============================================================================
//

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BioCycle API is running",
    health: "/api/health",
    endpoints: [
      "/api/auth",
      "/api/users",
      "/api/cycles",
      "/api/categories",
      "/api/class-levels",
    ],
  });
});

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    dbConnected: dbInitialized,
  });
});

app.use(async (req, res, next) => {
  if (req.path === "/api/health") {
    return next();
  }

  try {
    await initializeDatabase();
    return next();
  } catch (error) {
    const statusCode = getMissingDatabaseEnv().length > 0 ? 500 : 503;

    return res.status(statusCode).json({
      success: false,
      error: "Database connection failed",
      details:
        NODE_ENV === "development"
          ? error.message
          : "Check backend database environment variables and connectivity.",
    });
  }
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
// LOCAL SERVER START
// ============================================================================
//

if (!isServerlessRuntime) {
  const startServer = async () => {
    try {
      await initializeDatabase();

      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Environment: ${NODE_ENV}`);
        console.log(`API Base URL: http://localhost:${PORT}/api`);
        console.log(`Health Check: http://localhost:${PORT}/api/health`);
      });
    } catch (error) {
      console.error("Failed to start server:", error.message);
      process.exit(1);
    }
  };

  startServer();
}

export default app;
