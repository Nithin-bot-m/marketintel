"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ShieldCheck, Radio, Database, Activity } from "lucide-react";
import TickerTape from "./TickerTape";
import CandleChart, { type CandleTick } from "./CandleChart";
import type { MarketSnapshot, MarketStatus } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease } },
};

const HEADLINE_A = ["Indian", "markets,"];
const HEADLINE_B = ["decoded", "daily."];

function fmtINR(v: number) {
  return Math.round(v).toLocaleString("en-IN");
}

function asOfClock(ts?: number) {
  if (!ts) return "";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(ts));
  } catch {
    return "";
  }
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0]);
  const chartScale = useTransform(scrollYProgress, [0, 1], [1, 1.07]);
  const chartOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.18]);

  const [status, setStatus] = useState<MarketStatus | null>(null);
  const [live, setLive] = useState<CandleTick | null>(null);
  const [prevPrice, setPrevPrice] = useState(0);
  const upTick = live ? live.price >= prevPrice : true;

  // one light poll drives the status chip (chart has its own feed)
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const res = await fetch("/api/market", { cache: "no-store" });
        if (!res.ok) return;
        const data: MarketSnapshot = await res.json();
        if (alive) setStatus(data.status);
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

  const handleTick = (t: CandleTick) => {
    setPrevPrice((p) => (t.price !== p ? t.price : p));
    setLive(t);
  };

  const open = status?.state === "open";
  const preopen = status?.state === "preopen";

  return (
    <section ref={ref} id="top" className="relative min-h-[100svh] overflow-hidden">
      {/* ---- live candlestick tape (real NSE 1-minute bars) ---- */}
      <motion.div style={{ scale: chartScale, opacity: chartOpacity }} className="absolute inset-0">
        <CandleChart onTick={handleTick} status={status} />
      </motion.div>

      {/* ---- cinematic scrims (text legibility, never hiding the tape fully) ---- */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_38%,transparent_0%,rgba(5,7,13,0.34)_62%,rgba(5,7,13,0.9)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,13,0.96)_0%,rgba(5,7,13,0.86)_30%,rgba(5,7,13,0.42)_58%,rgba(5,7,13,0.05)_80%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#05070d]/90 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#05070d] to-transparent" />

      {/* ---- live quote HUD ---- */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.05, duration: 0.9, ease }}
        className="absolute right-6 top-[16vh] z-10 hidden lg:block xl:right-10"
      >
        <div className="conic-border glass-strong w-[236px] rounded-2xl p-5 shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between">
            <span className="font-data text-[10px] font-semibold tracking-[0.2em] text-muted-foreground">
              NIFTY 50 · SPOT
            </span>
            {status ? (
              <span
                className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 ${
                  open
                    ? "bg-emerald-400/10"
                    : preopen
                      ? "bg-amber-400/10"
                      : "bg-white/[0.06]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    open
                      ? "animate-pulse-dot bg-emerald-400"
                      : preopen
                        ? "animate-pulse-dot bg-amber-400"
                        : "bg-amber-400/80"
                  }`}
                />
                <span
                  className={`font-data text-[9px] font-bold tracking-widest ${
                    open ? "text-emerald-400" : "text-amber-300/90"
                  }`}
                >
                  {status.label}
                </span>
              </span>
            ) : (
              <span className="h-4 w-14 animate-pulse rounded-full bg-white/[0.08]" />
            )}
          </div>

          {live ? (
            <>
              <motion.div
                key={live.price}
                initial={{ y: upTick ? 10 : -10, opacity: 0.35 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.24, ease }}
                className="font-data mt-2 text-[26px] font-bold leading-none tracking-tight text-white"
              >
                ₹{fmtINR(live.price)}
              </motion.div>
              <div
                className={`font-data mt-2 inline-flex items-center gap-1.5 text-xs font-bold ${
                  live.changePct >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                {live.changePct >= 0 ? "+" : ""}
                {live.changePct.toFixed(2)}% vs prev close
              </div>
            </>
          ) : (
            <>
              <div className="font-data mt-2 text-[26px] font-bold leading-none tracking-tight text-white/40">
                — — —
              </div>
              <div className="mt-2 h-3 w-32 animate-pulse rounded-full bg-white/[0.07]" />
            </>
          )}

          {/* micro tape */}
          <div className="mt-4 border-t border-white/[0.08] pt-3">
            <div className="flex items-center justify-between font-data text-[10px] text-muted-foreground">
              <span>Session bars</span>
              <span className="text-amber-300">{live ? live.count : "—"}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between font-data text-[10px] text-muted-foreground">
              <span>Feed</span>
              <span className="text-foreground/70">
                NSE{live?.live ? " · streaming" : " · last session"}
              </span>
            </div>
            {status && !open && (
              <div className="mt-1.5 flex items-center justify-between font-data text-[10px] text-muted-foreground">
                <span>Clock</span>
                <span className="text-foreground/70">
                  {status.istTime} IST
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ---- content ---- */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 pb-40 pt-28 sm:px-6 lg:px-8"
      >
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl">
          <motion.div variants={item} className="mb-7 flex flex-wrap items-center gap-3">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-foreground/90">
              <Radio className="h-3.5 w-3.5 text-emerald-400" />
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              {status
                ? open
                  ? "Markets live · NSE · BSE"
                  : status.label === "PRE-OPEN"
                    ? "Pre-open · session at 9:15"
                    : "Markets closed · next bell 9:15"
                : "Syncing market clock…"}
            </span>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-foreground/90">
              <Database className="h-3.5 w-3.5 text-amber-400" />
              Live exchange feed · NSE / BSE
            </span>
            <span className="glass hidden items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-foreground/90 sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5 text-violet-400" />
              100% informational · zero tips
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-heading text-[12.5vw] font-bold leading-[0.98] tracking-tight sm:text-7xl lg:text-[5.4rem]"
          >
            <span className="block">
              {HEADLINE_A.map((wd, i) => (
                <motion.span
                  key={wd}
                  initial={{ opacity: 0, y: 46, rotateX: 40 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.4 + i * 0.09, duration: 0.9, ease }}
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
                  initial={{ opacity: 0, y: 46, rotateX: 40 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.58 + i * 0.09, duration: 0.9, ease }}
                  className="text-gradient-gold mr-[0.22em] inline-block"
                >
                  {wd}
                </motion.span>
              ))}
            </span>
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
