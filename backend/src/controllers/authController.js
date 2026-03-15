import { User } from "../db.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import dotenv from "dotenv";

dotenv.config();

// Validation helpers
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 100;
};

const isValidPassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validate inputs
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and full name are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters with uppercase, lowercase, and numbers",
      });
    }

    if (fullName.length < 2 || fullName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Full name must be between 2 and 100 characters",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create new user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      fullName,
      role: "editor",
      status: "pending", // Requires admin approval
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Awaiting admin approval.",
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Find user (case-insensitive)
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      return res.status(429).json({
        success: false,
        message:
          "Account temporarily locked due to multiple failed login attempts. Try again in 30 minutes.",
      });
    }

    // Check user status
    if (user.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your account is pending admin approval",
      });
    }

    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Record failed attempt
      await user.recordFailedLogin();

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      message: "Login successful",
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await User.findByPk(decoded.userId);
    if (!user || user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    const newAccessToken = generateAccessToken(user.id, user.role);

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Token refresh failed",
      error: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, profileImage } = req.body;
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.update({
      fullName: fullName || user.fullName,
      profileImage: profileImage || user.profileImage,
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  // Logout is typically handled on the client side by clearing tokens
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};
