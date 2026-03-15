import {
  Cycle,
  CycleStep,
  Flashcard,
  QuizQuestion,
  MemoryPalaceEntry,
  QuickFact,
  Category,
  ClassLevel,
  User,
  ActivityLog,
} from "../db.js";
import { Op } from "sequelize";

// Get all cycles with filters
export const getAllCycles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      classLevelId,
      status,
      search,
      sortBy = "createdAt",
      order = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Only show published cycles to public viewers
    if (req.role === "viewer" || !req.role) {
      where.status = "published";
    } else if (status) {
      where.status = status;
    }

    if (category) where.categoryId = category;
    if (classLevelId) where.classLevelId = classLevelId;

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Cycle.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [[sortBy, order]],
      include: [
        { model: Category, as: "category" },
        { model: ClassLevel, as: "classLevel" },
        { model: User, as: "creator", attributes: { exclude: ["password"] } },
        {
          model: CycleStep,
          as: "steps",
          separate: true,
          order: [["stepOrder", "ASC"]],
        },
        {
          model: Flashcard,
          as: "flashcards",
          separate: true,
          order: [["position", "ASC"]],
        },
        {
          model: QuizQuestion,
          as: "quizQuestions",
          separate: true,
          order: [["position", "ASC"]],
        },
        {
          model: MemoryPalaceEntry,
          as: "memoryPalace",
          separate: true,
          order: [["position", "ASC"]],
        },
        {
          model: QuickFact,
          as: "quickFacts",
          separate: true,
          order: [["position", "ASC"]],
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
      message: "Failed to fetch cycles",
      error: error.message,
    });
  }
};

// Get single cycle by slug
export const getCycleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const cycle = await Cycle.findOne({
      where: { slug },
      include: [
        { model: Category, as: "category" },
        { model: ClassLevel, as: "classLevel" },
        { model: User, as: "creator", attributes: { exclude: ["password"] } },
        { model: User, as: "updater", attributes: { exclude: ["password"] } },
        { model: CycleStep, as: "steps", order: [["stepOrder", "ASC"]] },
        { model: Flashcard, as: "flashcards", order: [["position", "ASC"]] },
        {
          model: QuizQuestion,
          as: "quizQuestions",
          order: [["position", "ASC"]],
        },
        {
          model: MemoryPalaceEntry,
          as: "memoryPalace",
          order: [["position", "ASC"]],
        },
        { model: QuickFact, as: "quickFacts", order: [["position", "ASC"]] },
      ],
    });

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: "Cycle not found",
      });
    }

    // Only published cycles should be publicly visible. Drafts and
    // pending_review items are restricted to the creator or admins.
    if (
      cycle.status !== "published" &&
      (!req.userId ||
        (req.userId !== cycle.createdBy &&
          !["admin", "super_admin"].includes(req.role)))
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this cycle",
      });
    }

    res.json({
      success: true,
      cycle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cycle",
      error: error.message,
    });
  }
};

// Get single cycle by ID
export const getCycleById = async (req, res) => {
  try {
    const { id } = req.params;

    const cycle = await Cycle.findByPk(id, {
      include: [
        { model: Category, as: "category" },
        { model: ClassLevel, as: "classLevel" },
        { model: User, as: "creator", attributes: { exclude: ["password"] } },
        { model: User, as: "updater", attributes: { exclude: ["password"] } },
        { model: CycleStep, as: "steps", order: [["stepOrder", "ASC"]] },
        { model: Flashcard, as: "flashcards", order: [["position", "ASC"]] },
        {
          model: QuizQuestion,
          as: "quizQuestions",
          order: [["position", "ASC"]],
        },
        {
          model: MemoryPalaceEntry,
          as: "memoryPalace",
          order: [["position", "ASC"]],
        },
        { model: QuickFact, as: "quickFacts", order: [["position", "ASC"]] },
      ],
    });

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: "Cycle not found",
      });
    }

    res.json({
      success: true,
      cycle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cycle",
      error: error.message,
    });
  }
};

