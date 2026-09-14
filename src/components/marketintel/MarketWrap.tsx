"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  Calendar,
  BarChart3,
  Landmark,
  Clock,
  GraduationCap,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Globe,
} from "lucide-react";
import {
  FLOWS_MONTHLY,
  FLOW_SESSIONS,
  IPOS,
  MACRO,
  WRAP_FACTS,
  formatCr,
  formatFXPrice,
} from "@/lib/market-data";
import type { MarketSnapshot } from "@/lib/types";
import { Reveal, SectionHeading } from "./Primitives";
import { useMarketTheme } from "./ThemeContext";

function TiltCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { theme } = useMarketTheme();
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 900 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setTilt({ rx: -py * 5, ry: px * 7 });
      }}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      className={className}
    >
      <motion.div
        animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
        transition={{ type: "spring", stiffness: 170, damping: 18 }}
        className={`glass-hover relative h-full overflow-hidden transition-all duration-300 ${
          theme === "cyberpunk"
            ? "cyber-chamfer cyber-card cyber-corner-tl cyber-corner-br border-cyan-400/25 bg-[#060c14]/85"
            : theme === "matrix"
            ? "rounded-3xl border-emerald-500/25 bg-[#031106]/85"
            : "glass rounded-3xl"
        }`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function CardHeader({
  icon: Icon,
  tint,
  label,
  meta,
}: {
  icon: React.ElementType;
  tint: string;
  label: string;
  meta?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: `${tint}1a`, color: tint }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold text-foreground/90">{label}</span>
      </div>
      {meta && <span className="font-data text-[10px] uppercase tracking-wider text-muted-foreground">{meta}</span>}
    </div>
  );
}

interface WrapRow {
  t: string;
  tag: string;
  up: boolean;
}

function useWrapRows(snap: MarketSnapshot | null): WrapRow[] {
  if (!snap) return [];
  const rows: WrapRow[] = [];
  const b = snap.breadth;
  if (b) {
    rows.push({
      t: `Market Breadth: ${b.advancers} bullish vs ${b.decliners} bearish across ${b.universe}`,
      tag: "BREADTH",
      up: b.advancers >= b.decliners,
    });
  }
  if (snap.dxy) {
    rows.push({
      t: `US Dollar Index (DXY) at ${snap.dxy.price.toFixed(2)} (${snap.dxy.changePct >= 0 ? "+" : ""}${snap.dxy.changePct.toFixed(2)}%) — greenback positioning steady`,
      tag: "DXY",
      up: snap.dxy.changePct >= 0,
    });
  }
  const gold = snap.indices.find((q) => q.symbol === "XAU/USD");
  if (gold) {
    rows.push({
      t: `Spot Gold (XAU/USD) trading at $${gold.price.toFixed(2)} (${gold.changePct >= 0 ? "+" : ""}${gold.changePct.toFixed(2)}%) — bullion safe-haven bid firm`,
      tag: "XAU/USD",
      up: gold.changePct >= 0,
    });
  }
  const sortedSectors = [...snap.sectors].sort((a, z) => z.changePct - a.changePct);
  if (sortedSectors.length >= 2) {
    const top = sortedSectors[0];
    const lag = sortedSectors[sortedSectors.length - 1];
    rows.push({
      t: `${top.label} leads FX cross board at ${top.changePct >= 0 ? "+" : ""}${top.changePct.toFixed(2)}%`,
      tag: "CROSS",
      up: top.changePct >= 0,
    });
    rows.push({
      t: `${lag.label} lags session performance (${lag.changePct >= 0 ? "+" : ""}${lag.changePct.toFixed(2)}%)`,
      tag: "CROSS",
      up: lag.changePct >= 0,
    });
  }
  if (snap.vix) {
    rows.push({
      t: `Volatility Index at ${snap.vix.price.toFixed(2)} (${snap.vix.changePct >= 0 ? "+" : ""}${snap.vix.changePct.toFixed(2)}%) — macro risk regime stable`,
      tag: "VOL",
      up: snap.vix.changePct < 0,
    });
  }
  return rows.slice(0, 6);
}

