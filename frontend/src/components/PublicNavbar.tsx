import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Dna, Menu, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const T = {
  emerald:      "#059669",
  emeraldLight: "#d1fae5",
  emeraldMid:   "#6ee7b7",
  cyan:         "#0891b2",
  border:       "#d1fae5",
  text:         "#0f172a",
  textSoft:     "#64748b",
  gradHero:     "linear-gradient(135deg, #059669 0%, #0891b2 100%)",
  shadow:       "0 4px 24px rgba(5,150,105,0.10)",
};

const links = [
  { label: "Home",    to: "/" },
  { label: "Explore", to: "/explore" },
];

const PublicNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [mounted, setMounted]       = useState(false);
  const location = useLocation();

  const isDarkHero =
    location.pathname === "/" || location.pathname.startsWith("/cycle/");

  /* ── mount flag: skip entry animation on first render ── */
  useEffect(() => {
    // Small delay so the very first paint is already fully visible
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  /* ── scroll detection ── */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    handler(); // set correct state on mount
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* ── close mobile menu on route change ── */
  useEffect(() => setMobileOpen(false), [location.pathname]);

  /* ── lock body scroll while drawer is open ── */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  /* ── colours ── */
  const transparentDark  = isDarkHero && !scrolled;
  const navBg            = transparentDark ? "transparent" : "rgba(255,255,255,0.93)";
  const navBorder        = transparentDark ? "transparent" : T.border;
  const navShadow        = scrolled        ? T.shadow      : "none";
  const linkColor        = transparentDark ? "rgba(255,255,255,0.65)" : T.textSoft;
  const linkActiveColor  = transparentDark ? "#ffffff"     : T.text;
  const logoTextColor    = transparentDark ? "#ffffff"     : T.text;

  return (
    <>
      {/* ════ NAV BAR ════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: navBg,
          borderBottom: `1px solid ${navBorder}`,
          boxShadow: navShadow,
          backdropFilter: transparentDark ? "none" : "blur(18px)",
          // No entry animation — navbar is always immediately visible
          opacity: 1,
        }}
      >
        <div className="container mx-auto flex items-center justify-between h-16 px-4">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: T.gradHero, boxShadow: "0 0 14px rgba(5,150,105,0.28)" }}
            >
              <Dna style={{ width: 18, height: 18, color: "white" }} />
            </motion.div>
            <span
              className="font-display font-bold text-lg transition-colors duration-300"
              style={{ color: logoTextColor }}
            >
              Bio
              <span style={{
                background: transparentDark ? undefined : T.gradHero,
                WebkitBackgroundClip: transparentDark ? undefined : "text",
                WebkitTextFillColor: transparentDark ? "white" : "transparent",
              }}>
                Cycles
              </span>
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          <LayoutGroup>
            <div className="hidden md:flex items-center gap-1">
              {links.map(l => {
                const isActive = location.pathname === l.to;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="relative px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200"
                    style={{ color: isActive ? linkActiveColor : linkColor }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: transparentDark ? "rgba(255,255,255,0.14)" : T.emeraldLight }}
                        transition={{ type: "spring", bounce: 0.18, duration: 0.38 }}
                      />
                    )}
                    <span className="relative">{l.label}</span>
                  </Link>
                );
              })}
            </div>
          </LayoutGroup>

          {/* ── Desktop right side ── */}
          {/* <div className="hidden md:flex items-center gap-3">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: transparentDark ? "rgba(255,255,255,0.10)" : T.emeraldLight,
                color:      transparentDark ? "rgba(255,255,255,0.80)" : T.emerald,
                border:     `1px solid ${transparentDark ? "rgba(255,255,255,0.16)" : T.emeraldMid}`,
              }}
            >
              <Sparkles style={{ width: 12, height: 12 }} />
              6 Cycles Live
            </div> */}

            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="text-sm font-semibold px-5 py-2 rounded-xl text-white"
                style={{ background: T.gradHero, boxShadow: "0 2px 12px rgba(5,150,105,0.26)" }}
              >
                Admin Login
              </motion.button>
            </Link>
          </div>

          {/* ── Mobile burger ── */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: transparentDark ? "rgba(255,255,255,0.12)" : T.emeraldLight,
              color:      transparentDark ? "white" : T.emerald,
            }}
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen
                ? <motion.span key="x"
                    initial={{ rotate: -80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 80, opacity: 0 }} transition={{ duration: 0.14 }}>
                    <X style={{ width: 18, height: 18 }} />
                  </motion.span>
                : <motion.span key="menu"
                    initial={{ rotate: 80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -80, opacity: 0 }} transition={{ duration: 0.14 }}>
                    <Menu style={{ width: 18, height: 18 }} />
                  </motion.span>
              }
            </AnimatePresence>
          </motion.button>
        </div>
      </nav>

      {/* ════ MOBILE MENU — rendered as a portal-style full overlay ════
           Backdrop + drawer are siblings at root level (inside the fragment).
           Backdrop z-index is BELOW drawer but ABOVE all page content.
           Body scroll is locked while open (via useEffect above).
      ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Full-screen backdrop — sits above page, below drawer */}
            <motion.div
              key="mob-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 md:hidden"
              style={{
                zIndex: 55,  // above page content (z-10 area), below drawer (z-60)
                background: "rgba(15,23,42,0.45)",
                backdropFilter: "blur(5px)",
                WebkitBackdropFilter: "blur(5px)",
                // sits flush under the navbar (64px)
                top: 64,
              }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer card — floating panel, not pushed into page flow */}
            <motion.div
              key="mob-drawer"
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1,    y: 0   }}
              exit={{ opacity: 0,   scale: 0.96, y: -6   }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed md:hidden rounded-2xl"
              style={{
                zIndex: 60,       // above backdrop
                top: 72,          // 64px navbar + 8px gap
                left: 12,
                right: 12,
                background: "rgba(255,255,255,0.98)",
                border: `1.5px solid ${T.border}`,
                boxShadow: "0 8px 40px rgba(5,150,105,0.18), 0 2px 12px rgba(0,0,0,0.10)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                // No overflow:hidden — content determines height naturally
              }}
            >
              {/* Links */}
              <div className="p-3 space-y-1">
                {links.map((l, i) => {
                  const isActive = location.pathname === l.to;
                  return (
                    <motion.div
                      key={l.to}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.055, duration: 0.2 }}
                    >
                      <Link
                        to={l.to}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background: isActive ? T.emeraldLight : "transparent",
                          color:      isActive ? T.emerald      : T.textSoft,
                        }}
                      >
                        {isActive && (
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: T.emerald }}
                          />
                        )}
                        {l.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Hairline divider */}
              <div style={{ height: 1, background: T.border, margin: "0 12px" }} />

              {/* Bottom section */}
              <div className="p-3 space-y-2.5">
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                  style={{ background: T.emeraldLight }}
                >
                  <Sparkles style={{ width: 14, height: 14, color: T.emerald }} />
                  <span className="text-xs font-semibold" style={{ color: T.emerald }}>
                    6 interactive cycles live
                  </span>
                </div>

                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <button
                    className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ background: T.gradHero, boxShadow: T.shadow }}
                  >
                    Admin Login
                  </button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PublicNavbar;