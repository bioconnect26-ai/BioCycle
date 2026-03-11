import { Category, Cycle, ActivityLog } from "../db.js";
import { Op } from "sequelize";

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Category.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(limit),
      include: [
        {
          model: Cycle,
          as: "cycles",
          attributes: ["id", "title", "slug"],
          required: false,
        },
      ],
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
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

// Get single category
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Cycle,
          as: "cycles",
          attributes: ["id", "title", "slug", "description"],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message,
    });
  }
};

// Create category
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
    }

    // Check if slug exists
    const existingCategory = await Category.findOne({ where: { slug } });
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Slug already exists",
      });
    }

    const category = await Category.create({
      name,
      slug,
      description,
    });

    // Log activity
    await ActivityLog.create({
      userId: req.userId,
      action: "create",
      entityType: "category",
      entityId: category.id,
      changes: { created: true },
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if new slug exists (if changing)
    if (slug && slug !== category.slug) {
      const existingCategory = await Category.findOne({ where: { slug } });
      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: "Slug already exists",
        });
      }
    }

    await category.update({
      name: name || category.name,
      slug: slug || category.slug,
      description:
        description !== undefined ? description : category.description,
    });

    // Log activity
    await ActivityLog.create({
      userId: req.userId,
      action: "edit",
      entityType: "category",
      entityId: category.id,
      changes: { updated: true },
    });

    res.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if category has cycles
    const cycleCount = await Cycle.count({ where: { categoryId: id } });
    if (cycleCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${cycleCount} cycles. Please reassign or delete cycles first.`,
      });
    }

    // Log activity
    await ActivityLog.create({
      userId: req.userId,
      action: "delete",
      entityType: "category",
      entityId: category.id,
      changes: { deleted: true },
    });

    await category.destroy();

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};
