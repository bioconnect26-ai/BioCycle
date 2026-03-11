import { ClassLevel } from "../db.js";

export const getAllClassLevels = async (req, res) => {
  try {
    const classLevels = await ClassLevel.findAll({
      where: { isActive: true },
      order: [["order", "ASC"]],
    });

    res.json({
      success: true,
      data: classLevels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch class levels",
      error: error.message,
    });
  }
};

export const createClassLevel = async (req, res) => {
  try {
    const { name, displayName, description, order } = req.body;

    if (!name || !displayName) {
      return res.status(400).json({
        success: false,
        message: "Name and display name are required",
      });
    }

    // Check if class level already exists
    const existing = await ClassLevel.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Class level already exists",
      });
    }

    const classLevel = await ClassLevel.create({
      name,
      displayName,
      description,
      order: order || 0,
    });

    res.status(201).json({
      success: true,
      message: "Class level created successfully",
      data: classLevel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create class level",
      error: error.message,
    });
  }
};

export const updateClassLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, displayName, description, order, isActive } = req.body;

    const classLevel = await ClassLevel.findByPk(id);
    if (!classLevel) {
      return res.status(404).json({
        success: false,
        message: "Class level not found",
      });
    }

    await classLevel.update({
      name: name || classLevel.name,
      displayName: displayName || classLevel.displayName,
      description:
        description !== undefined ? description : classLevel.description,
      order: order !== undefined ? order : classLevel.order,
      isActive: isActive !== undefined ? isActive : classLevel.isActive,
    });

    res.json({
      success: true,
      message: "Class level updated successfully",
      data: classLevel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update class level",
      error: error.message,
    });
  }
};

export const deleteClassLevel = async (req, res) => {
  try {
    const { id } = req.params;

    const classLevel = await ClassLevel.findByPk(id);
    if (!classLevel) {
      return res.status(404).json({
        success: false,
        message: "Class level not found",
      });
    }

    await classLevel.destroy();

    res.json({
      success: true,
      message: "Class level deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete class level",
      error: error.message,
    });
  }
};
