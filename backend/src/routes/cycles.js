import express from "express";
import {
  getAllCycles,
  getCycleBySlug,
  getCycleById,
  createCycle,
  updateCycle,
  publishCycle,
  deleteCycle,
} from "../controllers/cycleController.js";
import {
  authenticateToken,
  optionalAuthenticateToken,
  authorize,
  canEditContent,
  canApproveContent,
  canDeleteContent,
} from "../middleware/auth.js";

const router = express.Router();

// Public routes - get published cycles (optional auth for more access)
router.get("/", optionalAuthenticateToken, getAllCycles);
router.get("/slug/:slug", optionalAuthenticateToken, getCycleBySlug);
router.get("/:id", optionalAuthenticateToken, getCycleById);

// Protected routes - create cycle (editors and admins)
router.post("/", authenticateToken, canEditContent, createCycle);

// Update cycle (editors and admins)
router.put("/:id", authenticateToken, canEditContent, updateCycle);

// Publish cycle (admins only)
router.put("/:id/publish", authenticateToken, canApproveContent, publishCycle);

// Delete cycle (admins only)
router.delete("/:id", authenticateToken, canDeleteContent, deleteCycle);

export default router;
