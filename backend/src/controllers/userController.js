import { User, ActivityLog, sequelize } from "../db.js";
import { Op } from "sequelize";

// Get all users with pagination
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const { count, rows } = await User.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["password"] },
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Get single user
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// Approve pending editor
export const approveEditor = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "User is not in pending status",
      });
    }

    // Update user status to active
    await user.update({ status: "active" });

    // Log activity
    await ActivityLog.create({
      userId: req.userId,
      action: "approve",
      entityType: "user",
      entityId: userId,
      changes: {
        status: "pending -> active",
      },
    });

    res.json({
      success: true,
      message: "Editor approved successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to approve editor",
      error: error.message,
    });
  }
};

// Reject/Deactivate user
export const rejectEditor = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const previousStatus = user.status;
    await user.update({ status: "inactive" });

    // Log activity
    await ActivityLog.create({
      userId: req.userId,
      action: "edit",
      entityType: "user",
      entityId: userId,
      changes: {
        status: `${previousStatus} -> inactive`,
      },
    });

    res.json({
      success: true,
      message: "Editor rejected/deactivated",
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject editor",
      error: error.message,
    });
  }
};

// Change user role
export const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const validRoles = ["super_admin", "admin", "editor", "viewer"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const previousRole = user.role;
    await user.update({ role });

    // Log activity
    await ActivityLog.create({
      userId: req.userId,
      action: "edit",
      entityType: "user",
      entityId: userId,
      changes: {
        role: `${previousRole} -> ${role}`,
      },
    });

    res.json({
      success: true,
      message: "User role updated successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to change user role",
      error: error.message,
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.userId === userId && req.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete your own account unless you are super_admin",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Log activity
    await ActivityLog.create({
      userId: req.userId,
      action: "delete",
      entityType: "user",
      entityId: userId,
      changes: {
        deleted: true,
      },
    });

    await user.destroy();

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// Get pending editors
export const getPendingEditors = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where: { status: "pending" },
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [["createdAt", "ASC"]],
      attributes: { exclude: ["password"] },
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending editors",
      error: error.message,
    });
  }
};

// Get dashboard stats for admins
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: "active" } });
    const pendingEditors = await User.count({ where: { status: "pending" } });
    const totalEditors = await User.count({ where: { role: "editor" } });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        pendingEditors,
        totalEditors,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
};