// Create new cycle
export const createCycle = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      categoryId,
      classLevelId,
      videoUrl,
      simulationUrl,
      simulationAttribution,
      coverImage,
      tags,
      icon,
      color,
      steps,
      flashcards,
      quizQuestions,
      memoryPalace,
      quickFacts,
    } = req.body;

    // Validate required fields
    if (!title || !slug || !description || !categoryId || !classLevelId) {
      return res.status(400).json({
        success: false,
        message:
          "Title, slug, description, categoryId, and classLevelId are required",
      });
    }

    // Check if slug is unique
    const existingCycle = await Cycle.findOne({ where: { slug } });
    if (existingCycle) {
      return res.status(409).json({
        success: false,
        message: "Slug is already in use",
      });
    }

    // Create cycle
    const cycle = await Cycle.create({
      title,
      slug,
      description,
      categoryId,
      classLevelId,
      videoUrl,
      simulationUrl,
      simulationAttribution,
      coverImage,
      tags: tags || [],
      icon,
      color,
      createdBy: req.userId,
      status: "draft",
    });

    // Add steps (journey)
    if (steps && Array.isArray(steps)) {
      const stepData = steps.map((step, index) => ({
        cycleId: cycle.id,
        stepOrder: index + 1,
        title: step.title,
        description: step.description,
        detail: step.detail,
        memoryTrick: step.memoryTrick,
      }));
      await CycleStep.bulkCreate(stepData);
    }

    // Add flashcards
    if (flashcards && Array.isArray(flashcards)) {
      const cardData = flashcards.map((card, index) => ({
        cycleId: cycle.id,
        position: index + 1,
        frontTitle: card.frontTitle,
        frontDescription: card.frontDescription,
        backDetail: card.backDetail,
        memoryTrick: card.memoryTrick,
      }));
      await Flashcard.bulkCreate(cardData);
    }

    // Add quiz questions
    if (quizQuestions && Array.isArray(quizQuestions)) {
      const quizData = quizQuestions.map((q, index) => ({
        cycleId: cycle.id,
        position: index + 1,
        question: q.question,
        options: q.options || [],
        answer: q.answer,
      }));
      await QuizQuestion.bulkCreate(quizData);
    }

    // Add memory palace entries
    if (memoryPalace && Array.isArray(memoryPalace)) {
      const memData = memoryPalace.map((m, index) => ({
        cycleId: cycle.id,
        position: index + 1,
        title: m.title,
        memoryTrick: m.memoryTrick,
      }));
      await MemoryPalaceEntry.bulkCreate(memData);
    }

    // Add quick facts
    if (quickFacts && Array.isArray(quickFacts)) {
      const factData = quickFacts.map((fact, index) => ({
        cycleId: cycle.id,
        label: fact.label,
        value: fact.value,
        position: index + 1,
      }));
      await QuickFact.bulkCreate(factData);
    }

    // Log activity
    await ActivityLog.create({
      userId: req.userId,
      action: "create",
      entityType: "cycle",
      entityId: cycle.id,
      changes: { created: true },
    });

    const newCycle = await Cycle.findByPk(cycle.id, {
      include: [
        { model: Category, as: "category" },
        { model: ClassLevel, as: "classLevel" },
        { model: CycleStep, as: "steps" },
        { model: Flashcard, as: "flashcards" },
        { model: QuizQuestion, as: "quizQuestions" },
        { model: MemoryPalaceEntry, as: "memoryPalace" },
        { model: QuickFact, as: "quickFacts" },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Cycle created successfully",
      cycle: newCycle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create cycle",
      error: error.message,
    });
  }
};

