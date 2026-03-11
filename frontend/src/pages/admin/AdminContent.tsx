import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Edit,
  Eye,
  Plus,
  Trash2,
  X,
  GripVertical,
  ExternalLink,
} from "lucide-react";
import {
  cycleService,
  CycleData,
  CycleStep,
  Flashcard,
  QuizQuestion,
  MemoryPalaceEntry,
  QuickFact,
} from "@/services/cycleService";
import { categoryService, Category } from "@/services/categoryService";
import { classLevelService, ClassLevel } from "@/services/classLevelService";

type CycleFormData = {
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  classLevelId: string;
  videoUrl: string;
  coverImage: string;
  icon: string;
  color: string;
  tagsText: string;
  steps: CycleStep[];
  quickFacts: QuickFact[];
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
  memoryPalace: MemoryPalaceEntry[];
};

const emptyStep = (): CycleStep => ({
  title: "",
  description: "",
  detail: "",
  memoryTrick: "",
});

const emptyFlashcard = (): Flashcard => ({
  frontTitle: "",
  frontDescription: "",
  backDetail: "",
  memoryTrick: "",
});

const emptyQuizQuestion = (): QuizQuestion => ({
  question: "",
  options: ["", "", "", ""],
  answer: "",
});

const emptyMemoryPalaceEntry = (): MemoryPalaceEntry => ({
  title: "",
  memoryTrick: "",
});

const emptyFact = (): QuickFact => ({
  label: "",
  value: "",
});

