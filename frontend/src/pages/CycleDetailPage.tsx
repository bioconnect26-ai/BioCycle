import { useParams, Link } from "react-router-dom";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Play,
  Download,
  CheckCircle,
  Brain,
  Lightbulb,
  Zap,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  Eye,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import FloatingParticles from "@/components/FloatingParticles";
import { cycleService, CycleData } from "@/services/cycleService";
import { authService } from "@/services/authService";

/* ─────────────────────────────────────────────────────────
   Design tokens — all colour decisions live here so every
   sub-component stays consistent with the light-mode theme.
───────────────────────────────────────────────────────── */
const T = {
  emerald: "#059669",
  emeraldLight: "#d1fae5",
  emeraldMid: "#6ee7b7",
  cyan: "#0891b2",
  cyanLight: "#cffafe",
  gold: "#d97706",
  goldLight: "#fef3c7",
  surface: "#ffffff",
  surfaceAlt: "#f0fdf8",
  border: "#d1fae5",
  borderStrong: "#6ee7b7",
  text: "#0f172a",
  textMid: "#334155",
  textSoft: "#64748b",
  textXSoft: "#94a3b8",
  gradHero: "linear-gradient(135deg, #059669 0%, #0891b2 100%)",
  gradCard: "linear-gradient(135deg, #ecfdf5 0%, #ecfeff 100%)",
  shadow: "0 4px 24px rgba(5,150,105,0.10)",
  shadowMd: "0 8px 40px rgba(5,150,105,0.13)",
  shadowLg: "0 16px 60px rgba(5,150,105,0.16)",
};

