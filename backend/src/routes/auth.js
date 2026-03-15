import express from "express";
import {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  logout,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  loginLimiter,
  registerLimiter,
  refreshTokenLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

// Public routes with rate limiting
router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/refresh-token", refreshTokenLimiter, refreshToken);

// Protected routes
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);
router.post("/logout", authenticateToken, logout);

export default router;
