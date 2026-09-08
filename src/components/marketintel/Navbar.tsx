"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { TrendingUp, Menu, X, ArrowUpRight, Network } from "lucide-react";
import { NETWORK } from "@/lib/market-data";
import { useMarketTheme } from "./ThemeContext";

const LINKS = [
  { label: "Market Wrap", href: "#wrap" },
  { label: "Intelligence", href: "#intel" },
  { label: "IPO Tracker", href: "#ipo" },
  { label: "FII / DII", href: "#flows" },
  { label: "Explainers", href: "#topics" },
];

export default function Navbar() {
  const { theme } = useMarketTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [netOpen, setNetOpen] = useState(false);
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
            ? "glass-strong shadow-[0_8px_40px_rgba(0,0,0,0.45)] border-b border-[var(--border)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Primary">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <a href="#top" className="flex items-center gap-2.5 group">
              <span
                className={`relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105 border border-white/15 ${
                  theme === "cyberpunk"
                    ? "shadow-[0_0_24px_rgba(0,240,255,0.6)]"
                    : theme === "matrix"
                    ? "shadow-[0_0_24px_rgba(0,255,102,0.5)]"
                    : "shadow-[0_0_24px_rgba(245,158,11,0.4)]"
                }`}
              >
                <img src="/icon.png" alt="MarketIntel" className="h-full w-full object-cover rounded-xl" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-heading text-[17px] font-bold tracking-tight text-white flex items-center gap-1">
                  Market
                  <span
                    className={`glitch-text ${
                      theme === "cyberpunk"
                        ? "text-gradient-neon font-extrabold"
                        : theme === "matrix"
                        ? "text-emerald-400"
                        : "text-gradient-gold"
                    }`}
                    data-text="Intel"
                  >
                    Intel
                  </span>
                </span>
                <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  ISD Intelligence Network
                </span>
              </span>
            </a>

            {/* Desktop links */}
            <div className="hidden items-center gap-1 lg:flex">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors duration-300 hover:bg-white/5 hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
            </div>

            {/* Desktop Controls (Network, CTA) */}
            <div className="hidden items-center gap-2.5 lg:flex">
              {/* Network switcher */}
              <div className="relative">
                <button
                  onClick={() => setNetOpen((o) => !o)}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-foreground/90 transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/[0.07]"
                  aria-expanded={netOpen}
                  aria-haspopup="menu"
                >
                  <Network className="h-3.5 w-3.5 text-[var(--primary)]" />
                  Network
                </button>
                <AnimatePresence>
                  {netOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="glass-strong absolute right-0 top-11 w-72 rounded-2xl p-2 shadow-2xl border border-[var(--border)] z-50"
                      role="menu"
                    >
                      {NETWORK.map((n) => (
                        <div
                          key={n.name}
                          role="menuitem"
                          className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${
                            n.live ? "cursor-pointer bg-[var(--primary)]/[0.08]" : "cursor-not-allowed opacity-55"
                          } transition-colors hover:bg-white/[0.05]`}
                        >
                          <div>
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              {n.name}
                              {n.live && (
                                <span className="rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-emerald-400">
                                  LIVE
                                </span>
                              )}
                              {!n.live && (
                                <span className="rounded-full bg-white/[0.07] px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-muted-foreground">
                                  PHASE 2
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 text-xs text-muted-foreground">{n.desc}</div>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                      <div className="mt-1 border-t border-white/[0.07] px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
                        One connected intelligence network by ISD Info Solutions.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Get Daily Wrap CTA */}
              <a
                href="#newsletter"
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
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] lg:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5 text-foreground" />}
            </button>
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
            className="fixed inset-0 z-40 bg-[#030509]/95 backdrop-blur-2xl lg:hidden flex flex-col justify-between p-6 pt-24"
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
                  className="font-heading border-b border-white/[0.07] py-3 text-2xl font-semibold text-white/90 transition-colors hover:text-cyan-400"
                >
                  {l.label}
                </motion.a>
              ))}
            </div>

            <div>
              <a
                href="#newsletter"
                onClick={() => setMobileOpen(false)}
                className="block w-full rounded-xl bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400 py-3.5 text-center text-sm font-bold text-black uppercase tracking-wider"
              >
                Get Daily Wrap
              </a>
              <p className="mt-4 text-center text-xs text-muted-foreground font-data">
                ISD Intelligence Network // SEBI-Aware
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