/* ══════════════════════════════════════════
   ORBITAL MAP
══════════════════════════════════════════ */
function OrbitalCycleMap({
  steps,
  activeStep,
  completedSteps,
  onSelect,
}: {
  steps: { title: string }[];
  activeStep: number | null;
  completedSteps: Set<number>;
  onSelect: (i: number) => void;
}) {
  const count = steps.length;
  const R = 148,
    size = 340,
    cx = size / 2,
    cy = size / 2;

  return (
    <div
      className="relative mx-auto select-none"
      style={{ width: size, height: size }}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke="rgba(5,150,105,0.18)"
          strokeWidth="1.5"
          strokeDasharray="6 5"
        />
        {steps.map((_, i) => {
          const next = (i + 1) % count;
          const a1 = (i / count) * Math.PI * 2 - Math.PI / 2;
          const a2 = (next / count) * Math.PI * 2 - Math.PI / 2;
          const x1 = cx + R * Math.cos(a1),
            y1 = cy + R * Math.sin(a1);
          const x2 = cx + R * Math.cos(a2),
            y2 = cy + R * Math.sin(a2);
          const lit = completedSteps.has(i) && completedSteps.has(next);
          return lit ? (
            <motion.path
              key={i}
              d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke="rgba(5,150,105,0.45)"
              strokeWidth="2"
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            />
          ) : null;
        })}
      </svg>

      {/* Nucleus */}
      <div
        className="absolute rounded-full flex items-center justify-center"
        style={{
          width: 64,
          height: 64,
          left: cx - 32,
          top: cy - 32,
          background: T.gradCard,
          border: `2px solid ${T.borderStrong}`,
          boxShadow: T.shadow,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-5 h-5" style={{ color: T.emerald }} />
        </motion.div>
      </div>

      {/* Nodes */}
      {steps.map((_, i) => {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const x = cx + R * Math.cos(angle),
          y = cy + R * Math.sin(angle);
        const isActive = activeStep === i,
          isDone = completedSteps.has(i);
        return (
          <motion.button
            key={i}
            onClick={() => onSelect(i)}
            className="absolute flex items-center justify-center rounded-full font-display font-bold text-xs z-10"
            style={{
              width: 36,
              height: 36,
              left: x - 18,
              top: y - 18,
              background: isActive
                ? T.gradHero
                : isDone
                  ? T.emeraldLight
                  : T.surface,
              border: `2px solid ${isActive ? T.emerald : isDone ? T.emeraldMid : T.border}`,
              boxShadow: isActive
                ? "0 0 16px rgba(5,150,105,0.35)"
                : isDone
                  ? T.shadow
                  : "0 1px 4px rgba(0,0,0,0.06)",
              color: isActive ? "white" : isDone ? T.emerald : T.textXSoft,
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
            animate={isActive ? { scale: [1, 1.09, 1] } : {}}
            transition={{ duration: 1.6, repeat: isActive ? Infinity : 0 }}
          >
            {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════
   FLASHCARD (3-D flip)
══════════════════════════════════════════ */
function Flashcard({
  step,
  index,
  total,
}: {
  step: {
    title: string;
    description: string;
    detail: string;
    memoryTrick?: string;
  };
  index: number;
  total: number;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className="relative mx-auto cursor-pointer"
      style={{ width: "100%", maxWidth: 520, height: 260, perspective: 900 }}
      onClick={() => setFlipped((f) => !f)}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: T.surface,
            border: `1.5px solid ${T.border}`,
            boxShadow: T.shadowMd,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-mono tracking-widest uppercase"
              style={{ color: T.textXSoft }}
            >
              Step {index + 1} of {total}
            </span>
            <span
              className="text-xs flex items-center gap-1"
              style={{ color: T.textXSoft }}
            >
              <Eye className="w-3 h-3" /> Tap to flip
            </span>
          </div>
          <div className="text-center px-2">
            <h3
              className="font-display text-xl font-bold mb-2"
              style={{ color: T.text }}
            >
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: T.textMid }}>
              {step.description}
            </p>
          </div>
          <div className="flex justify-center gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === index ? 20 : 6,
                  background: i === index ? T.emerald : T.border,
                }}
              />
            ))}
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: T.gradCard,
            border: `1.5px solid ${T.borderStrong}`,
            boxShadow: T.shadowMd,
          }}
        >
          <span
            className="text-xs font-mono tracking-widest uppercase"
            style={{ color: T.emerald }}
          >
            Deep Dive ✦
          </span>
          <p className="text-sm leading-relaxed" style={{ color: T.textMid }}>
            {step.detail}
          </p>
          {step.memoryTrick && (
            <div
              className="flex items-start gap-2 rounded-xl px-3 py-2"
              style={{ background: T.goldLight, border: "1px solid #fcd34d" }}
            >
              <Lightbulb
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: T.gold }}
              />
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#92400e" }}
              >
                {step.memoryTrick}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════
   QUIZ
══════════════════════════════════════════ */
function QuickQuiz({
  steps,
}: {
  steps: { title: string; description: string }[];
}) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const questions = useMemo(
    () =>
      steps.map((step, i) => {
        const wrong = steps
          .filter((_, j) => j !== i)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((s) => s.title);
        return {
          question: step.description,
          answer: step.title,
          options: [...wrong, step.title].sort(() => Math.random() - 0.5),
        };
      }),
    [steps],
  );

  useEffect(() => {
    setQIdx(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  }, [questions.length]);

  if (!questions.length) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: T.surfaceAlt, border: `1.5px solid ${T.border}` }}
      >
        <p
          className="font-display text-lg font-semibold"
          style={{ color: T.text }}
        >
          Quiz unlocks when steps are added
        </p>
        <p className="text-sm mt-2" style={{ color: T.textSoft }}>
          Add step descriptions in admin to generate practice questions here.
        </p>
      </div>
    );
  }

  const q = questions[qIdx];

  const choose = (opt: string, idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (opt === q.answer) setScore((s) => s + 1);
  };
  const next = () => {
    if (qIdx + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setQIdx((q) => q + 1);
    setSelected(null);
  };
  const reset = () => {
    setQIdx(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  };

  if (done)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-10"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.7 }}
          className="text-6xl mb-4"
        >
          {score >= questions.length * 0.8
            ? "🏆"
            : score >= questions.length * 0.5
              ? "🌟"
              : "💪"}
        </motion.div>
        <h3
          className="font-display text-2xl font-bold mb-2"
          style={{ color: T.text }}
        >
          {score}/{questions.length} correct!
        </h3>
        <p className="text-sm mb-6" style={{ color: T.textSoft }}>
          {score === questions.length
            ? "Perfect! You've mastered this cycle."
            : "Review the steps and try again!"}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: T.gradHero, boxShadow: T.shadow }}
        >
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
      </motion.div>
    );

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-mono uppercase tracking-widest"
          style={{ color: T.textXSoft }}
        >
          Question {qIdx + 1}/{questions.length}
        </span>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: T.emeraldLight, color: T.emerald }}
        >
          Score: {score}
        </span>
      </div>
      <div className="h-2 rounded-full mb-6" style={{ background: T.border }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: T.gradHero }}
          animate={{ width: `${(qIdx / questions.length) * 100}%` }}
        />
      </div>

      <div
        className="rounded-2xl p-5 mb-5"
        style={{ background: T.surfaceAlt, border: `1.5px solid ${T.border}` }}
      >
        <p
          className="text-xs font-mono uppercase tracking-wider mb-2"
          style={{ color: T.textXSoft }}
        >
          Which step is this?
        </p>
        <p
          className="text-base font-medium leading-relaxed"
          style={{ color: T.text }}
        >
          {""}
          {q.question}
        </p>
      </div>

      <div className="grid gap-3">
        {q.options.map((opt, i) => {
          const isCorrect = opt === q.answer,
            isSelected = selected === i,
            reveal = selected !== null;
          let bg = T.surface,
            border = T.border,
            color = T.textMid,
            labelBg = "#f1f5f9",
            labelColor = T.textXSoft;
          if (reveal) {
            if (isCorrect) {
              bg = "#f0fdf4";
              border = T.emerald;
              color = "#166534";
              labelBg = T.emeraldLight;
              labelColor = T.emerald;
            } else if (isSelected) {
              bg = "#fff1f2";
              border = "#f87171";
              color = "#991b1b";
              labelBg = "#fee2e2";
              labelColor = "#ef4444";
            }
          }
          return (
            <motion.button
              key={i}
              onClick={() => choose(opt, i)}
              whileHover={selected === null ? { x: 4, scale: 1.01 } : {}}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3"
              style={{ background: bg, border: `1.5px solid ${border}`, color }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: labelBg, color: labelColor }}
              >
                {reveal && isCorrect
                  ? "✓"
                  : reveal && isSelected
                    ? "✗"
                    : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex justify-end"
          >
            <button
              onClick={next}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: T.gradHero, boxShadow: T.shadow }}
            >
              {qIdx + 1 >= questions.length ? "See Results" : "Next"}{" "}
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════
   MEMORY PALACE
══════════════════════════════════ */
function MemoryPalace({
  steps,
}: {
  steps: { title: string; memoryTrick?: string }[];
}) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setRevealed((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  const acronym = steps.map((s) => s.title[0]).join("");

  if (!steps.length) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: T.surfaceAlt, border: `1.5px solid ${T.border}` }}
      >
        <p
          className="font-display text-lg font-semibold"
          style={{ color: T.text }}
        >
          Memory tools appear after steps are added
        </p>
        <p className="text-sm mt-2" style={{ color: T.textSoft }}>
          Add step titles and memory tricks in admin to build this section.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Acronym banner */}
      <div
        className="rounded-2xl p-5 mb-6 text-center"
        style={{
          background: T.gradCard,
          border: `1.5px solid ${T.borderStrong}`,
          boxShadow: T.shadow,
        }}
      >
        <p
          className="text-xs font-mono uppercase tracking-widest mb-3"
          style={{ color: T.textXSoft }}
        >
          Memory Acronym — first letter of each step
        </p>
        <div className="flex items-end justify-center gap-3 flex-wrap">
          {acronym.split("").map((letter, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col items-center gap-1"
            >
              <span
                className="text-2xl font-display font-black leading-none"
                style={{
                  color: `hsl(${160 + (i / acronym.length) * 60}, 65%, 38%)`,
                }}
              >
                {letter}
              </span>
              <span
                className="text-[9px] font-mono uppercase tracking-wide"
                style={{ color: T.textXSoft }}
              >
                {steps[i]?.title.slice(0, 5)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid gap-2.5">
        {steps.map((step, i) => (
          <motion.button
            key={i}
            onClick={() => toggle(i)}
            whileHover={{ x: 3 }}
            className="w-full text-left rounded-xl px-4 py-3.5 transition-all duration-200"
            style={{
              background: revealed.has(i) ? T.goldLight : T.surface,
              border: `1.5px solid ${revealed.has(i) ? "#fcd34d" : T.border}`,
              boxShadow: revealed.has(i)
                ? "0 4px 16px rgba(217,119,6,0.10)"
                : "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: T.emeraldLight, color: T.emerald }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: T.text }}
                >
                  {step.title}
                </span>
              </div>
              <Lightbulb
                className="w-4 h-4 flex-shrink-0 transition-colors"
                style={{ color: revealed.has(i) ? T.gold : T.textXSoft }}
              />
            </div>
            <AnimatePresence>
              {revealed.has(i) && (
                <motion.p
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="text-xs leading-relaxed pl-9"
                  style={{ color: "#92400e" }}
                >
                  {step.memoryTrick ||
                    `Remember "${step.title}" as the key action that advances the cycle — step ${i + 1} in the sequence.`}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TABS
══════════════════════════════════════════ */
const TABS = [
  { id: "journey", label: "Journey", icon: Zap },
  { id: "flashcards", label: "Flashcards", icon: Eye },
  { id: "quiz", label: "Quiz", icon: Brain },
  { id: "memory", label: "Memory", icon: Lightbulb },
] as const;
type TabId = (typeof TABS)[number]["id"];

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
const CycleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [cycle, setCycle] = useState<CycleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // current user (may be null)
  const currentUser = authService.getCurrentUser();

  const [activeTab, setActiveTab] = useState<TabId>("journey");
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const fetch = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const res = await cycleService.getCycleBySlug(slug);
        setCycle(res.data || res);
      } catch (err: any) {
        console.error("Failed to load cycle:", err);
        if (err?.response) {
          const status = err.response.status;
          const msg = err.response.data?.message || err.message;
          if (status === 403) {
            setError(
              "You do not have access to this cycle. " +
                "Login with the author/admin account or publish the cycle.",
            );
          } else if (status === 404) {
            setError("Cycle not found");
          } else {
            setError(msg || "Unable to load cycle");
          }
        } else {
          setError("Unable to load cycle");
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  useEffect(() => {
    if (!cycle) return;
    if (!cycle.steps.length) {
      setActiveStep(null);
      setFlashcardIdx(0);
      return;
    }
    setActiveStep((prev) =>
      prev !== null ? Math.min(prev, cycle.steps.length - 1) : prev,
    );
    setFlashcardIdx((prev) => Math.min(prev, cycle.steps.length - 1));
  }, [cycle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <PublicNavbar />
        <div>Loading cycle…</div>
      </div>
    );
  }

  if (error || !cycle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <PublicNavbar />
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">
            Cycle Not Found
          </h1>
          <p className="text-sm text-red-500 mb-2">{error || ""}</p>
          <Link
            to="/explore"
            style={{ color: T.emerald }}
            className="hover:underline"
          >
            ← Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const Icon = cycle.icon || Zap;
  const isOwnerOrAdmin =
    currentUser &&
    cycle?.creator &&
    (currentUser.id === cycle.creator.id ||
      ["admin", "super_admin"].includes(currentUser.role));
  const hasSteps = cycle.steps.length > 0;
  const cycleCategory = cycle.category || "";
  const cycleLevel = cycle.classLevel?.displayName || cycle.classLevel?.name;
  const selectStep = (i: number) => {
    setActiveStep(i === activeStep ? null : i);
    setCompletedSteps((prev) => {
      const n = new Set(prev);
      n.add(i);
      return n;
    });
  };
  const totalProgress = Math.round(
    (completedSteps.size / Math.max(cycle.steps.length, 1)) * 100,
  );

  const handleDownloadNotes = () => {
    const lines = [
      cycle.title,
      "",
      cycle.description,
      "",
      cycleCategory ? `Category: ${cycleCategory}` : null,
      cycleLevel ? `Class Level: ${cycleLevel}` : null,
      cycle.videoUrl ? `Video: ${cycle.videoUrl}` : null,
      cycle.tags?.length ? `Tags: ${cycle.tags.join(", ")}` : null,
      "",
      "Quick Facts",
      ...(cycle.quickFacts.length
        ? cycle.quickFacts.map((fact) => `- ${fact.label}: ${fact.value}`)
        : ["- No quick facts added yet."]),
      "",
      "Steps",
      ...(cycle.steps.length
        ? cycle.steps.flatMap((step, index) => [
            `${index + 1}. ${step.title}`,
            `   Summary: ${step.description}`,
            `   Detail: ${step.detail}`,
            step.memoryTrick ? `   Memory Trick: ${step.memoryTrick}` : null,
          ])
        : ["- No steps added yet."]),
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${cycle.slug || "cycle"}-study-notes.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background, #f8fafc)" }}
    >
      <PublicNavbar />

      {/* draft / pending reminder */}
      {cycle && cycle.status !== "published" && isOwnerOrAdmin && (
        <div className="px-4 py-2 text-sm text-center bg-yellow-100 text-yellow-800">
          This cycle is currently <strong>{cycle.status}</strong>. Only the
          author and admins can view it until it is published.
        </div>
      )}

      {/* Scroll bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[999] origin-left"
        style={{
          scaleX: scrollYProgress,
          background: `linear-gradient(90deg, ${T.emerald}, ${T.cyan})`,
        }}
      />

      {/* ════ DARK HERO ════ */}
      <section className="relative pt-16 min-h-[68vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_50%,rgba(52,211,153,0.08)_0%,transparent 70%)]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(52,211,153,1) 1px,transparent 1px),linear-gradient(90deg,rgba(52,211,153,1) 1px,transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <motion.div
          className="absolute rounded-full blur-[120px] pointer-events-none"
          style={{
            width: 500,
            height: 500,
            background: "rgba(52,211,153,0.09)",
            top: "-15%",
            right: "0%",
          }}
          animate={{ x: [0, 24, 0], y: [0, -18, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <FloatingParticles count={12} />

        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none leading-none overflow-hidden">
          <svg
            viewBox="0 0 1440 90"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full block"
            preserveAspectRatio="none"
          >
            <motion.path
              fill="var(--background, #f0fdf8)"
              animate={{
                d: [
                  "M0,40 C360,75 720,5 1080,45 C1260,62 1380,35 1440,40 L1440,90 L0,90 Z",
                  "M0,55 C360,20 720,70 1080,30 C1260,12 1380,58 1440,55 L1440,90 L0,90 Z",
                  "M0,40 C360,75 720,5 1080,45 C1260,62 1380,35 1440,40 L1440,90 L0,90 Z",
                ],
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Explore
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-center gap-10">
              {/* Left: text */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: T.gradHero,
                      boxShadow: "0 0 30px rgba(5,150,105,0.4)",
                    }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm"
                      style={{
                        background: "rgba(52,211,153,0.15)",
                        border: "1px solid rgba(52,211,153,0.3)",
                        color: "#a7f3d0",
                      }}
                    >
                      {cycleLevel || ""}
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm"
                      style={{
                        background: "rgba(6,182,212,0.15)",
                        border: "1px solid rgba(6,182,212,0.3)",
                        color: "#a5f3fc",
                      }}
                    >
                      {cycleCategory || ""}
                    </span>
                  </div>
                </div>
                <h1
                  className="font-display text-4xl md:text-6xl font-bold mb-4 leading-tight"
                  style={{
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #a7f3d0 55%, #a5f3fc 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {cycle.title}
                </h1>
                <p
                  className="text-base leading-relaxed mb-6 max-w-xl"
                  style={{ color: "rgba(255,255,255,0.62)" }}
                >
                  {cycle.description}
                </p>

                {/* Progress */}
                <div className="max-w-sm">
                  <div
                    className="flex justify-between text-xs mb-1.5"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    <span>Your Progress</span>
                    <span>
                      {completedSteps.size}/{cycle.steps.length} steps explored
                    </span>
                  </div>
                  <div
                    className="h-2Rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.12)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: "linear-gradient(90deg,#34d399,#06b6d4)",
                      }}
                      animate={{ width: `${totalProgress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Quick facts */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 max-w-2xl">
                  {cycle.quickFacts.length ? (
                    cycle.quickFacts.map((fact: any) => (
                      <div
                        key={fact.label}
                        className="rounded-xl p-3 text-center backdrop-blur-sm"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <div
                          className="text-xs mb-1"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                          {fact.label}
                        </div>
                        <div className="text-sm font-display font-semibold text-white">
                          {fact.value}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className="col-span-full rounded-xl p-4 text-sm"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px dashed rgba(255,255,255,0.2)",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      Quick facts will appear here after they are added from
                      admin.
                    </div>
                  )}
                </div>
              </div>

              {/* Orbital map - hidden on mobile */}
              <div className="hidden lg:flex flex-shrink-0 flex-col items-center gap-3">
                <OrbitalCycleMap
                  steps={hasSteps ? cycle.steps : [{ title: "Start" }]}
                  activeStep={hasSteps ? activeStep : null}
                  completedSteps={completedSteps}
                  onSelect={(i) => {
                    if (!hasSteps) return;
                    selectStep(i);
                    setActiveTab("journey");
                  }}
                />
                <p
                  className="text-xs text-center"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {hasSteps
                    ? "Click any node to explore that step"
                    : "Add steps from admin to unlock the journey"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════ LIGHT BODY ════ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Tab bar */}
          <div className="flex justify-center mb-10">
            <div
              className="inline-flex rounded-2xl p-1.5 gap-1"
              style={{
                background: T.surface,
                border: `1.5px solid ${T.border}`,
                boxShadow: T.shadow,
              }}
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{ color: isActive ? "white" : T.textSoft }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="tab-pill"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: T.gradHero, boxShadow: T.shadow }}
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.4,
                        }}
                      />
                    )}
                    <span className="relative flex items-center gap-2">
                      <tab.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {/* ── JOURNEY ── */}
              {activeTab === "journey" && (
                <div className="grid lg:grid-cols-5 gap-6">
                  {/* Steps list */}
                  <div className="lg:col-span-2 space-y-2">
                    {cycle.steps.map((step: any, i: number) => {
                      const isActive = activeStep === i,
                        isDone = completedSteps.has(i);
                      return (
                        <motion.button
                          key={i}
                          onClick={() => selectStep(i)}
                          whileHover={{ x: 3 }}
                          className="w-full text-left rounded-xl px-4 py-3.5 transition-all duration-200"
                          style={{
                            background: isActive ? T.gradCard : T.surface,
                            border: `1.5px solid ${isActive ? T.emerald : T.border}`,
                            boxShadow: isActive
                              ? `0 4px 20px rgba(5,150,105,0.12)`
                              : "0 1px 3px rgba(0,0,0,0.04)",
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                              style={{
                                background: isActive
                                  ? T.gradHero
                                  : isDone
                                    ? T.emeraldLight
                                    : "#f1f5f9",
                                color: isActive
                                  ? "white"
                                  : isDone
                                    ? T.emerald
                                    : T.textXSoft,
                              }}
                            >
                              {isDone && !isActive ? (
                                <CheckCircle className="w-3.5 h-3.5" />
                              ) : (
                                i + 1
                              )}
                            </div>
                            <div>
                              <p
                                className="text-sm font-semibold"
                                style={{ color: isActive ? T.emerald : T.text }}
                              >
                                {step.title}
                              </p>
                              <p
                                className="text-xs mt-0.5 leading-relaxed"
                                style={{ color: T.textSoft }}
                              >
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Detail panel */}
                  <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                      {activeStep !== null ? (
                        <motion.div
                          key={activeStep}
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -12 }}
                          transition={{ duration: 0.3 }}
                          className="rounded-3xl p-7 min-h-[380px] flex flex-col justify-between"
                          style={{
                            background: T.surface,
                            border: `1.5px solid ${T.border}`,
                            boxShadow: T.shadowLg,
                          }}
                        >
                          <div>
                            {/* Dots */}
                            <div className="flex items-center gap-2 mb-5">
                              <span
                                className="text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full font-semibold"
                                style={{
                                  background: T.emeraldLight,
                                  color: T.emerald,
                                }}
                              >
                                Step {activeStep + 1} of {cycle.steps.length}
                              </span>
                              <div className="flex gap-1">
                                {cycle.steps.map((_: any, i: number) => (
                                  <div
                                    key={i}
                                    className="h-1.5 rounded-full transition-all duration-300"
                                    style={{
                                      width: i === activeStep ? 18 : 5,
                                      background:
                                        i === activeStep
                                          ? T.emerald
                                          : completedSteps.has(i)
                                            ? T.emeraldMid
                                            : T.border,
                                    }}
                                  />
                                ))}
                              </div>
                            </div>

                            <h2
                              className="font-display text-2xl font-bold mb-3"
                              style={{ color: T.text }}
                            >
                              {cycle.steps[activeStep].title}
                            </h2>
                            <p
                              className="text-base leading-relaxed mb-5"
                              style={{ color: T.textMid }}
                            >
                              {cycle.steps[activeStep].detail}
                            </p>

                            {cycle.steps[activeStep].memoryTrick && (
                              <div
                                className="rounded-xl px-4 py-3 flex items-start gap-3"
                                style={{
                                  background: T.goldLight,
                                  border: "1px solid #fcd34d",
                                }}
                              >
                                <Lightbulb
                                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                                  style={{ color: T.gold }}
                                />
                                <div>
                                  <p
                                    className="text-xs font-bold mb-1"
                                    style={{ color: T.gold }}
                                  >
                                    Memory Trick
                                  </p>
                                  <p
                                    className="text-xs leading-relaxed"
                                    style={{ color: "#92400e" }}
                                  >
                                    {cycle.steps[activeStep].memoryTrick}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div
                            className="flex items-center justify-between mt-6 pt-4"
                            style={{ borderTop: `1px solid ${T.border}` }}
                          >
                            <button
                              onClick={() =>
                                selectStep(Math.max(0, activeStep - 1))
                              }
                              disabled={activeStep === 0}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30 hover:scale-[1.03]"
                              style={{
                                background: "#f1f5f9",
                                color: T.textMid,
                              }}
                            >
                              <ChevronLeft className="w-4 h-4" /> Prev
                            </button>
                            <span
                              className="text-xs font-mono"
                              style={{ color: T.textXSoft }}
                            >
                              {activeStep + 1} / {cycle.steps.length}
                            </span>
                            <button
                              onClick={() =>
                                selectStep(
                                  Math.min(
                                    cycle.steps.length - 1,
                                    activeStep + 1,
                                  ),
                                )
                              }
                              disabled={activeStep === cycle.steps.length - 1}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-30 hover:scale-[1.03]"
                              style={{
                                background: T.gradHero,
                                boxShadow: T.shadow,
                              }}
                            >
                              Next <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="rounded-3xl p-10 flex flex-col items-center justify-center min-h-[380px] text-center"
                          style={{
                            background: T.surfaceAlt,
                            border: `1.5px dashed ${T.border}`,
                          }}
                        >
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              opacity: [0.35, 0.7, 0.35],
                            }}
                            transition={{ duration: 2.5, repeat: Infinity }}
                          >
                            <Zap
                              className="w-10 h-10 mb-4 mx-auto"
                              style={{ color: T.emeraldMid }}
                            />
                          </motion.div>
                          <p
                            className="font-display text-lg font-semibold"
                            style={{ color: T.textSoft }}
                          >
                            Select a step to begin
                          </p>
                          <p
                            className="text-sm mt-1"
                            style={{ color: T.textXSoft }}
                          >
                            Click any step on the left or tap a node on the
                            orbital map above
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* ── FLASHCARDS ── */}
              {activeTab === "flashcards" && (
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <h2
                      className="font-display text-2xl font-bold mb-1"
                      style={{ color: T.text }}
                    >
                      Flip to Remember
                    </h2>
                    <p className="text-sm" style={{ color: T.textSoft }}>
                      Active recall — tap the card to reveal the deep
                      explanation
                    </p>
                  </div>
                  {hasSteps ? (
                    <Flashcard
                      key={flashcardIdx}
                      step={cycle.steps[flashcardIdx]}
                      index={flashcardIdx}
                      total={cycle.steps.length}
                    />
                  ) : (
                    <div
                      className="rounded-2xl p-8 text-center"
                      style={{
                        background: T.surfaceAlt,
                        border: `1.5px solid ${T.border}`,
                      }}
                    >
                      <p
                        className="font-display text-lg font-semibold"
                        style={{ color: T.text }}
                      >
                        Flashcards will appear here
                      </p>
                      <p className="text-sm mt-2" style={{ color: T.textSoft }}>
                        Add steps in admin to generate flip cards automatically.
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                      onClick={() => setFlashcardIdx((i) => Math.max(0, i - 1))}
                      disabled={!hasSteps || flashcardIdx === 0}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 hover:scale-110"
                      style={{
                        background: T.surface,
                        border: `1.5px solid ${T.border}`,
                        boxShadow: T.shadow,
                      }}
                    >
                      <ChevronLeft
                        className="w-5 h-5"
                        style={{ color: T.textMid }}
                      />
                    </button>
                    <span
                      className="text-sm font-mono"
                      style={{ color: T.textXSoft }}
                    >
                      {hasSteps
                        ? `${flashcardIdx + 1} / ${cycle.steps.length}`
                        : "0 / 0"}
                    </span>
                    <button
                      onClick={() =>
                        setFlashcardIdx((i) =>
                          Math.min(cycle.steps.length - 1, i + 1),
                        )
                      }
                      disabled={
                        !hasSteps || flashcardIdx === cycle.steps.length - 1
                      }
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 hover:scale-110"
                      style={{
                        background: T.surface,
                        border: `1.5px solid ${T.border}`,
                        boxShadow: T.shadow,
                      }}
                    >
                      <ChevronRight
                        className="w-5 h-5"
                        style={{ color: T.textMid }}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* ── QUIZ ── */}
              {activeTab === "quiz" && (
                <div>
                  <div className="text-center mb-8">
                    <h2
                      className="font-display text-2xl font-bold mb-1"
                      style={{ color: T.text }}
                    >
                      Test Yourself
                    </h2>
                    <p className="text-sm" style={{ color: T.textSoft }}>
                      Match each description to the correct step
                    </p>
                  </div>
                  <QuickQuiz steps={cycle.steps} />
                </div>
              )}

              {/* ── MEMORY ── */}
              {activeTab === "memory" && (
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <h2
                      className="font-display text-2xl font-bold mb-1"
                      style={{ color: T.text }}
                    >
                      Memory Palace
                    </h2>
                    <p className="text-sm" style={{ color: T.textSoft }}>
                      Mnemonics and visual anchors to lock every step into
                      memory
                    </p>
                  </div>
                  <MemoryPalace steps={cycle.steps} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── VIDEO ── */}
      {cycle.videoUrl && (
        <section
          className="py-16"
          style={{
            background: T.surfaceAlt,
            borderTop: `1px solid ${T.border}`,
          }}
        >
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2
                className="font-display text-2xl font-bold mb-6 flex items-center gap-3"
                style={{ color: T.text }}
              >
                <Play className="w-5 h-5" style={{ color: T.emerald }} /> Watch
                & Learn
              </h2>
              <div
                className="max-w-4xl mx-auto rounded-3xl overflow-hidden"
                style={{
                  border: `1.5px solid ${T.border}`,
                  boxShadow: T.shadowMd,
                }}
              >
                <div className="aspect-video bg-slate-900">
                  <iframe
                    src={cycle.videoUrl}
                    title={cycle.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── DOWNLOAD ── */}
      <section
        className="py-16"
        style={{ background: "var(--background, #f8fafc)" }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto rounded-3xl p-8 text-center"
            style={{
              background: T.surface,
              border: `1.5px solid ${T.border}`,
              boxShadow: T.shadowLg,
            }}
          >
            <div
              className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{
                background: T.gradHero,
                boxShadow: "0 0 24px rgba(5,150,105,0.3)",
              }}
            >
              <Download className="w-6 h-6 text-white" />
            </div>
            <h3
              className="font-display text-xl font-bold mb-2"
              style={{ color: T.text }}
            >
              Download Study Notes
            </h3>
            <p className="text-sm mb-6" style={{ color: T.textSoft }}>
              Get a comprehensive PDF summary of {cycle.title} with diagrams and
              key points.
            </p>
            <button
              onClick={handleDownloadNotes}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.03]"
              style={{ background: T.gradHero, boxShadow: T.shadow }}
            >
              <Download className="w-4 h-4" /> Download Notes
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-12 text-center"
        style={{ borderTop: `1px solid ${T.border}` }}
      >
        <p className="text-sm" style={{ color: T.textXSoft }}>
          © 2026 BioCycles. Making biology interactive and engaging.
        </p>
      </footer>
    </div>
  );
};

export default CycleDetailPage;
