"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { CandleBar, LiveQuote, MarketSnapshot } from "@/lib/types";
import { Reveal, SectionHeading } from "./Primitives";
import MiniCandles from "./MiniCandles";
import { useMarketTheme } from "./ThemeContext";

const YAHOO_SYM: Record<string, string> = {
  "XAU/USD": "GC=F",
  "EUR/USD": "EURUSD=X",
  "GBP/USD": "GBPUSD=X",
  "USD/JPY": "USDJPY=X",
};

const CARD_ORDER = ["XAU/USD", "EUR/USD", "GBP/USD", "USD/JPY"];

function formatPairPrice(v: number | null, symbol: string) {
  if (v == null || isNaN(v)) return "—";
  if (symbol === "XAU/USD") {
    return `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (symbol === "USD/JPY") {
    return v.toFixed(2);
  }
  return v.toFixed(4);
}

function formatPairChange(change: number, symbol: string) {
  const sign = change >= 0 ? "+" : "−";
  const abs = Math.abs(change);
  if (symbol === "XAU/USD") {
    return `${sign}$${abs.toFixed(2)}`;
  }
  if (symbol === "USD/JPY") {
    return `${sign}${abs.toFixed(2)}`;
  }
  return `${sign}${abs.toFixed(4)}`;
}

/* smooth count-up that always continues from the previous displayed value */
function useCountUp(target: number | null, active: boolean, duration = 1100) {
  const [val, setVal] = useState<number | null>(null);
  const fromRef = useRef(0);
  const targetRef = useRef<number | null>(null);

  useEffect(() => {
    if (target == null || !active) return;
    const from = targetRef.current == null ? target * 0.985 : fromRef.current;
    targetRef.current = target;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * eased;
      fromRef.current = v;
      setVal(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);

  return val;
}

function SkeletonCard({ i }: { i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 44 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="glass relative h-full overflow-hidden rounded-2xl p-5"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded-full bg-white/[0.08]" />
          <div className="h-2.5 w-16 animate-pulse rounded-full bg-white/[0.05]" />
        </div>
        <div className="h-6 w-16 animate-pulse rounded-full bg-white/[0.06]" />
      </div>
      <div className="mt-5 h-7 w-32 animate-pulse rounded-lg bg-white/[0.07]" />
      <div className="mt-2 h-3 w-24 animate-pulse rounded-full bg-white/[0.05]" />
      <div className="mt-5 h-16 w-full animate-pulse rounded-lg bg-white/[0.04]" />
    </motion.div>
  );
}

function IndexCard({
  idx,
  candles,
  i,
}: {
  idx: LiveQuote;
  candles: CandleBar[] | null;
  i: number;
}) {
  const { theme } = useMarketTheme();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const up = idx.changePct >= 0;
  const animated = useCountUp(idx.price, inView);

  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -py * 7, ry: px * 9 });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 800 }}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
    >
      <motion.div
        animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
        className={`glass-hover group relative h-full overflow-hidden p-5 transition-all duration-300 ${
          theme === "cyberpunk"
            ? "cyber-chamfer cyber-card cyber-corner-tl cyber-corner-br border-cyan-400/30 hover:border-cyan-400 hover:glow-cyan bg-[#070e17]/80"
            : theme === "matrix"
            ? "rounded-2xl border-emerald-500/30 hover:border-emerald-400 hover:glow-matrix bg-[#041208]/80"
            : "glass rounded-2xl"
        }`}
      >
        {/* top accent line */}
        <div
          className={`absolute inset-x-0 top-0 h-[2px] ${
            up
              ? "bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent"
              : "bg-gradient-to-r from-transparent via-rose-400/70 to-transparent"
          } opacity-60 transition-opacity duration-500 group-hover:opacity-100`}
        />
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-data text-[12px] font-bold tracking-[0.14em] text-foreground">
                {idx.symbol}
              </span>
              <span className="rounded bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-amber-300">
                {idx.source || "OANDA"}
              </span>
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/70">{idx.name}</div>
          </div>
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-1 font-data text-[11px] font-bold ${
              up ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400"
            }`}
          >
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {up ? "+" : ""}
            {idx.changePct.toFixed(2)}%
          </span>
        </div>

        <div
          className={`font-data mt-4 text-[26px] font-bold tracking-tight ${
            up ? "text-emerald-300" : "text-rose-300"
          }`}
        >
          {animated != null ? formatPairPrice(animated, idx.symbol) : "—"}
        </div>
        <div className="mt-0.5 flex items-center justify-between font-data text-xs">
          <span className={up ? "text-emerald-400/80" : "text-rose-400/80"}>
            {formatPairChange(idx.change, idx.symbol)}
          </span>
          {idx.bid != null && idx.ask != null && (
            <span className="text-[10px] text-muted-foreground">
              B: {idx.bid.toFixed(idx.precision ?? 2)} / A: {idx.ask.toFixed(idx.precision ?? 2)}
            </span>
          )}
        </div>

        <div className="mt-4">
          <MiniCandles candles={candles} up={up} className="h-16 w-full" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Indices() {
  const [snap, setSnap] = useState<MarketSnapshot | null>(null);
  const [candleMap, setCandleMap] = useState<Record<string, CandleBar[] | null>>({});

  // live quotes
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const res = await fetch("/api/market", { cache: "no-store" });
        if (!res.ok) return;
        const data: MarketSnapshot = await res.json();
        if (alive) setSnap(data);
      } catch {
        /* keep last */
      }
    };
    void poll();
    const id = setInterval(poll, 30_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // real intraday candles per pair card (5-minute bars)
  useEffect(() => {
    let alive = true;
    const load = async () => {
      await Promise.all(
        CARD_ORDER.map(async (label) => {
          const sym = YAHOO_SYM[label];
          if (!sym) return;
          try {
            const res = await fetch(
              `/api/candles?symbol=${encodeURIComponent(sym)}&interval=5m&range=1d`,
              { cache: "no-store" },
            );
            if (!res.ok) return;
            const data: { candles: CandleBar[] } = await res.json();
            if (alive && Array.isArray(data.candles) && data.candles.length) {
              setCandleMap((m) => ({ ...m, [label]: data.candles }));
            }
          } catch {
            /* card keeps skeleton */
          }
        }),
      );
    };
    void load();
    const id = setInterval(load, 180_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const status = snap?.status;
  const feedChip = status
    ? status.state === "open"
      ? `Live OANDA & interbank feed · ${status.gmtTime}`
      : `Interbank closed · ${status.detail}`
    : "Connecting to OANDA interbank feed…";

  const cards = CARD_ORDER.map((label) => snap?.indices.find((q) => q.symbol === label)).map(
    (q, i) => ({ q, i }),
  );
  const anyLoaded = snap != null;

  return (
    <section className="relative py-24 sm:py-28" id="pulse">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            index="01"
            kicker="Currency & Bullion Pulse"
            title={
              <>
                Major pairs &amp; <span className="text-gradient-gold">flagship bullion</span>
              </>
            }
            sub="Real-time interbank quotes and 5-minute candlestick trajectories across the world's most traded currency pairs and spot Gold. 100% authentic interbank telemetry."
          />
          <Reveal delay={0.15}>
            <div className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs text-muted-foreground">
              <span
                className={`h-1.5 w-1.5 animate-pulse-dot rounded-full ${
                  status?.state === "open" ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              {feedChip}
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {anyLoaded
            ? cards.map(({ q, i }) =>
                q ? (
                  <IndexCard
                    key={q.symbol}
                    idx={q}
                    candles={candleMap[q.symbol] ?? null}
                    i={i}
                  />
                ) : (
                  <SkeletonCard key={`sk-${i}`} i={i} />
                ),
              )
            : CARD_ORDER.map((_, i) => <SkeletonCard key={`sk-${i}`} i={i} />)}
        </div>
      </div>
    </section>
  );
}
