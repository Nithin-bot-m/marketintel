"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ShieldCheck, Radio, Database, Activity } from "lucide-react";
import TickerTape from "./TickerTape";
import CandleChart, { type CandleTick } from "./CandleChart";
import type { LiveQuote, MarketSnapshot, MarketStatus } from "@/lib/types";
import { useMarketTheme } from "./ThemeContext";

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease } },
};

const HEADLINE_A = ["Decode", "The"];
const HEADLINE_B = ["Market."];

function fmtUSD(v: number) {
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Hero() {
  const { theme } = useMarketTheme();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0]);
  const chartScale = useTransform(scrollYProgress, [0, 1], [1, 1.07]);
  const chartOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.18]);

  const [status, setStatus] = useState<MarketStatus | null>(null);
  const [goldQuote, setGoldQuote] = useState<LiveQuote | null>(null);
  const [live, setLive] = useState<CandleTick | null>(null);
  const [prevPrice, setPrevPrice] = useState(0);

  // light poll drives the session status chip and live OANDA quote
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const res = await fetch("/api/market", { cache: "no-store" });
        if (!res.ok) return;
        const data: MarketSnapshot = await res.json();
        if (alive) {
          setStatus(data.status);
          const gq = data.indices?.find((i) => i.symbol === "XAU/USD");
          if (gq) setGoldQuote(gq);
        }
      } catch {
        /* keep last */
      }
    };
    void poll();
    const id = setInterval(poll, 15_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const handleTick = (t: CandleTick) => {
    setPrevPrice((p) => (t.price !== p ? t.price : p));
    setLive(t);
  };

  const open = status?.state === "open";
  const currentPrice = live?.price ?? goldQuote?.price ?? 4349.42;
  const currentChangePct = live?.changePct ?? goldQuote?.changePct ?? 0.75;
  const spread = 0.60;
  const bid = live?.price ? live.price - spread / 2 : goldQuote?.bid ?? (currentPrice - spread / 2);
  const ask = live?.price ? live.price + spread / 2 : goldQuote?.ask ?? (currentPrice + spread / 2);
  const upTick = currentPrice >= prevPrice;

  return (
    <section ref={ref} id="top" className="relative min-h-[100svh] overflow-hidden bg-background">
      {/* ---- live ambient candlestick chart background ---- */}
      <motion.div style={{ scale: chartScale, opacity: chartOpacity }} className="absolute inset-0">
        <CandleChart symbol="GC=F" onTick={handleTick} status={status} />
      </motion.div>

      {/* ---- atmospheric backdrop scrims ---- */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          theme === "light"
            ? "bg-[radial-gradient(ellipse_at_70%_40%,transparent_0%,rgba(248,250,252,0.4)_50%,rgba(248,250,252,0.92)_100%)]"
            : "bg-[radial-gradient(ellipse_at_70%_40%,transparent_0%,rgba(5,7,13,0.35)_50%,rgba(5,7,13,0.85)_100%)]"
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-0 ${
          theme === "light"
            ? "bg-[linear-gradient(90deg,rgba(248,250,252,0.95)_0%,rgba(248,250,252,0.82)_38%,rgba(248,250,252,0.25)_68%,rgba(248,250,252,0)_100%)]"
            : "bg-[linear-gradient(90deg,rgba(5,7,13,0.94)_0%,rgba(5,7,13,0.8)_38%,rgba(5,7,13,0.2)_68%,rgba(5,7,13,0)_100%)]"
        }`}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/90 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />

      {/* ---- Content Layout (Balanced 2-Column Hero Grid) ---- */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 pb-20 pt-20 sm:px-6 lg:px-8"
      >
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Hero Narrative, Headline, CTAs, Stats */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-7 xl:col-span-8"
          >
            <motion.div variants={item} className="mb-6 flex flex-wrap items-center gap-2.5">
              <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-foreground/90 border border-border/60 shadow-sm">
                <Radio className="h-3.5 w-3.5 text-emerald-400" />
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                {status ? status.label : "Syncing market session…"}
              </span>
              <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-foreground/90 border border-border/60 shadow-sm">
                <Database className="h-3.5 w-3.5 text-amber-500" />
                NFX3 Bullion &amp; FX Feed · 24/5
              </span>
              <span className="glass hidden items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-foreground/90 border border-border/60 shadow-sm sm:inline-flex">
                <ShieldCheck className="h-3.5 w-3.5 text-violet-400" />
                Institutional Macro · 100% Educational
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="font-heading text-4xl sm:text-6xl lg:text-[4.5rem] font-bold leading-[1.04] tracking-tight break-words"
            >
              <span className="sr-only">NFX3 (NFX³) — </span>
              <span className="block">
                {HEADLINE_A.map((wd, i) => (
                  <motion.span
                    key={wd}
                    initial={{ opacity: 0, y: 36, rotateX: 40 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.4 + i * 0.09, duration: 0.8, ease }}
                    className="text-gradient-frost mr-[0.22em] inline-block"
                  >
                    {wd}
                  </motion.span>
                ))}
              </span>
              <span className="block">
                {HEADLINE_B.map((wd, i) => (
                  <motion.span
                    key={wd}
                    initial={{ opacity: 0, y: 36, rotateX: 40 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.58 + i * 0.09, duration: 0.8, ease }}
                    className={`mr-[0.22em] inline-block ${
                      theme === "cyberpunk"
                        ? "glitch-text text-gradient-neon font-extrabold"
                        : theme === "matrix"
                        ? "text-emerald-400 font-extrabold"
                        : "text-gradient-gold"
                    }`}
                    data-text={wd}
                  >
                    {wd}
                  </motion.span>
                ))}
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground"
            >
              NFX3 (NFX³) decodes global foreign exchange markets, live XAU/USD bullion flows,
              ForexFactory high-impact economic calendar releases, and central bank policy decisions —
              institutional rigour, strictly educational, zero noise.
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#calendar"
                className={`group relative inline-flex items-center gap-2 overflow-hidden px-6 py-3.5 text-sm font-bold text-black transition-all duration-300 hover:scale-[1.03] ${
                  theme === "cyberpunk"
                    ? "cyber-chamfer-sm bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 shadow-[0_0_36px_rgba(0,240,255,0.45)] hover:shadow-[0_0_54px_rgba(0,240,255,0.7)]"
                    : theme === "matrix"
                    ? "rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_36px_rgba(0,255,102,0.4)]"
                    : "rounded-full bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_36px_rgba(245,158,11,0.35)]"
                }`}
              >
                ForexFactory Calendar
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </a>
              <a
                href="#wrap"
                className={`glass glass-hover inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-foreground border border-border/70 ${
                  theme === "cyberpunk" ? "cyber-chamfer-sm border-cyan-400/30" : "rounded-full"
                }`}
              >
                Daily Forex Wrap
              </a>
            </motion.div>

            {/* stat strip */}
            <motion.dl
              variants={item}
              className="mt-10 grid max-w-lg grid-cols-3 divide-x divide-border/60 border-t border-border/60 pt-5"
            >
              {[
                { k: "Major & cross pairs", v: "24+" },
                { k: "ForexFactory live feed", v: "100%" },
                { k: "Buy/sell calls", v: "0" },
              ].map((s) => (
                <div key={s.k} className="px-3 sm:px-5 first:pl-0">
                  <dt className="order-2 mt-1 text-[11px] leading-snug text-muted-foreground">{s.k}</dt>
                  <dd
                    className={`font-heading order-1 text-2xl sm:text-3xl font-bold ${
                      theme === "cyberpunk"
                        ? "text-gradient-neon"
                        : theme === "matrix"
                        ? "text-emerald-400"
                        : "text-gradient-gold"
                    }`}
                  >
                    {s.v}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </motion.div>

          {/* Right Column: Live XAU/USD Bullion & Interbank Telemetry HUD */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.85, ease }}
            className="lg:col-span-5 xl:col-span-4 flex justify-center lg:justify-end"
          >
            <div
              className={`w-full max-w-[340px] p-6 backdrop-blur-xl border border-border/70 bg-card/70 dark:bg-card/30 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.55)] transition-all ${
                theme === "cyberpunk"
                  ? "cyber-chamfer cyber-card cyber-corner-tl cyber-corner-br border-cyan-400/40 glow-cyan"
                  : theme === "matrix"
                  ? "rounded-3xl border-emerald-400/40 glow-matrix"
                  : "rounded-3xl"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-sm font-black tracking-wider text-foreground">
                    XAU/USD
                  </span>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-primary border border-primary/20">
                    SPOT
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  REALTIME
                </span>
              </div>

              {/* Current Spot Price */}
              <div className="mt-4 flex items-baseline justify-between">
                <motion.div
                  key={currentPrice}
                  initial={{ y: upTick ? 6 : -6, opacity: 0.5 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.22, ease }}
                  className="font-data text-3xl font-bold leading-none tracking-tight text-foreground flex items-baseline gap-1.5"
                >
                  <span>${fmtUSD(currentPrice)}</span>
                  <span className="text-xs font-normal text-muted-foreground">USD/oz</span>
                </motion.div>
                <div
                  className={`font-data inline-flex items-center gap-1 text-xs font-bold ${
                    currentChangePct >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" />
                  {currentChangePct >= 0 ? "+" : ""}
                  {currentChangePct.toFixed(2)}%
                </div>
              </div>

              {/* Interbank Bid / Ask */}
              <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-border/60 pt-3.5">
                <div className="rounded-xl bg-card/80 dark:bg-card/40 border border-border/60 p-2.5 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">BID</div>
                  <div className="font-data text-xs sm:text-sm font-bold text-foreground mt-0.5">${fmtUSD(bid)}</div>
                </div>
                <div className="rounded-xl bg-card/80 dark:bg-card/40 border border-border/60 p-2.5 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">ASK</div>
                  <div className="font-data text-xs sm:text-sm font-bold text-foreground mt-0.5">${fmtUSD(ask)}</div>
                </div>
              </div>

              {/* Telemetry metadata */}
              <div className="mt-3.5 border-t border-border/60 pt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between font-data text-[11px] text-muted-foreground">
                  <span>Spread</span>
                  <span className="font-bold text-foreground">${spread.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between font-data text-[11px] text-muted-foreground">
                  <span>Feed Provider</span>
                  <span className="font-semibold text-foreground">OANDA · Live Interbank</span>
                </div>
                <div className="flex items-center justify-between font-data text-[11px] text-muted-foreground">
                  <span>Timeframe</span>
                  <span className="font-semibold text-foreground">1-Min Ambient Bars</span>
                </div>
                {status && (
                  <div className="flex items-center justify-between font-data text-[11px] text-muted-foreground">
                    <span>Session Time</span>
                    <span className="font-medium text-foreground/80">{status.gmtTime}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
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