export default function MarketWrap() {
  const [snap, setSnap] = useState<MarketSnapshot | null>(null);

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

  const rows = useWrapRows(snap);
  const gold = snap?.indices.find((q) => q.symbol === "XAU/USD");
  const eur = snap?.indices.find((q) => q.symbol === "EUR/USD");
  const dxy = snap?.dxy;

  return (
    <section id="wrap" className="relative py-24 sm:py-28">
      {/* ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-amber-500/[0.05] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          index="02"
          kicker="The Daily FX Wrap"
          title={
            <>
              One bento. The global <span className="text-gradient-gold">currency pulse.</span>
            </>
          }
          sub="Live interbank feeds, central bank policy radar, ForexFactory releases, and institutional CFTC positioning — distilled into one unified intelligence board."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6">
          {/* ── FEATURE: Market Wrap ───────────────────────────── */}
          <TiltCard className="conic-border md:col-span-2 lg:col-span-4 lg:row-span-2">
            <div className="flex h-full flex-col p-6 sm:p-8">
              <CardHeader
                icon={Newspaper}
                tint="#f59e0b"
                label="Global Currency & Bullion Wrap"
                meta={gold ? `INTERBANK FEED · ${snap?.status.gmtTime}` : "SYNCING FEED"}
              />
              <h3 className="font-heading mt-6 text-2xl font-bold leading-snug text-foreground sm:text-3xl">
                {gold && eur ? (
                  <>
                    Gold ${formatFXPrice(gold.price, 2)}{" "}
                    <span className={gold.changePct >= 0 ? "text-emerald-400" : "text-rose-400"}>
                      ({gold.changePct >= 0 ? "+" : ""}
                      {gold.changePct.toFixed(2)}%)
                    </span>{" "}
                    · EUR/USD {formatFXPrice(eur.price, 4)}{" "}
                    <span className={eur.changePct >= 0 ? "text-emerald-400" : "text-rose-400"}>
                      ({eur.changePct >= 0 ? "+" : ""}
                      {eur.changePct.toFixed(2)}%)
                    </span>
                    {dxy && (
                      <span className="text-foreground/70 text-lg sm:text-xl font-normal block sm:inline sm:ml-2">
                        · DXY {dxy.price.toFixed(2)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="inline-block h-8 w-72 animate-pulse rounded-xl bg-white/[0.07]" />
                )}
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                {WRAP_FACTS.headline}. {WRAP_FACTS.context}
              </p>

              {/* wrap rows — live-derived */}
              <div className="mt-8 grid flex-1 content-start gap-3">
                {rows.length ? (
                  rows.map((w, i) => (
                    <Reveal key={`${w.tag}-${i}`} delay={0.05 * i} y={18}>
                      <div className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 transition-all duration-300 hover:border-amber-400/25 hover:bg-white/[0.05]">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            w.up ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400"
                          }`}
                        >
                          {w.up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </span>
                        <p className="flex-1 text-sm leading-snug text-foreground/85">{w.t}</p>
                        <span className="font-data hidden shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[10px] tracking-wider text-muted-foreground sm:block">
                          {w.tag}
                        </span>
                      </div>
                    </Reveal>
                  ))
                ) : (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 animate-pulse rounded-2xl bg-white/[0.04]" />
                  ))
                )}
              </div>

              <p className="mt-5 text-[11px] text-muted-foreground/80">{WRAP_FACTS.sourceLine}</p>

              <a
                href="#intel"
                className="group mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-amber-400 transition-colors hover:text-amber-300"
              >
                Read Institutional Intelligence
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </TiltCard>

          {/* ── ForexFactory Economic Calendar Preview ───────────────────────────── */}
          <TiltCard className="lg:col-span-2" delay={0.08}>
            <div className="flex h-full flex-col p-6">
              <CardHeader icon={Calendar} tint="#10b981" label="ForexFactory Radar" meta="HIGH IMPACT" />
              <div className="mt-5 space-y-3.5">
                {IPOS.slice(0, 3).map((item) => (
                  <div key={item.name} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-colors hover:border-emerald-400/20">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-data rounded bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                        {item.kind}
                      </span>
                      <span className="font-data text-[10px] text-amber-300/90">{item.window}</span>
                    </div>
                    <div className="mt-2 text-sm font-medium text-foreground/90 leading-snug">{item.name}</div>
                    <div className="mt-1 flex items-center justify-between font-data text-[11px] text-muted-foreground">
                      <span>{item.priceBand}</span>
                      <span>{item.lot}</span>
                    </div>
                  </div>
                ))}
              </div>
              <a href="#calendar" className="group mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-emerald-400 transition-colors hover:text-emerald-300">
                Open Full Economic Calendar
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </TiltCard>

          {/* ── CFTC COT Positioning ───────────────────────────── */}
          <TiltCard className="lg:col-span-2" delay={0.12}>
            <div className="flex h-full flex-col p-6">
              <CardHeader icon={BarChart3} tint="#8b5cf6" label="CFTC COT Positioning" meta="INSTITUTIONAL" />
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300/80">Gold Net Long</div>
                  <div className="font-data mt-1.5 text-xl font-bold text-amber-300">
                    {formatCr(FLOW_SESSIONS.fii)}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">speculative contracts</div>
                </div>
                <div className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.06] p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-violet-300/80">EUR Net Long</div>
                  <div className="font-data mt-1.5 text-xl font-bold text-violet-300">
                    {formatCr(FLOW_SESSIONS.dii)}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">6-month expansion</div>
                </div>
              </div>
              {/* mini flow bars — verified monthly Gold positioning */}
              <div className="mt-6 flex h-16 items-end gap-1.5" aria-hidden>
                {FLOWS_MONTHLY.map((f, i) => {
                  return (
                    <motion.div
                      key={f.month}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${Math.max(12, (f.fii / 300000) * 100)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: 0.15 + i * 0.06, ease: "easeOut" }}
                      className="w-full self-end rounded-t-md bg-amber-400/60"
                      title={`${f.month} ${f.year}: ${formatCr(f.fii)}`}
                      style={{ alignSelf: "flex-end" }}
                    />
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                CFTC Gold speculative net contracts · Mar – Aug 2026
              </p>
              <a href="#flows" className="group mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-violet-300 transition-colors hover:text-violet-200">
                View COT Breakdown
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </TiltCard>

          {/* ── Central Bank Policy Radar ───────────────────────────── */}
          <TiltCard className="lg:col-span-2" delay={0.16}>
            <div className="flex h-full flex-col p-6">
              <CardHeader icon={Landmark} tint="#fbbf24" label="Central Bank Radar" meta="POLICY BENCHMARKS" />
              <div className="mt-5 divide-y divide-white/[0.06]">
                {MACRO.map((m) => (
                  <div key={m.label} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <div className="text-sm font-medium text-foreground/90">{m.label}</div>
                      <div className="text-[11px] text-muted-foreground">{m.sub}</div>
                    </div>
                    <div className="font-data text-base font-bold text-amber-300">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-auto pt-4 text-[11px] leading-relaxed text-muted-foreground">
                Official monetary policy benchmarks — Federal Reserve, European Central Bank,
                Bank of England &amp; Bank of Japan.
              </p>
            </div>
          </TiltCard>

          {/* ── 24-Hour World Forex Sessions Clock ───────────────────────────── */}
          <TiltCard className="lg:col-span-2" delay={0.2}>
            <div className="flex h-full flex-col p-6">
              <CardHeader icon={Clock} tint="#f43f5e" label="Global Sessions" meta="24/5 CLOCK" />
              <div className="mt-5 space-y-3">
                {[
                  { name: "Sydney", hours: "22:00 – 07:00 GMT", active: snap?.status.activeSessions.includes("Sydney") },
                  { name: "Tokyo", hours: "00:00 – 09:00 GMT", active: snap?.status.activeSessions.includes("Tokyo") },
                  { name: "London", hours: "08:00 – 17:00 GMT", active: snap?.status.activeSessions.includes("London") },
                  { name: "New York", hours: "13:00 – 22:00 GMT", active: snap?.status.activeSessions.includes("New York") },
                ].map((s) => (
                  <div
                    key={s.name}
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-colors ${
                      s.active
                        ? "border-emerald-400/30 bg-emerald-400/[0.08]"
                        : "border-white/[0.06] bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          s.active ? "animate-pulse-dot bg-emerald-400" : "bg-white/20"
                        }`}
                      />
                      <span className="text-[13px] font-semibold text-foreground">{s.name}</span>
                    </div>
                    <span className="font-data text-[11px] text-muted-foreground">{s.hours}</span>
                  </div>
                ))}
              </div>
              <p className="mt-auto pt-5 text-[11px] leading-relaxed text-muted-foreground">
                Current regime: <span className="font-bold text-amber-300">{snap?.status.label ?? "24/5 Session"}</span> ({snap?.status.detail})
              </p>
            </div>
          </TiltCard>

          {/* ── Forex Explainers ───────────────────────────── */}
          <TiltCard className="lg:col-span-2" delay={0.24}>
            <div className="flex h-full flex-col p-6">
              <CardHeader icon={GraduationCap} tint="#14b8a6" label="FX Masterclass" meta="Evergreen" />
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                Deep-dive institutional guides linking daily market events to underlying
                currency mechanics — carry trade unwinds, swap spreads, bullion reserves,
                and session overlaps.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Carry Trade", "Swap Lines", "London / NY Overlap", "COT Reports", "Gold Reserve", "DXY Weighting"].map((t) => (
                  <span key={t} className="rounded-full border border-teal-400/20 bg-teal-400/[0.07] px-3 py-1.5 text-[11px] font-medium text-teal-200">
                    {t}
                  </span>
                ))}
              </div>
              <a href="#topics" className="group mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-teal-300 transition-colors hover:text-teal-200">
                Browse FX Guides
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