// Update cycle
export const updateCycle = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      description,
      categoryId,
      classLevelId,
      videoUrl,
      simulationUrl,
      simulationAttribution,
      coverImage,
      tags,
      icon,
      color,
      steps,
      flashcards,
      quizQuestions,
      memoryPalace,
      quickFacts,
    } = req.body;

    const cycle = await Cycle.findByPk(id);
    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: "Cycle not found",
      });
    }

    // Check permission
    if (
      cycle.createdBy !== req.userId &&
      !["admin", "super_admin"].includes(req.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to edit this cycle",
      });
    }

    // Check if slug exists (if changing)
    if (slug && slug !== cycle.slug) {
      const existingCycle = await Cycle.findOne({ where: { slug } });
      if (existingCycle) {
        return res.status(409).json({
          success: false,
          message: "Slug is already in use",
        });
      }
    }

    // Update cycle
    await cycle.update({
      title: title || cycle.title,
      slug: slug || cycle.slug,
      description: description || cycle.description,
      categoryId: categoryId || cycle.categoryId,
      classLevelId: classLevelId || cycle.classLevelId,
      videoUrl: videoUrl || cycle.videoUrl,
      simulationUrl: simulationUrl || cycle.simulationUrl,
      simulationAttribution:
        simulationAttribution || cycle.simulationAttribution,
      coverImage: coverImage || cycle.coverImage,
      tags: tags || cycle.tags,
      icon: icon || cycle.icon,
      color: color || cycle.color,
      updatedBy: req.userId,
      status: "draft", // Reset to draft when edited
    });

    // Update steps if provided (journey)
    if (steps && Array.isArray(steps)) {
      await CycleStep.destroy({ where: { cycleId: id } });
      const stepData = steps.map((step, index) => ({
        cycleId: cycle.id,
        stepOrder: index + 1,
        title: step.title,
        description: step.description,
        detail: step.detail,
        memoryTrick: step.memoryTrick,
      }));
      await CycleStep.bulkCreate(stepData);
    }

    // Update flashcards
    if (flashcards && Array.isArray(flashcards)) {
      await Flashcard.destroy({ where: { cycleId: id } });
      const cardData = flashcards.map((card, index) => ({
        cycleId: cycle.id,
        position: index + 1,
        frontTitle: card.frontTitle,
        frontDescription: card.frontDescription,
        backDetail: card.backDetail,
        memoryTrick: card.memoryTrick,
      }));
      await Flashcard.bulkCreate(cardData);
    }

    // Update quiz questions
    if (quizQuestions && Array.isArray(quizQuestions)) {
      await QuizQuestion.destroy({ where: { cycleId: id } });
      const quizData = quizQuestions.map((q, index) => ({
        cycleId: cycle.id,
        position: index + 1,
        question: q.question,
        options: q.options || [],
        answer: q.answer,
      }));
      await QuizQuestion.bulkCreate(quizData);
    }

    // Update memory palace entries
    if (memoryPalace && Array.isArray(memoryPalace)) {
      await MemoryPalaceEntry.destroy({ where: { cycleId: id } });
      const memData = memoryPalace.map((m, index) => ({
        cycleId: cycle.id,
        position: index + 1,
        title: m.title,
        memoryTrick: m.memoryTrick,
      }));
      await MemoryPalaceEntry.bulkCreate(memData);
    }

    // Update quick facts if provided
    if (quickFacts && Array.isArray(quickFacts)) {
      await QuickFact.destroy({ where: { cycleId: id } });
      const factData = quickFacts.map((fact, index) => ({
        cycleId: cycle.id,
        label: fact.label,
        value: fact.value,
        position: index + 1,
      }));
      await QuickFact.bulkCreate(factData);
    }

    // Log activity
    await ActivityLog.create({
      userId: req.userId,
      action: "edit",
      entityType: "cycle",
      entityId: cycle.id,
      changes: { updated: true },
    });

    const updatedCycle = await Cycle.findByPk(cycle.id, {
      include: [
        { model: Category, as: "category" },
        { model: CycleStep, as: "steps" },
        { model: Flashcard, as: "flashcards" },
        { model: QuizQuestion, as: "quizQuestions" },
        { model: MemoryPalaceEntry, as: "memoryPalace" },
        { model: QuickFact, as: "quickFacts" },
      ],
    });

    res.json({
      success: true,
      message: "Cycle updated successfully",
      cycle: updatedCycle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update cycle",
      error: error.message,
    });
  }
};

// Publish cycle
export const publishCycle = async (req, res) => {
  try {
    const { id } = req.params;

    const cycle = await Cycle.findByPk(id);
    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: "Cycle not found",
      });
    }

    // Only admins can publish
    if (!["admin", "super_admin"].includes(req.role)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can publish cycles",
      });
    }

    await cycle.update({
      status: "published",
      publishedAt: new Date(),
    });

    // Log activity
    await ActivityLog.create({
      userId: req.userId,
      action: "publish",
      entityType: "cycle",
      entityId: cycle.id,
      changes: { status: "published" },
    });

    res.json({
      success: true,
      message: "Cycle published successfully",
      cycle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to publish cycle",
      error: error.message,
    });
  }
};

// Delete cycle
export const deleteCycle = async (req, res) => {
  try {
    const { id } = req.params;

    const cycle = await Cycle.findByPk(id);
    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: "Cycle not found",
      });
    }

    // Log activity before deletion
    await ActivityLog.create({
      userId: req.userId,
      action: "delete",
      entityType: "cycle",
      entityId: cycle.id,
      changes: { deleted: true },
    });

    await CycleStep.destroy({ where: { cycleId: id } });
    await Flashcard.destroy({ where: { cycleId: id } });
    await QuizQuestion.destroy({ where: { cycleId: id } });
    await MemoryPalaceEntry.destroy({ where: { cycleId: id } });
    await QuickFact.destroy({ where: { cycleId: id } });
    await cycle.destroy();

    res.json({
      success: true,
      message: "Cycle deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete cycle",
      error: error.message,
    });
  }
};
