import express from "express";
import {
  getAllUsers,
  getUserById,
  approveEditor,
  rejectEditor,
  changeUserRole,
  deleteUser,
  getPendingEditors,
  getDashboardStats,
} from "../controllers/userController.js";
import {
  authenticateToken,
  authorize,
  canManageUsers,
} from "../middleware/auth.js";

const router = express.Router();

// All user routes require authentication and admin role
router.use(authenticateToken);

// Get dashboard stats
router.get(
  "/dashboard/stats",
  authorize("super_admin", "admin"),
  getDashboardStats,
);

// Get all users
router.get("/", authorize("super_admin", "admin"), getAllUsers);

// Get pending editors
router.get(
  "/pending-approval/list",
  authorize("super_admin", "admin"),
  getPendingEditors,
);

// Get single user
router.get("/:id", authorize("super_admin", "admin"), getUserById);

// Approve pending editor
router.put(
  "/:userId/approve",
  authorize("super_admin", "admin"),
  approveEditor,
);

// Reject/Deactivate user
router.put("/:userId/reject", authorize("super_admin", "admin"), rejectEditor);

// Change user role
router.put("/:userId/role", authorize("super_admin", "admin"), changeUserRole);

// Delete user
router.delete("/:userId", authorize("super_admin", "admin"), deleteUser);

export default router;
