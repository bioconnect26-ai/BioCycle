import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Eye, FlaskConical } from "lucide-react";
import FloatingParticles from "@/components/FloatingParticles";
import PublicNavbar from "@/components/PublicNavbar";
import heroBg from "@/assets/hero-bg.jpg";
import { cyclesData } from "@/data/cycles"; // kept for fallback styling
import CycleCard from "@/components/CycleCard";
import { useEffect, useRef, useState } from "react";
import {
  cycleService,
  CycleData,
  ClassLevel as CycleClassLevel,
} from "@/services/cycleService";
import { categoryService } from "@/services/categoryService";
import { classLevelService } from "@/services/classLevelService";

/* ─── Typing animation hook ─── */
function useTypingEffect(words: string[], speed = 80, pause = 1800) {
  const [displayed, setDisplayed] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          setDisplayed(current.slice(0, charIdx + 1));
          if (charIdx + 1 === current.length) {
            setTimeout(() => setDeleting(true), pause);
          } else setCharIdx((c) => c + 1);
        } else {
          setDisplayed(current.slice(0, charIdx - 1));
          if (charIdx - 1 === 0) {
            setDeleting(false);
            setWordIdx((w) => (w + 1) % words.length);
            setCharIdx(0);
          } else setCharIdx((c) => c - 1);
        }
      },
      deleting ? speed / 2 : speed,
    );
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return displayed;
}