const emptyForm = (): CycleFormData => ({
  title: "",
  slug: "",
  description: "",
  categoryId: "",
  classLevelId: "",
  videoUrl: "",
  coverImage: "",
  icon: "atom",
  color: "#059669",
  tagsText: "",
  steps: [emptyStep()],
  flashcards: [emptyFlashcard()],
  quizQuestions: [emptyQuizQuestion()],
  memoryPalace: [emptyMemoryPalaceEntry()],
  quickFacts: [emptyFact()],
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeFormData = (
  cycle?: Partial<CycleData> | null,
): CycleFormData => ({
  title: cycle?.title || "",
  slug: cycle?.slug || "",
  description: cycle?.description || "",
  categoryId: cycle?.categoryId || "",
  classLevelId: cycle?.classLevelId || "",
  videoUrl: cycle?.videoUrl || "",
  coverImage: cycle?.coverImage || "",
  icon: typeof cycle?.icon === "string" ? cycle.icon : "atom",
  color: cycle?.color || "#059669",
  tagsText: Array.isArray(cycle?.tags) ? cycle.tags.join(", ") : "",
  steps: cycle?.steps?.length
    ? cycle.steps.map((step) => ({
        title: step.title || "",
        description: step.description || "",
        detail: step.detail || "",
        memoryTrick: step.memoryTrick || "",
      }))
    : [emptyStep()],
  flashcards: cycle?.flashcards?.length
    ? cycle.flashcards.map((card) => ({
        frontTitle: card.frontTitle || "",
        frontDescription: card.frontDescription || "",
        backDetail: card.backDetail || "",
        memoryTrick: card.memoryTrick || "",
      }))
    : [emptyFlashcard()],
  quizQuestions: cycle?.quizQuestions?.length
    ? cycle.quizQuestions.map((q) => ({
        question: q.question || "",
        options: Array.isArray(q.options) ? q.options : ["", "", "", ""],
        answer: q.answer || "",
      }))
    : [emptyQuizQuestion()],
  memoryPalace: cycle?.memoryPalace?.length
    ? cycle.memoryPalace.map((m) => ({
        title: m.title || "",
        memoryTrick: m.memoryTrick || "",
      }))
    : [emptyMemoryPalaceEntry()],
  quickFacts: cycle?.quickFacts?.length
    ? cycle.quickFacts.map((fact) => ({
        label: fact.label || "",
        value: fact.value || "",
      }))
    : [emptyFact()],
});

const statusStyles: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-600",
  pending_review: "bg-yellow-500/10 text-yellow-600",
  draft: "bg-slate-500/10 text-slate-600",
};

const AdminContent = () => {
  const [cycles, setCycles] = useState<CycleData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState<CycleFormData>(emptyForm());

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [cyclesRes, categoriesRes, classLevelsRes] = await Promise.all([
        cycleService.getAllCycles(page, 20),
        categoryService.getAllCategories(),
        classLevelService.getAllClassLevels(),
      ]);

      setCycles(cyclesRes.data || []);
      setCategories(categoriesRes.data || categoriesRes);
      setClassLevels(classLevelsRes.data || classLevelsRes);
    } catch (err) {
      console.error("Failed to fetch admin content data:", err);
      setError("Failed to load content data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === formData.categoryId),
    [categories, formData.categoryId],
  );

  const selectedClassLevel = useMemo(
    () => classLevels.find((level) => level.id === formData.classLevelId),
    [classLevels, formData.classLevelId],
  );

  const updateForm = <K extends keyof CycleFormData>(
    key: K,
    value: CycleFormData[K],
  ) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const updateStep = (index: number, key: keyof CycleStep, value: string) => {
    setFormData((current) => ({
      ...current,
      steps: current.steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, [key]: value } : step,
      ),
    }));
  };

  const updateFlashcard = (
    index: number,
    key: keyof Flashcard,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      flashcards: current.flashcards.map((card, cardIndex) =>
        cardIndex === index ? { ...card, [key]: value } : card,
      ),
    }));
  };

  const updateQuizQuestion = (
    index: number,
    key: keyof QuizQuestion,
    value: string | string[],
  ) => {
    setFormData((current) => ({
      ...current,
      quizQuestions: current.quizQuestions.map((q, qIndex) =>
        qIndex === index ? { ...q, [key]: value } : q,
      ),
    }));
  };

  const updateMemoryEntry = (
    index: number,
    key: keyof MemoryPalaceEntry,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      memoryPalace: current.memoryPalace.map((m, mIndex) =>
        mIndex === index ? { ...m, [key]: value } : m,
      ),
    }));
  };

  const updateFact = (index: number, key: keyof QuickFact, value: string) => {
    setFormData((current) => ({
      ...current,
      quickFacts: current.quickFacts.map((fact, factIndex) =>
        factIndex === index ? { ...fact, [key]: value } : fact,
      ),
    }));
  };

  const removeStep = (index: number) => {
    setFormData((current) => ({
      ...current,
      steps:
        current.steps.length === 1
          ? [emptyStep()]
          : current.steps.filter((_, stepIndex) => stepIndex !== index),
    }));
  };

  const removeFact = (index: number) => {
    setFormData((current) => ({
      ...current,
      quickFacts:
        current.quickFacts.length === 1
          ? [emptyFact()]
          : current.quickFacts.filter((_, factIndex) => factIndex !== index),
    }));
  };

  const removeFlashcard = (index: number) => {
    setFormData((current) => ({
      ...current,
      flashcards:
        current.flashcards.length === 1
          ? [emptyFlashcard()]
          : current.flashcards.filter((_, cardIndex) => cardIndex !== index),
    }));
  };

  const removeQuizQuestion = (index: number) => {
    setFormData((current) => ({
      ...current,
      quizQuestions:
        current.quizQuestions.length === 1
          ? [emptyQuizQuestion()]
          : current.quizQuestions.filter((_, qIndex) => qIndex !== index),
    }));
  };

  const removeMemoryEntry = (index: number) => {
    setFormData((current) => ({
      ...current,
      memoryPalace:
        current.memoryPalace.length === 1
          ? [emptyMemoryPalaceEntry()]
          : current.memoryPalace.filter((_, mIndex) => mIndex !== index),
    }));
  };

  const handleAddClick = () => {
    setEditingId(null);
    setError(null);
    setFormData(emptyForm());
    setShowForm(true);
  };

  const handleEditClick = (cycle: CycleData) => {
    setEditingId(cycle.id);
    setError(null);
    setFormData(normalizeFormData(cycle));
    setShowForm(true);
  };

  const validateForm = () => {
    if (
      !formData.title.trim() ||
      !formData.slug.trim() ||
      !formData.description.trim() ||
      !formData.categoryId ||
      !formData.classLevelId
    ) {
      return "Please complete the required cycle fields";
    }

    const hasValidStep = formData.steps.some(
      (step) =>
        step.title?.trim() && step.description?.trim() && step.detail?.trim(),
    );
    if (!hasValidStep) {
      return "Add at least one complete step with title, description, and detail";
    }

    return null;
  };

  const buildPayload = (): Partial<CycleData> => ({
    title: formData.title.trim(),
    slug: slugify(formData.slug),
    description: formData.description.trim(),
    categoryId: formData.categoryId,
    classLevelId: formData.classLevelId,
    videoUrl: formData.videoUrl.trim(),
    coverImage: formData.coverImage.trim(),
    icon: formData.icon.trim() || "atom",
    color: formData.color.trim() || "#059669",
    tags: formData.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    steps: formData.steps
      .map((step) => ({
        title: step.title.trim(),
        description: step.description.trim(),
        detail: step.detail.trim(),
        memoryTrick: step.memoryTrick?.trim() || "",
      }))
      .filter((step) => step.title && step.description && step.detail),
    flashcards: formData.flashcards
      .map((card) => ({
        frontTitle: card.frontTitle.trim(),
        frontDescription: card.frontDescription.trim(),
        backDetail: card.backDetail.trim(),
        memoryTrick: card.memoryTrick?.trim() || "",
      }))
      .filter(
        (card) => card.frontTitle && card.frontDescription && card.backDetail,
      ),
    quizQuestions: formData.quizQuestions
      .map((q) => ({
        question: q.question.trim(),
        options: q.options.map((o) => o.trim()).filter(Boolean),
        answer: q.answer.trim(),
      }))
      .filter((q) => q.question && q.options.length >= 2 && q.answer),
    memoryPalace: formData.memoryPalace
      .map((m) => ({
        title: m.title.trim(),
        memoryTrick: m.memoryTrick?.trim() || "",
      }))
      .filter((m) => m.title),
    quickFacts: formData.quickFacts
      .map((fact) => ({
        label: fact.label.trim(),
        value: fact.value.trim(),
      }))
      .filter((fact) => fact.label && fact.value),
  });

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = buildPayload();

      if (editingId) {
        await cycleService.updateCycle(editingId, payload);
      } else {
        await cycleService.createCycle(payload as CycleData);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm());
      await loadData();
    } catch (err: any) {
      console.error("Failed to save cycle:", err);
      setError(err.response?.data?.message || "Failed to save cycle");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cycle?")) return;

    try {
      await cycleService.deleteCycle(id);
      setCycles((current) => current.filter((cycle) => cycle.id !== id));
    } catch (err: any) {
      console.error("Failed to delete cycle:", err);
      setError(err.response?.data?.message || "Failed to delete cycle");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await cycleService.publishCycle(id);
      await loadData();
    } catch (err: any) {
      console.error("Failed to publish cycle:", err);
      setError(err.response?.data?.message || "Failed to publish cycle");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Content Management
          </h1>
          <p className="text-muted-foreground">
            Manage every part of the cycle detail experience from one editor.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-accent text-primary-foreground font-semibold hover:opacity-90"
        >
          <Plus className="w-5 h-5" />
          New Cycle
        </button>
      </motion.div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 mb-6 flex justify-between items-center gap-4">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 mb-8"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">
                {editingId ? "Edit Cycle" : "Create New Cycle"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Steps, quiz, flashcards, memory palace, and notes all use this
                data.
              </p>
            </div>
            {formData.slug && (
              <a
                href={`/cycle/${slugify(formData.slug)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent/10"
              >
                <ExternalLink className="w-4 h-4" />
                Preview Page
              </a>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <section className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title *"
                  value={formData.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  className="px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Slug *"
                  value={formData.slug}
                  onChange={(event) =>
                    updateForm("slug", slugify(event.target.value))
                  }
                  className="px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                  required
                />
              </div>

              <textarea
                placeholder="Description *"
                value={formData.description}
                onChange={(event) =>
                  updateForm("description", event.target.value)
                }
                className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                rows={3}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={formData.categoryId}
                  onChange={(event) =>
                    updateForm("categoryId", event.target.value)
                  }
                  className="px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                  required
                >
                  <option value="">Select Category *</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={formData.classLevelId}
                  onChange={(event) =>
                    updateForm("classLevelId", event.target.value)
                  }
                  className="px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                  required
                >
                  <option value="">Select Class Level *</option>
                  {classLevels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="url"
                  placeholder="Video URL"
                  value={formData.videoUrl}
                  onChange={(event) =>
                    updateForm("videoUrl", event.target.value)
                  }
                  className="px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                />
                <input
                  type="text"
                  placeholder="Cover image URL"
                  value={formData.coverImage}
                  onChange={(event) =>
                    updateForm("coverImage", event.target.value)
                  }
                  className="px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px] gap-4">
                <input
                  type="text"
                  placeholder="Icon name: atom, flame, leaf, droplets, wind, zap, brain, sparkles"
                  value={formData.icon}
                  onChange={(event) => updateForm("icon", event.target.value)}
                  className="px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                />
                <input
                  type="text"
                  placeholder="Tags separated by commas"
                  value={formData.tagsText}
                  onChange={(event) =>
                    updateForm("tagsText", event.target.value)
                  }
                  className="px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                />
                <input
                  type="color"
                  value={formData.color}
                  onChange={(event) => updateForm("color", event.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-card px-2"
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display text-lg font-semibold text-foreground">
                    Learning Steps
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    These power the journey tab, flashcards, quiz, and memory
                    palace.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      steps: [...current.steps, emptyStep()],
                    }))
                  }
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent/10"
                >
                  <Plus className="w-4 h-4" />
                  Add Step
                </button>
              </div>

              <div className="space-y-4">
                {formData.steps.map((step, index) => (
                  <div
                    key={`${index}-${step.title}`}
                    className="rounded-2xl border border-border bg-card/60 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        Step {index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Step title *"
                        value={step.title}
                        onChange={(event) =>
                          updateStep(index, "title", event.target.value)
                        }
                        className="px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Memory trick"
                        value={step.memoryTrick || ""}
                        onChange={(event) =>
                          updateStep(index, "memoryTrick", event.target.value)
                        }
                        className="px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                      />
                    </div>

                    <textarea
                      placeholder="Short description for cards and quiz *"
                      value={step.description}
                      onChange={(event) =>
                        updateStep(index, "description", event.target.value)
                      }
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                    />

                    <textarea
                      placeholder="Detailed explanation for the journey panel and flashcard back *"
                      value={step.detail}
                      onChange={(event) =>
                        updateStep(index, "detail", event.target.value)
                      }
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 border-t-2 border-border pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display text-lg font-semibold text-foreground">
                    📇 Flashcards
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Front and back cards for spaced repetition learning. Memory
                    tricks optional.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      flashcards: [...current.flashcards, emptyFlashcard()],
                    }))
                  }
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent/10"
                >
                  <Plus className="w-4 h-4" />
                  Add Flashcard
                </button>
              </div>

              <div className="space-y-4">
                {formData.flashcards.map((card, index) => (
                  <div
                    key={`${index}-${card.frontTitle}`}
                    className="rounded-2xl border border-border bg-card/60 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        Card {index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFlashcard(index)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Front side title *"
                      value={card.frontTitle}
                      onChange={(event) =>
                        updateFlashcard(index, "frontTitle", event.target.value)
                      }
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                    />

                    <textarea
                      placeholder="Front side description *"
                      value={card.frontDescription}
                      onChange={(event) =>
                        updateFlashcard(
                          index,
                          "frontDescription",
                          event.target.value,
                        )
                      }
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                    />

                    <textarea
                      placeholder="Back side detail explanation *"
                      value={card.backDetail}
                      onChange={(event) =>
                        updateFlashcard(index, "backDetail", event.target.value)
                      }
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                    />

                    <textarea
                      placeholder="Memory trick (optional)"
                      value={card.memoryTrick || ""}
                      onChange={(event) =>
                        updateFlashcard(
                          index,
                          "memoryTrick",
                          event.target.value,
                        )
                      }
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-amber-200 bg-amber-50 text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 border-t-2 border-border pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display text-lg font-semibold text-foreground">
                    ❓ Quiz Questions (MCQ)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Multiple choice questions for knowledge assessment. Answer
                    must match one option exactly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      quizQuestions: [
                        ...current.quizQuestions,
                        emptyQuizQuestion(),
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent/10"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              </div>

              <div className="space-y-4">
                {formData.quizQuestions.map((q, index) => (
                  <div
                    key={`${index}-${q.question}`}
                    className="rounded-2xl border border-border bg-card/60 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        Q{index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuizQuestion(index)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      placeholder="Question text *"
                      value={q.question}
                      onChange={(event) =>
                        updateQuizQuestion(
                          index,
                          "question",
                          event.target.value,
                        )
                      }
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                    />

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Options (4 options recommended)
                      </label>
                      {q.options.map((option, optIdx) => (
                        <input
                          key={optIdx}
                          type="text"
                          placeholder={`Option ${optIdx + 1} *`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...q.options];
                            newOptions[optIdx] = e.target.value;
                            updateQuizQuestion(index, "options", newOptions);
                          }}
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                        />
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Correct answer *"
                      value={q.answer}
                      onChange={(event) =>
                        updateQuizQuestion(index, "answer", event.target.value)
                      }
                      className="w-full px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none font-semibold"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 border-t-2 border-border pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display text-lg font-semibold text-foreground">
                    🏛️ Memory Palace
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Mnemonic device entries using the method of loci. Each
                    becomes a location.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      memoryPalace: [
                        ...current.memoryPalace,
                        emptyMemoryPalaceEntry(),
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent/10"
                >
                  <Plus className="w-4 h-4" />
                  Add Location
                </button>
              </div>

              <div className="space-y-3">
                {formData.memoryPalace.map((entry, index) => (
                  <div
                    key={`${index}-${entry.title}`}
                    className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-start rounded-xl border border-border bg-card/60 p-3"
                  >
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Location/Step title *"
                        value={entry.title}
                        onChange={(event) =>
                          updateMemoryEntry(index, "title", event.target.value)
                        }
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                      />
                      <textarea
                        placeholder="Memory technique/association for this location"
                        value={entry.memoryTrick || ""}
                        onChange={(event) =>
                          updateMemoryEntry(
                            index,
                            "memoryTrick",
                            event.target.value,
                          )
                        }
                        rows={2}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMemoryEntry(index)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 justify-self-start md:justify-self-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 border-t-2 border-border pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display text-lg font-semibold text-foreground">
                    Quick Facts
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    These show up in the hero summary on the cycle detail page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      quickFacts: [...current.quickFacts, emptyFact()],
                    }))
                  }
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent/10"
                >
                  <Plus className="w-4 h-4" />
                  Add Fact
                </button>
              </div>

              <div className="space-y-3">
                {formData.quickFacts.map((fact, index) => (
                  <div
                    key={`${index}-${fact.label}`}
                    className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-center rounded-xl border border-border bg-card/60 p-3"
                  >
                    <input
                      type="text"
                      placeholder="Label"
                      value={fact.label}
                      onChange={(event) =>
                        updateFact(index, "label", event.target.value)
                      }
                      className="px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={fact.value}
                      onChange={(event) =>
                        updateFact(index, "value", event.target.value)
                      }
                      className="px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeFact(index)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 justify-self-start md:justify-self-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-background/70 p-4">
              <h4 className="font-display text-lg font-semibold text-foreground mb-3">
                Detail Page Preview Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-card p-3 border border-border">
                  <div className="text-muted-foreground mb-1">Category</div>
                  <div className="font-medium text-foreground">
                    {selectedCategory?.name || "Not selected"}
                  </div>
                </div>
                <div className="rounded-xl bg-card p-3 border border-border">
                  <div className="text-muted-foreground mb-1">Class level</div>
                  <div className="font-medium text-foreground">
                    {selectedClassLevel?.displayName || "Not selected"}
                  </div>
                </div>
                <div className="rounded-xl bg-card p-3 border border-border">
                  <div className="text-muted-foreground mb-1">
                    Interactive assets
                  </div>
                  <div className="font-medium text-foreground text-xs space-y-1">
                    <div>
                      📘{" "}
                      {
                        formData.steps.filter(
                          (step) => step.title && step.detail,
                        ).length
                      }{" "}
                      steps
                    </div>
                    <div>
                      📇{" "}
                      {
                        formData.flashcards.filter(
                          (c) => c.frontTitle && c.backDetail,
                        ).length
                      }{" "}
                      cards
                    </div>
                    <div>
                      ❓{" "}
                      {
                        formData.quizQuestions.filter(
                          (q) => q.question && q.answer,
                        ).length
                      }{" "}
                      Q
                    </div>
                    <div>
                      🏛️ {formData.memoryPalace.filter((m) => m.title).length}{" "}
                      places
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg gradient-accent text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Cycle"
                    : "Create Cycle"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData(emptyForm());
                }}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent/10"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="glass-panel p-12 text-center text-muted-foreground">
          Loading cycles...
        </div>
      ) : cycles.length === 0 ? (
        <div className="glass-panel p-12 text-center text-muted-foreground">
          No cycles found. Create your first cycle to get started.
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
          className="glass-panel overflow-x-auto"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold text-foreground">
                  Title
                </th>
                <th className="text-left p-4 font-semibold text-foreground">
                  Category
                </th>
                <th className="text-left p-4 font-semibold text-foreground">
                  Class Level
                </th>
                <th className="text-left p-4 font-semibold text-foreground">
                  Status
                </th>
                <th className="text-left p-4 font-semibold text-foreground">
                  Assets
                </th>
                <th className="text-left p-4 font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {cycles.map((cycle) => (
                <tr
                  key={cycle.id}
                  className="border-b border-border hover:bg-accent/5 transition-colors"
                >
                  <td className="p-4 font-medium text-foreground">
                    <div>{cycle.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      /{cycle.slug}
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {cycle.category || "Unknown"}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {cycle.classLevel?.displayName || "Unknown"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        statusStyles[cycle.status || "draft"] ||
                        statusStyles.draft
                      }`}
                    >
                      {cycle.status || "draft"}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    <div className="text-xs space-y-1">
                      <div>📘 {cycle.steps.length} steps</div>
                      <div>📇 {cycle.flashcards?.length || 0} cards</div>
                      <div>❓ {cycle.quizQuestions?.length || 0} Q</div>
                      <div>🏛️ {cycle.memoryPalace?.length || 0} places</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/cycle/${cycle.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                        title="Preview"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-500" />
                      </a>
                      <button
                        onClick={() => handleEditClick(cycle)}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-blue-500" />
                      </button>
                      {cycle.status !== "published" && (
                        <button
                          onClick={() => handlePublish(cycle.id)}
                          className="p-2 hover:bg-accent rounded-lg transition-colors"
                          title="Publish"
                        >
                          <Eye className="w-4 h-4 text-emerald-500" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(cycle.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default AdminContent;
