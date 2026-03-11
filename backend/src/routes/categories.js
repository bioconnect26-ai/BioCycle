import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes - get categories
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Protected routes - create category (admins only)
router.post(
  "/",
  authenticateToken,
  authorize("super_admin", "admin"),
  createCategory,
);

// Update category (admins only)
router.put(
  "/:id",
  authenticateToken,
  authorize("super_admin", "admin"),
  updateCategory,
);

// Delete category (admins only)
router.delete(
  "/:id",
  authenticateToken,
  authorize("super_admin", "admin"),
  deleteCategory,
);

export default router;