/* ─── DNA Helix Canvas ─── */
function DNAHelix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const NODES = 18;
    const pairs = [
      ["#34d399", "#06b6d4"], // emerald - cyan
      ["#06b6d4", "#34d399"],
    ];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const amplitude = Math.min(canvas.width * 0.18, 80);
      const spacing = canvas.height / (NODES - 1);

      // Draw backbone strands
      for (let strand = 0; strand < 2; strand++) {
        ctx.beginPath();
        for (let i = 0; i < NODES; i++) {
          const y = i * spacing;
          const phase = strand === 0 ? 0 : Math.PI;
          const x =
            cx + Math.sin((i / NODES) * Math.PI * 3 + t + phase) * amplitude;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, "rgba(52,211,153,0)");
        grad.addColorStop(
          0.2,
          strand === 0 ? "rgba(52,211,153,0.6)" : "rgba(6,182,212,0.6)",
        );
        grad.addColorStop(
          0.8,
          strand === 0 ? "rgba(52,211,153,0.6)" : "rgba(6,182,212,0.6)",
        );
        grad.addColorStop(1, "rgba(52,211,153,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw base pairs (rungs)
      for (let i = 0; i < NODES; i++) {
        const y = i * spacing;
        const x1 = cx + Math.sin((i / NODES) * Math.PI * 3 + t) * amplitude;
        const x2 =
          cx + Math.sin((i / NODES) * Math.PI * 3 + t + Math.PI) * amplitude;

        const alpha =
          0.3 + 0.5 * Math.abs(Math.sin((i / NODES) * Math.PI * 3 + t));

        // Rung line
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = `rgba(100,220,200,${alpha * 0.35})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node dots
        const [c1, c2] = pairs[i % 2];
        [
          { x: x1, c: c1 },
          { x: x2, c: c2 },
        ].forEach(({ x, c }) => {
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle =
            c +
            Math.round(alpha * 255)
              .toString(16)
              .padStart(2, "0");
          ctx.fill();

          // Glow
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          const glow = ctx.createRadialGradient(x, y, 0, x, y, 8);
          glow.addColorStop(0, c + "55");
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.fill();
        });
      }

      t += 0.018;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute right-[6%] top-1/2 -translate-y-1/2 w-[120px] md:w-[160px] h-[70vh] opacity-70 pointer-events-none"
    />
  );
}

/* ─── Floating Molecule Nodes ─── */
function MoleculeOrbs() {
  const orbs = [
    { size: 10, x: "12%", y: "22%", color: "#34d399", delay: 0, dur: 6 },
    { size: 6, x: "80%", y: "18%", color: "#06b6d4", delay: 1, dur: 8 },
    { size: 14, x: "8%", y: "65%", color: "#06b6d4", delay: 0.5, dur: 7 },
    { size: 8, x: "88%", y: "55%", color: "#34d399", delay: 2, dur: 9 },
    { size: 5, x: "25%", y: "80%", color: "#a7f3d0", delay: 1.5, dur: 5 },
    { size: 12, x: "70%", y: "75%", color: "#67e8f9", delay: 0.8, dur: 10 },
    { size: 7, x: "50%", y: "12%", color: "#34d399", delay: 2.5, dur: 7 },
    { size: 9, x: "35%", y: "88%", color: "#06b6d4", delay: 3, dur: 6 },
  ];

  return (
    <>
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: orb.color,
            boxShadow: `0 0 ${orb.size * 3}px ${orb.color}88`,
          }}
          animate={{
            y: [0, -18, 0, 12, 0],
            x: [0, 8, -5, 3, 0],
            opacity: [0.6, 1, 0.7, 1, 0.6],
            scale: [1, 1.3, 1, 1.1, 1],
          }}
          transition={{
            duration: orb.dur,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

// /* ─── Animated SVG Wave bottom ─── */
// function WaveTransition() {
//   return (
//     <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none overflow-hidden leading-none">
//       <svg
//         viewBox="0 0 1440 120"
//         xmlns="http://www.w3.org/2000/svg"
//         className="w-full"
//         preserveAspectRatio="none"
//         style={{ display: "block" }}
//       >
//         {/* Back wave — slower */}
//         <motion.path
//           d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z"
//           fill="hsl(var(--background))"
//           fillOpacity="0.4"
//           animate={{ x: [0, -18, 0, 12, 0], y: [0, -4, 0, 3, 0] }}
//           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//         />
//         {/* Mid wave */}
//         <motion.path
//           d="M0,80 C360,40 720,100 1080,60 C1260,40 1380,70 1440,80 L1440,120 L0,120 Z"
//           fill="hsl(var(--background))"
//           fillOpacity="0.6"
//           animate={{ x: [0, 14, 0, -10, 0], y: [0, 3, 0, -3, 0] }}
//           transition={{
//             duration: 6,
//             repeat: Infinity,
//             ease: "easeInOut",
//             delay: 0.5,
//           }}
//         />
//         {/* Front wave — solid background fill */}
//         <motion.path
//           d="M0,90 C180,70 360,110 540,90 C720,70 900,110 1080,90 C1260,70 1380,95 1440,90 L1440,120 L0,120 Z"
//           fill="hsl(var(--background))"
//           animate={{ x: [0, -10, 0, 8, 0], y: [0, 2, 0, -2, 0] }}
//           transition={{
//             duration: 5,
//             repeat: Infinity,
//             ease: "easeInOut",
//             delay: 1,
//           }}
//         />
//       </svg>
//     </div>
//   );
// }

/* ─── Interactive cursor glow ─── */
function CursorGlow() {
  const [pos, setPos] = useState({ x: -300, y: -300 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    el.addEventListener("mousemove", handler);
    return () => el.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      ref={heroRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      <div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none transition-all duration-150"
        style={{
          left: pos.x - 200,
          top: pos.y - 200,
          background:
            "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

/* ─── Stats ─── */
const defaultStats = [
  { icon: BookOpen, value: `${cyclesData.length}+`, label: "Biology Cycles" },
  { icon: Users, value: "4", label: "Categories" },
  { icon: Eye, value: "3", label: "Learning Levels" },
  { icon: FlaskConical, value: "0", label: "Live Previews" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

const cycleWords = [
  "Krebs Cycle",
  "Cell Division",
  "Photosynthesis",
  "DNA Replication",
  "Mitosis",
  "Meiosis",
];

/* ════════════════════════════════════════════ */
const Index = () => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.92]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 80]);
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  const typedWord = useTypingEffect(cycleWords, 75, 1600);

  const [featured, setFeatured] = useState<CycleData[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [heroStats, setHeroStats] = useState(defaultStats);
  const [classLevels, setClassLevels] = useState<CycleClassLevel[]>([]);
  const [selectedClassLevel, setSelectedClassLevel] = useState("all");

  const featuredCyclesToShow = (
    selectedClassLevel === "all"
      ? featured
      : featured.filter((cycle) => cycle.classLevelId === selectedClassLevel)
  ).slice(0, 6);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingFeatured(true);
        const [cyclesRes, categoriesRes, classLevelsRes] = await Promise.all([
          cycleService.getAllCycles(1, 24),
          categoryService.getAllCategories(),
          classLevelService.getAllClassLevels(),
        ]);

        const featuredCycles = cyclesRes.data || cyclesRes;
        setFeatured(featuredCycles);

        const allCategories = Array.isArray(categoriesRes?.data)
          ? categoriesRes.data
          : Array.isArray(categoriesRes)
            ? categoriesRes
            : [];

        const allClassLevels = Array.isArray(classLevelsRes?.data)
          ? classLevelsRes.data
          : Array.isArray(classLevelsRes)
            ? classLevelsRes
            : [];

        setClassLevels(allClassLevels);

        const totalCycles =
          Number(cyclesRes?.pagination?.total) ||
          (Array.isArray(featuredCycles) ? featuredCycles.length : cyclesData.length);

        const mediaReadyCount = Array.isArray(featuredCycles)
          ? featuredCycles.filter(
              (cycle) => cycle.videoUrl || cycle.simulationUrl,
            ).length
          : 0;

        setHeroStats([
          {
            icon: BookOpen,
            value: `${totalCycles}+`,
            label: "Biology Cycles",
          },
          {
            icon: Users,
            value: String(allCategories.length),
            label: "Categories",
          },
          {
            icon: Eye,
            value: String(allClassLevels.length),
            label: "Learning Levels",
          },
          {
            icon: FlaskConical,
            value: String(mediaReadyCount),
            label: "Live Previews",
          },
        ]);
      } catch (err) {
        console.error("Error loading featured cycles", err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Scroll progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[999] origin-left"
        style={{
          scaleX: smoothProgress,
          background:
            "linear-gradient(90deg, hsl(var(--emerald)), hsl(var(--cyan)), hsl(var(--emerald)))",
        }}
      />

      {/* ══════════ HERO ══════════ */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* BG image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${heroBg})` }}
        />

        {/* Dark layered overlays — NO white at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030d0a]/90 via-[#041a11]/70 to-[#030d0a]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(6,20,14,0.3)_0%,transparent_100%)]" />

        {/* Teal atmospheric glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_35%,rgba(52,211,153,0.07)_0%,transparent_65%)]" />

        {/* Grid overlay — feels like a biology lab / microscope grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(52,211,153,1) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Noise grain texture */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Ambient color orbs */}
        <motion.div
          className="absolute rounded-full blur-[130px] pointer-events-none"
          style={{
            width: 600,
            height: 600,
            background: "rgba(52,211,153,0.12)",
            top: "-10%",
            left: "-5%",
          }}
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full blur-[100px] pointer-events-none"
          style={{
            width: 500,
            height: 500,
            background: "rgba(6,182,212,0.10)",
            bottom: "5%",
            right: "-5%",
          }}
          animate={{ x: [0, -30, 0], y: [0, 25, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full blur-[80px] pointer-events-none"
          style={{
            width: 300,
            height: 300,
            background: "rgba(16,185,129,0.08)",
            top: "40%",
            left: "30%",
          }}
          animate={{ x: [0, 20, -20, 0], y: [0, -15, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* DNA Helix */}
        <DNAHelix />

        {/* Molecule orbs */}
        <MoleculeOrbs />

        {/* Cursor glow */}
        <CursorGlow />

        {/* Floating particles */}
        <FloatingParticles count={30} />

        {/* ── Main Content ── */}
        <div className="relative z-10 container mx-auto px-4 text-center max-w-5xl pt-24 md:pt-28">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-8 backdrop-blur-md"
            style={{
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.25)",
              boxShadow:
                "0 0 30px rgba(52,211,153,0.12), inset 0 0 20px rgba(52,211,153,0.04)",
            }}
          >
            <motion.span
              animate={{ rotate: [0, 12, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <FlaskConical className="w-4 h-4 text-emerald-light" />
            </motion.span>
            <span className="text-sm font-medium text-emerald-light tracking-wide">
              Interactive Biology Platform
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-light animate-pulse" />
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.04] tracking-tight mb-4"
          >
            <span
              className="block text-white"
              style={{
                textShadow:
                  "0 2px 40px rgba(0,0,0,0.9), 0 0 80px rgba(0,0,0,0.6)",
              }}
            >
              Master Biology
            </span>
            <span
              className="block mt-1"
              style={{
                background:
                  "linear-gradient(135deg, #34d399 0%, #06b6d4 50%, #34d399 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmer 4s linear infinite",
                filter: "drop-shadow(0 0 30px rgba(52,211,153,0.4))",
              }}
            >
              Cycles & Processes
            </span>
          </motion.h1>

          {/* Typing subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div
              className="h-[1px] w-12"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(52,211,153,0.5))",
              }}
            />
            <span className="text-sm text-emerald-light/70 font-mono tracking-widest uppercase">
              Currently exploring
            </span>
            <div
              className="h-[1px] w-12"
              style={{
                background:
                  "linear-gradient(90deg, rgba(52,211,153,0.5), transparent)",
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="h-10 mb-8 flex items-center justify-center"
          >
            <span
              className="text-2xl md:text-3xl font-display font-semibold tracking-tight"
              style={{
                color: "rgba(103,232,249,0.9)",
                textShadow: "0 0 20px rgba(6,182,212,0.4)",
              }}
            >
              {typedWord}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="ml-[2px] inline-block w-[3px] h-7 rounded-full align-middle"
                style={{
                  background: "rgba(6,182,212,0.8)",
                  marginBottom: "2px",
                }}
              />
            </span>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{
              color: "rgba(255,255,255,0.6)",
              textShadow: "0 1px 8px rgba(0,0,0,0.6)",
            }}
          >
            Explore the most fascinating biological processes through{" "}
            <span style={{ color: "rgba(167,243,208,0.85)" }}>
              immersive animations
            </span>
            , interactive diagrams, and step-by-step breakdowns — built for
            students who learn by doing.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            {/* Primary */}
            <Link
              to="/explore"
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-[1.04]"
              style={{
                background: "linear-gradient(135deg, #059669, #0891b2)",
                color: "white",
                boxShadow:
                  "0 0 0 1px rgba(52,211,153,0.3), 0 4px 24px rgba(52,211,153,0.25), 0 1px 0 rgba(255,255,255,0.1) inset",
              }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "linear-gradient(135deg, #10b981, #06b6d4)",
                }}
              />
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
              <span className="relative flex items-center gap-3">
                Explore Cycles
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </span>
            </Link>

            {/* Secondary */}
            <a
              href="#categories"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.04)")
              }
            >
              Browse Categories
            </a>
          </motion.div>

          {/* Mini stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="flex items-center justify-center gap-6 md:gap-10 flex-wrap"
          >
            {heroStats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-2.5 group">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{
                    background: "rgba(52,211,153,0.1)",
                    border: "1px solid rgba(52,211,153,0.2)",
                  }}
                >
                  <stat.icon className="w-4 h-4 text-emerald-light" />
                </div>
                <div className="text-left">
                  <div className="text-base font-bold text-white leading-none">
                    {stat.value}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {stat.label}
                  </div>
                </div>
                {i < heroStats.length - 1 && (
                  <div
                    className="hidden md:block w-px h-6 ml-4"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  />
                )}
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Animated Wave Transition (replaces white fade) ── */}
        {/* <WaveTransition /> */}

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
        >
          <motion.div
            className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
            style={{ border: "1.5px solid rgba(255,255,255,0.2)" }}
          >
            <motion.div
              className="w-1 h-2 rounded-full"
              style={{ background: "rgba(52,211,153,0.8)" }}
              animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ══════════ FEATURED CYCLES ══════════ */}
      <section id="categories" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Explore <span className="gradient-text">Biology Cycles</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Dive into interactive explorations of the most important
              biological processes.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="flex flex-wrap items-center justify-center gap-3 mb-10"
          >
            <button
              onClick={() => setSelectedClassLevel("all")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedClassLevel === "all"
                  ? "bg-emerald text-white shadow-lg shadow-emerald/20"
                  : "border border-border bg-background/70 text-muted-foreground hover:border-emerald/40 hover:text-foreground"
              }`}
            >
              All Levels
            </button>
            {classLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedClassLevel(level.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedClassLevel === level.id
                    ? "bg-emerald text-white shadow-lg shadow-emerald/20"
                    : "border border-border bg-background/70 text-muted-foreground hover:border-emerald/40 hover:text-foreground"
                }`}
              >
                {level.displayName}
              </button>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingFeatured ? (
              <div className="col-span-full text-center text-muted-foreground">
                Loading featured cycles...
              </div>
            ) : (
              (featuredCyclesToShow.length
                ? featuredCyclesToShow
                : selectedClassLevel === "all"
                  ? cyclesData.slice(0, 6)
                  : []).map((cycle, i) => (
                <motion.div
                  key={cycle.id}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <CycleCard cycle={cycle} />
                </motion.div>
              ))
            )}
          </div>

          {!loadingFeatured &&
          selectedClassLevel !== "all" &&
          featuredCyclesToShow.length === 0 ? (
            <div className="mt-6 text-center text-muted-foreground">
              No featured cycles are available for this class level yet.
            </div>
          ) : null}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mt-12"
          >
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              View All Cycles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 ByoBridge. Making biology interactive and engaging.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
};

export default Index;

