import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  Sparkles,
  BookOpen,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import CycleCard from "@/components/CycleCard";
// static data used only for fallback styling; real data loaded from API
import { cyclesData, categories } from "@/data/cycles";
import { cycleService, CycleData } from "@/services/cycleService";
import { categoryService } from "@/services/categoryService";

/* ─── Design tokens (matches CycleDetailPage light theme) ─── */
const T = {
  emerald: "#059669",
  emeraldLight: "#d1fae5",
  emeraldMid: "#6ee7b7",
  cyan: "#0891b2",
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
};

/* ─── Class level badge colours ─── */
const classLevelColor: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  "9th": { bg: "#f0fdf4", text: "#166534", border: "#86efac" },
  "10th": { bg: "#fffbeb", text: "#92400e", border: "#fcd34d" },
  "11th": { bg: "#fff1f2", text: "#991b1b", border: "#fca5a5" },
  "12th": { bg: "#eff6ff", text: "#1e40af", border: "#93c5fd" },
};

/* ─── Animated counter ─── */
function CountBadge({ count }: { count: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={count}
        initial={{ opacity: 0, y: -6, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold"
        style={{ background: T.emeraldLight, color: T.emerald }}
      >
        {count}
      </motion.span>
    </AnimatePresence>
  );
}

/* ─── List-view row card ─── */
function CycleListRow({ cycle, index }: { cycle: any; index: number }) {
  const Icon = cycle.icon;
  const diff =
    classLevelColor[cycle.classLevel?.displayName] ?? classLevelColor["9th"];

  return (
    <motion.a
      href={`/cycle/${cycle.slug}`}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      whileHover={{ x: 4 }}
      className="flex items-center gap-5 rounded-2xl px-5 py-4 transition-all duration-200 group"
      style={{
        background: T.surface,
        border: `1.5px solid ${T.border}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = T.emeraldMid;
        (e.currentTarget as HTMLElement).style.boxShadow = T.shadow;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = T.border;
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 1px 4px rgba(0,0,0,0.04)";
      }}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: T.gradCard, border: `1.5px solid ${T.border}` }}
      >
        <Icon className="w-5 h-5" style={{ color: T.emerald }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: T.text }}
          >
            {cycle.title}
          </p>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: diff.bg,
              color: diff.text,
              border: `1px solid ${diff.border}`,
            }}
          >
            {cycle.classLevel?.displayName}
          </span>
        </div>
        <p className="text-xs mt-0.5 truncate" style={{ color: T.textSoft }}>
          {cycle.description}
        </p>
      </div>

      {/* Tags */}
      <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
        {(cycle.tags || []).slice(0, 2).map((tag: string) => (
          <span
            key={tag}
            className="text-xs px-2.5 py-1 rounded-full"
            style={{
              background: T.surfaceAlt,
              color: T.textSoft,
              border: `1px solid ${T.border}`,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Category */}
      <span
        className="hidden lg:block text-xs flex-shrink-0 font-medium"
        style={{ color: T.textXSoft }}
      >
        {cycle.category}
      </span>

      {/* Arrow */}
      <motion.div
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: T.emeraldLight }}
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke={T.emerald}
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </motion.div>
    </motion.a>
  );
}

/* ─── Floating biology blobs ─── */
function AmbientBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute rounded-full blur-[120px] opacity-40"
        style={{
          width: 500,
          height: 500,
          background: "rgba(5,150,105,0.08)",
          top: "-8%",
          right: "-5%",
        }}
        animate={{ x: [0, 20, 0], y: [0, -16, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full blur-[100px] opacity-30"
        style={{
          width: 400,
          height: 400,
          background: "rgba(8,145,178,0.07)",
          bottom: "10%",
          left: "-5%",
        }}
        animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
const ExplorePage = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeClassLevel, setActiveClassLevel] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { scrollYProgress } = useScroll();

  const [allCycles, setAllCycles] = useState<CycleData[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const classLevels = ["All", "9th", "10th", "11th", "12th"];

  // load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const cyclesRes = await cycleService.getAllCycles(1, 1000); // fetch all for now
        const catsRes = await categoryService.getAllCategories();
        const cyclesList = cyclesRes.data || cyclesRes;
        const catsList = catsRes.data || catsRes;
        setAllCycles(cyclesList);
        setAllCategories(["All", ...catsList.map((c: any) => c.name)]);
      } catch (err) {
        console.error("Failed to load explore data:", err);
        setError("Unable to load cycles or categories");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return allCycles.filter((c) => {
      const matchCat =
        activeCategory === "All" ||
        c.categoryId === activeCategory ||
        c.category === activeCategory;
      const matchClassLevel =
        activeClassLevel === "All" ||
        c.classLevel?.displayName === activeClassLevel;
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.tags?.some((t: string) =>
          t.toLowerCase().includes(search.toLowerCase()),
        );
      return matchCat && matchClassLevel && matchSearch;
    });
  }, [search, activeCategory, activeClassLevel, allCycles]);

  const hasFilters =
    search || activeCategory !== "All" || activeClassLevel !== "All";

  const clearAll = () => {
    setSearch("");
    setActiveCategory("All");
    setActiveClassLevel("All");
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background, #f8fafc)" }}
    >
      <PublicNavbar />

      {/* Scroll bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[999] origin-left"
        style={{
          scaleX: scrollYProgress,
          background: `linear-gradient(90deg, ${T.emerald}, ${T.cyan})`,
        }}
      />

      {/* ════ HERO BANNER ════ */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <AmbientBlobs />

        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(${T.emerald} 1.5px, transparent 1.5px)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Pill */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-sm font-medium"
              style={{
                background: T.emeraldLight,
                color: T.emerald,
                border: `1px solid ${T.borderStrong}`,
              }}
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.span>
              Biology Cycle Library
            </div>

            <h1
              className="font-display text-4xl md:text-6xl font-bold mb-4 leading-tight"
              style={{ color: T.text }}
            >
              Explore{" "}
              <span
                style={{
                  background: T.gradHero,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                All Cycles
              </span>
            </h1>
            <p
              className="text-lg max-w-xl mx-auto mb-8"
              style={{ color: T.textSoft }}
            >
              Search, filter, and discover interactive biology processes — from
              cell division to the Krebs cycle.
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
              {[
                { label: "Total Cycles", value: allCycles.length },
                { label: "Categories", value: allCategories.length - 1 },
                { label: "Interactive", value: "100%" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className="font-display text-2xl font-bold"
                    style={{ color: T.emerald }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: T.textXSoft }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ════ SEARCH + FILTERS ════ */}
      <div
        className="sticky top-[56px] z-40 py-4"
        style={{
          background: "rgba(248,250,252,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            {/* Search bar */}
            <motion.div
              className="relative flex-1 max-w-lg group"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
                style={{ color: search ? T.emerald : T.textXSoft }}
              />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search cycles, tags, descriptions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  background: T.surface,
                  border: `1.5px solid ${search ? T.emerald : T.border}`,
                  color: T.text,
                  boxShadow: search ? T.shadow : "0 1px 3px rgba(0,0,0,0.04)",
                }}
                onFocus={(e) => {
                  if (!search)
                    (e.target as HTMLInputElement).style.borderColor =
                      T.emeraldMid;
                }}
                onBlur={(e) => {
                  if (!search)
                    (e.target as HTMLInputElement).style.borderColor = T.border;
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: T.emeraldLight }}
                >
                  <X className="w-3 h-3" style={{ color: T.emerald }} />
                </button>
              )}
            </motion.div>

            {/* Filter toggle */}
            <motion.button
              onClick={() => setShowFilters((f) => !f)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
              style={{
                background: showFilters ? T.emeraldLight : T.surface,
                border: `1.5px solid ${showFilters ? T.emerald : T.border}`,
                color: showFilters ? T.emerald : T.textMid,
                boxShadow: T.shadow,
              }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {(activeCategory !== "All" || activeClassLevel !== "All") && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: T.emerald }}
                />
              )}
            </motion.button>

            {/* View toggle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex rounded-xl overflow-hidden flex-shrink-0"
              style={{
                border: `1.5px solid ${T.border}`,
                background: T.surface,
              }}
            >
              {(
                [
                  ["grid", LayoutGrid],
                  ["list", List],
                ] as const
              ).map(([mode, Icon]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="px-3 py-2.5 transition-all duration-200"
                  style={{
                    background:
                      viewMode === mode ? T.emeraldLight : "transparent",
                    color: viewMode === mode ? T.emerald : T.textXSoft,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </motion.div>

            {/* Results + clear */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <CountBadge count={filtered.length} />
              <span className="text-xs" style={{ color: T.textXSoft }}>
                results
              </span>
            </div>
          </div>

          {/* Expandable filter row */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.28 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-6 pt-1 pb-2">
                  {/* Category */}
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: T.textXSoft }}
                    >
                      Category
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(allCategories.length ? allCategories : categories).map(
                        (cat) => (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.03]"
                            style={{
                              background:
                                activeCategory === cat ? T.emerald : T.surface,
                              color:
                                activeCategory === cat ? "white" : T.textMid,
                              border: `1.5px solid ${activeCategory === cat ? T.emerald : T.border}`,
                              boxShadow:
                                activeCategory === cat ? T.shadow : "none",
                            }}
                          >
                            {cat}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Class Level */}
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: T.textXSoft }}
                    >
                      Class Level
                    </p>
                    <div className="flex gap-1.5">
                      {classLevels.map((d) => {
                        const dc = classLevelColor[d];
                        const isActive = activeClassLevel === d;
                        return (
                          <button
                            key={d}
                            onClick={() => setActiveClassLevel(d)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.03]"
                            style={{
                              background: isActive
                                ? dc
                                  ? dc.bg
                                  : T.emeraldLight
                                : T.surface,
                              color: isActive
                                ? dc
                                  ? dc.text
                                  : T.emerald
                                : T.textMid,
                              border: `1.5px solid ${isActive ? (dc ? dc.border : T.emerald) : T.border}`,
                            }}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Clear */}
                  {hasFilters && (
                    <div className="flex items-end">
                      <button
                        onClick={clearAll}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.03]"
                        style={{
                          background: "#fff1f2",
                          color: "#ef4444",
                          border: "1.5px solid #fca5a5",
                        }}
                      >
                        <X className="w-3 h-3" /> Clear all
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ════ ACTIVE FILTER PILLS ════ */}
      <AnimatePresence>
        {hasFilters && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 pt-4 flex items-center gap-2 flex-wrap"
          >
            <span className="text-xs" style={{ color: T.textXSoft }}>
              Active:
            </span>
            {search && (
              <span
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: T.emeraldLight,
                  color: T.emerald,
                  border: `1px solid ${T.borderStrong}`,
                }}
              >
                "{search}"
                <button onClick={() => setSearch("")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeCategory !== "All" && (
              <span
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: T.emeraldLight,
                  color: T.emerald,
                  border: `1px solid ${T.borderStrong}`,
                }}
              >
                {activeCategory}
                <button onClick={() => setActiveCategory("All")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeClassLevel !== "All" && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
                style={{
                  background: T.surface,
                  color: T.text,
                  border: `1px solid ${T.borderStrong}`,
                }}
              >
                {activeClassLevel}
                <button onClick={() => setActiveClassLevel("All")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <span className="text-xs ml-1" style={{ color: T.textXSoft }}>
              — showing{" "}
              <strong style={{ color: T.emerald }}>{filtered.length}</strong> of{" "}
              {allCycles.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════ GRID / LIST ════ */}
      <div className="container mx-auto px-4 py-8 pb-20">
        {loading ? (
          <div className="glass-panel p-12 text-center text-muted-foreground">
            Loading cycles...
          </div>
        ) : (
          <>
            {filtered.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((cycle, i) => (
                    <motion.div
                      key={cycle.id}
                      initial={{ opacity: 0, y: 20, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: i * 0.04,
                        duration: 0.35,
                        ease: "easeOut",
                      }}
                    >
                      <CycleCard cycle={cycle} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-2.5">
                  {/* List header */}
                  <div
                    className="flex items-center gap-5 px-5 pb-1 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: T.textXSoft }}
                  >
                    <span className="w-11 flex-shrink-0" />
                    <span className="flex-1">Cycle</span>
                    <span className="hidden md:block w-32">Tags</span>
                    <span className="hidden lg:block w-24">Category</span>
                    <span className="w-7" />
                  </div>
                  {filtered.map((cycle, i) => (
                    <CycleListRow key={cycle.id} cycle={cycle} index={i} />
                  ))}
                </div>
              )
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-24"
              >
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, -5, 5, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-6xl mb-6 inline-block"
                >
                  🔬
                </motion.div>
                <h3
                  className="font-display text-2xl font-bold mb-2"
                  style={{ color: T.text }}
                >
                  No cycles found
                </h3>
                <p className="text-sm mb-6" style={{ color: T.textSoft }}>
                  Try adjusting your search or clearing the filters.
                </p>
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.03]"
                  style={{ background: T.gradHero, boxShadow: T.shadow }}
                >
                  <X className="w-4 h-4" /> Clear all filters
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer
        className="py-10 text-center"
        style={{ borderTop: `1px solid ${T.border}` }}
      >
        <p className="text-sm" style={{ color: T.textXSoft }}>
          © 2026 BioCycles. Making biology interactive and engaging.
        </p>
      </footer>
    </div>
  );
};

export default ExplorePage;
