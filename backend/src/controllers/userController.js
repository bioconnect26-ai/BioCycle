import { User, ActivityLog, Cycle, sequelize } from "../db.js";
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
    const now = new Date();
    const onlineThreshold = new Date(now.getTime() - 15 * 60 * 1000);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    const [
      totalUsers,
      activeUsers,
      pendingApproval,
      totalEditors,
      onlineUsers,
      lockedUsers,
      newUsersThisWeek,
      recentUsers,
      totalCycles,
      publishedCycles,
      draftCycles,
      pendingReviewCycles,
      updatedCyclesToday,
      newCyclesThisWeek,
      recentCycles,
      recentActivity,
      activitySummary,
      topContributors,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { status: "active" } }),
      User.count({ where: { status: "pending" } }),
      User.count({ where: { role: "editor" } }),
      User.count({
        where: {
          status: "active",
          lastLogin: { [Op.gte]: onlineThreshold },
        },
      }),
      User.count({
        where: {
          lockoutUntil: { [Op.gt]: now },
        },
      }),
      User.count({
        where: {
          createdAt: { [Op.gte]: weekStart },
        },
      }),
      User.findAll({
        limit: 5,
        order: [["lastLogin", "DESC NULLS LAST"]],
        attributes: [
          "id",
          "fullName",
          "email",
          "role",
          "status",
          "lastLogin",
          "createdAt",
        ],
      }),
      Cycle.count(),
      Cycle.count({ where: { status: "published" } }),
      Cycle.count({ where: { status: "draft" } }),
      Cycle.count({ where: { status: "pending_review" } }),
      Cycle.count({
        where: {
          updatedAt: { [Op.gte]: todayStart },
        },
      }),
      Cycle.count({
        where: {
          createdAt: { [Op.gte]: weekStart },
        },
      }),
      Cycle.findAll({
        limit: 6,
        order: [["updatedAt", "DESC"]],
        attributes: [
          "id",
          "title",
          "slug",
          "status",
          "updatedAt",
          "publishedAt",
          "createdBy",
          "updatedBy",
        ],
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "fullName", "email"],
          },
          {
            model: User,
            as: "updater",
            attributes: ["id", "fullName", "email"],
          },
        ],
      }),
      ActivityLog.findAll({
        limit: 10,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: User,
            attributes: ["id", "fullName", "email", "profileImage"],
          },
        ],
      }),
      ActivityLog.findAll({
        attributes: [
          "action",
          [sequelize.fn("COUNT", sequelize.col("action")), "count"],
        ],
        group: ["action"],
        raw: true,
      }),
      ActivityLog.findAll({
        attributes: [
          "userId",
          [sequelize.fn("COUNT", sequelize.col("ActivityLog.id")), "count"],
        ],
        where: {
          createdAt: { [Op.gte]: weekStart },
        },
        include: [
          {
            model: User,
            attributes: ["id", "fullName", "email", "role"],
          },
        ],
        group: ["userId", "User.id"],
        order: [[sequelize.literal("count"), "DESC"]],
        limit: 5,
      }),
    ]);

    const formatRelativeTime = (date) => {
      if (!date) return "Never";

      const diffMs = now.getTime() - new Date(date).getTime();
      const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

      if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
      }

      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) {
        return `${diffHours}h ago`;
      }

      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    };

    const describeActivity = (activity) => {
      const actor = activity.User?.fullName || activity.User?.email || "System";
      const entity = activity.entityType;
      const action = activity.action;

      const verbMap = {
        create: "created",
        edit: "updated",
        delete: "deleted",
        publish: "published",
        approve: "approved",
      };

      return {
        id: activity.id,
        title: `${verbMap[action] || action} ${entity}`,
        user: actor,
        action,
        entityType: entity,
        entityId: activity.entityId,
        time: formatRelativeTime(activity.createdAt),
        createdAt: activity.createdAt,
        changes: activity.changes,
      };
    };

    res.json({
      success: true,
      totalUsers,
      activeUsers,
      totalEditors,
      pendingApproval,
      onlineUsers,
      lockedUsers,
      newUsersThisWeek,
      totalCycles,
      publishedCycles,
      draftCycles,
      pendingReviewCycles,
      updatedCyclesToday,
      newCyclesThisWeek,
      activeEditors: totalEditors,
      recentUsers: recentUsers.map((user) => ({
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
        lastSeen: formatRelativeTime(user.lastLogin),
        isOnline:
          user.status === "active" &&
          Boolean(user.lastLogin && new Date(user.lastLogin) >= onlineThreshold),
        createdAt: user.createdAt,
      })),
      recentCycles: recentCycles.map((cycle) => ({
        id: cycle.id,
        title: cycle.title,
        slug: cycle.slug,
        status: cycle.status,
        updatedAt: cycle.updatedAt,
        publishedAt: cycle.publishedAt,
        lastUpdated: formatRelativeTime(cycle.updatedAt),
        creator: cycle.creator?.fullName || cycle.creator?.email || "Unknown",
        updater:
          cycle.updater?.fullName ||
          cycle.updater?.email ||
          cycle.creator?.fullName ||
          cycle.creator?.email ||
          "Unknown",
      })),
      recentActivity: recentActivity.map(describeActivity),
      activitySummary: activitySummary.reduce((acc, item) => {
        acc[item.action] = Number(item.count);
        return acc;
      }, {}),
      topContributors: topContributors.map((entry) => ({
        id: entry.userId,
        name: entry.User?.fullName || entry.User?.email || "Unknown",
        email: entry.User?.email || "",
        role: entry.User?.role || "editor",
        actions: Number(entry.get("count")),
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
};
