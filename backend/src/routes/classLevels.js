import express from "express";
import {
  getAllClassLevels,
  createClassLevel,
  updateClassLevel,
  deleteClassLevel,
} from "../controllers/classLevelController.js";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public route - get all active class levels
router.get("/", getAllClassLevels);

// Admin routes
router.post(
  "/",
  authenticateToken,
  authorize("super_admin", "admin"),
  createClassLevel,
);
router.put(
  "/:id",
  authenticateToken,
  authorize("super_admin", "admin"),
  updateClassLevel,
);
router.delete(
  "/:id",
  authenticateToken,
  authorize("super_admin", "admin"),
  deleteClassLevel,
);

export default router;
