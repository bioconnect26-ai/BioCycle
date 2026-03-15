import rateLimit, { ipKeyGenerator as getIp } from "express-rate-limit";

// Strict rate limiting for login attempts (5 requests per 15 minutes)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per windowMs
  message:
    "Too many login attempts from this IP. Please try again after 15 minutes.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Don't count successful logins
    return req.method !== "POST";
  },
  keyGenerator: (req) => {
    // Rate limit by IP + email combination for more targeted protection
    const ip = getIp(req);
    const email = req.body?.email || "unknown";
    return `login:${ip}:${email}`;
  },
});

// Moderate rate limiting for register (3 requests per hour)
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message:
    "Too many registrations from this IP. Please try again after an hour.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate rate limiting for token refresh (10 requests per 5 minutes)
export const refreshTokenLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: "Too many token refresh attempts. Please try again after 5 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiting (100 requests per 15 minutes per IP)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
