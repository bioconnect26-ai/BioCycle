import { verifyAccessToken } from "../utils/jwt.js";
import { User } from "../db.js";

// Optional Authentication Middleware (for public routes that show different data based on auth)
export const optionalAuthenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        const user = await User.findByPk(decoded.userId);
        if (user && user.status === "active") {
          req.user = user;
          req.userId = decoded.userId;
          req.role = decoded.role;
        }
      }
    }

    // If no token or invalid, set as viewer
    if (!req.userId) {
      req.role = "viewer";
    }

    next();
  } catch (error) {
    // On error, treat as unauthenticated
    req.role = "viewer";
    next();
  }
};

// Authentication Middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "User account is not active",
      });
    }

    req.user = user;
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    });
  }
};

// Role-Based Access Control Middleware
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No role found",
      });
    }

    if (!allowedRoles.includes(req.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - Insufficient permissions",
      });
    }

    next();
  };
};

// Specific permission checks
export const canManageUsers = (req, res, next) => {
  if (!["super_admin", "admin"].includes(req.role)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden - Only admins can manage users",
    });
  }
  next();
};

export const canEditContent = (req, res, next) => {
  if (!["super_admin", "admin", "editor"].includes(req.role)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden - Only editors and admins can edit content",
    });
  }
  next();
};

export const canApproveContent = (req, res, next) => {
  if (!["super_admin", "admin"].includes(req.role)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden - Only admins can approve content",
    });
  }
  next();
};

export const canDeleteContent = (req, res, next) => {
  if (!["super_admin", "admin"].includes(req.role)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden - Only admins can delete content",
    });
  }
  next();
};
