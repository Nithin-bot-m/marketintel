"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useMarketTheme } from "./ThemeContext";

const LINKS = [
  { label: "Daily Wrap", href: "#wrap" },
  { label: "Forex Calendar", href: "#calendar" },
  { label: "COT Flows", href: "#flows" },
  { label: "Intelligence", href: "#intel" },
  { label: "FX Guides", href: "#topics" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const { theme, isDark, toggleTheme } = useMarketTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass-strong shadow-[0_8px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.45)] border-b border-[var(--border)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Primary">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <a
              href="#top"
              className="flex items-center group py-0.5"
              aria-label="NFX³ — Decode The Market"
            >
              <div
                className={`relative flex items-center justify-center rounded-2xl px-2.5 py-1 transition-all duration-300 group-hover:scale-[1.03] ${
                  theme === "light"
                    ? "bg-[#060812] border border-cyan-500/30 shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
                    : "bg-transparent border border-transparent hover:drop-shadow-[0_0_22px_rgba(0,180,255,0.45)]"
                }`}
              >
                <img
                  src="/nfx-brand.png?v=12"
                  alt="NFX³ — Decode The Market"
                  className="h-10 sm:h-11 md:h-12 w-auto object-contain drop-shadow-[0_0_18px_rgba(0,180,255,0.35)]"
                />
              </div>
            </a>

            {/* Desktop links */}
            <div className="hidden items-center gap-1 lg:flex">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors duration-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
            </div>

            {/* Desktop Controls (CTA + Theme Switcher) */}
            <div className="hidden items-center gap-2.5 lg:flex">
              {/* Dark / Light Mode Switcher */}
              <button
                type="button"
                onClick={toggleTheme}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/80 text-foreground transition-all duration-300 hover:border-amber-400 hover:scale-105 hover:shadow-[0_0_16px_rgba(245,158,11,0.25)] cursor-pointer"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? (
                  <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-500 transition-transform duration-300 hover:-rotate-12" />
                )}
              </button>

              {/* Get Daily Wrap CTA */}
              <a
                href="#wrap"
                className={`group relative overflow-hidden rounded-full px-5 py-2 text-xs font-bold text-black transition-all duration-300 ${
                  theme === "cyberpunk"
                    ? "bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 shadow-[0_0_24px_rgba(0,240,255,0.45)] hover:shadow-[0_0_36px_rgba(0,240,255,0.7)] cyber-chamfer-sm"
                    : theme === "matrix"
                    ? "bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_24px_rgba(0,255,102,0.4)]"
                    : "bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_28px_rgba(245,158,11,0.35)]"
                }`}
              >
                <span className="relative z-10 uppercase tracking-wider">Daily Wrap</span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </a>
            </div>

            {/* Mobile toggle */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/80 text-foreground"
                aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-500" />
                )}
              </button>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/80"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5 text-foreground" />}
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl lg:hidden flex flex-col justify-between p-6 pt-24"
          >
            <div className="flex flex-col gap-2">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="font-heading border-b border-border py-3 text-2xl font-semibold text-foreground/90 transition-colors hover:text-amber-400"
                >
                  {l.label}
                </motion.a>
              ))}
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground"
              >
                {isDark ? (
                  <>
                    <Sun className="h-4 w-4 text-amber-400" />
                    <span>Switch to Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 text-indigo-500" />
                    <span>Switch to Dark Mode</span>
                  </>
                )}
              </button>
              <a
                href="#wrap"
                onClick={() => setMobileOpen(false)}
                className="block w-full rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 py-3.5 text-center text-sm font-bold text-black uppercase tracking-wider"
              >
                Get Daily Wrap
              </a>
              <p className="mt-2 text-center text-xs text-muted-foreground font-data">
                NFX³ // Global FX &amp; Bullion Live Feeds
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

