"use client";

import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ShieldCheck, Radio, Database } from "lucide-react";
import TickerTape from "./TickerTape";

const Hero3D = dynamic(() => import("./Hero3D"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#05070d]">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="h-2 w-2 animate-pulse-dot rounded-full bg-amber-400" />
        Rendering market terrain…
      </div>
    </div>
  ),
});

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.35 } },
};
const item = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  return (
    <section ref={ref} id="top" className="relative min-h-[100svh] overflow-hidden bg-[#05070d]">
      {/* 3D canvas with scroll-driven zoom */}
      <motion.div style={{ scale: canvasScale }} className="absolute inset-0">
        <Hero3D />
      </motion.div>

      {/* cinematic vignette + top fade for nav legibility */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,7,13,0.55)_78%,rgba(5,7,13,0.9)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#05070d]/85 to-transparent" />

      {/* content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 pb-40 pt-28 sm:px-6 lg:px-8"
      >
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl">
          <motion.div variants={item} className="mb-6 flex flex-wrap items-center gap-3">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-foreground/90">
              <Radio className="h-3.5 w-3.5 text-emerald-400" />
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Markets live · NSE · BSE
            </span>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-foreground/90">
              <Database className="h-3.5 w-3.5 text-amber-400" />
              Built on T1 official sources
            </span>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-foreground/90">
              <ShieldCheck className="h-3.5 w-3.5 text-violet-400" />
              100% informational · zero tips
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-heading text-[13vw] font-bold leading-[0.98] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.2rem]"
          >
            <span className="text-gradient-frost">Indian markets,</span>
            <br />
            <span className="text-gradient-gold">decoded daily.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            MarketIntel turns NSE &amp; BSE filings, SEBI circulars, RBI releases and PIB briefs
            into crisp daily wraps, IPO intelligence and evergreen explainers — strictly
            educational, always attributed, never advice.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#wrap"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-7 py-3.5 text-sm font-bold text-black shadow-[0_0_36px_rgba(245,158,11,0.4)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_54px_rgba(245,158,11,0.6)]"
            >
              Read Today&apos;s Wrap
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </a>
            <a
              href="#intel"
              className="glass glass-hover inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-foreground"
            >
              Explore Intelligence Feed
            </a>
          </motion.div>

          {/* stat strip */}
          <motion.dl
            variants={item}
            className="mt-12 grid max-w-lg grid-cols-3 divide-x divide-white/[0.08]"
          >
            {[
              { k: "T1 sources tracked", v: "5" },
              { k: "Categories covered", v: "6" },
              { k: "Buy/sell tips", v: "0" },
            ].map((s) => (
              <div key={s.k} className="px-4 first:pl-0">
                <dt className="order-2 mt-1 text-[11px] leading-snug text-muted-foreground">{s.k}</dt>
                <dd className="font-heading order-1 text-3xl font-bold text-gradient-gold">{s.v}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>
      </motion.div>

      {/* live ticker pinned to hero bottom */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.15, duration: 0.8, ease }}
        className="absolute inset-x-0 bottom-0 z-20"
      >
        <TickerTape />
      </motion.div>
    </section>
  );
}
