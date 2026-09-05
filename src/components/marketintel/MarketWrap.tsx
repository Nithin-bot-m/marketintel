"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  Rocket,
  BarChart3,
  Landmark,
  FileText,
  GraduationCap,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  FLOWS_MONTHLY,
  FLOW_SESSIONS,
  IPOS,
  MACRO,
  WRAP_FACTS,
  formatCr,
  formatINR,
} from "@/lib/market-data";
import type { MarketSnapshot } from "@/lib/types";
import { Reveal, SectionHeading } from "./Primitives";

function TiltCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
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
        className="glass glass-hover relative h-full overflow-hidden rounded-3xl"
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
      t: `Breadth ${b.advancers}:${b.decliners} advancers-to-decliners across the ${b.universe} basket`,
      tag: "BREADTH",
      up: b.advancers >= b.decliners,
    });
  }
  const sortedSectors = [...snap.sectors].sort((a, z) => z.changePct - a.changePct);
  if (sortedSectors.length >= 2) {
    const top = sortedSectors[0];
    const lag = sortedSectors[sortedSectors.length - 1];
    rows.push({
      t: `${top.label} leads sector board at ${top.changePct >= 0 ? "+" : ""}${top.changePct.toFixed(2)}%`,
      tag: "SECTOR",
      up: top.changePct >= 0,
    });
    rows.push({
      t: `${lag.label} sits at the bottom of the sector board (${lag.changePct >= 0 ? "+" : ""}${lag.changePct.toFixed(2)}%)`,
      tag: "SECTOR",
      up: lag.changePct >= 0,
    });
  }
  if (snap.vix) {
    rows.push({
      t: `India VIX at ${snap.vix.price.toFixed(2)} (${snap.vix.changePct >= 0 ? "+" : ""}${snap.vix.changePct.toFixed(2)}%) — volatility regime stays constructive`,
      tag: "F&O",
      up: snap.vix.changePct < 0,
    });
  }
  const g = snap.movers?.gainers?.[0];
  const l = snap.movers?.losers?.[0];
  if (g) {
    rows.push({
      t: `Top large-cap mover: ${g.name} ${g.changePct >= 0 ? "+" : ""}${g.changePct.toFixed(2)}% (NIFTY 50 basket)`,
      tag: "CASH",
      up: g.changePct >= 0,
    });
  }
  if (l) {
    rows.push({
      t: `Weakest on the day: ${l.name} ${l.changePct >= 0 ? "+" : ""}${l.changePct.toFixed(2)}% (NIFTY 50 basket)`,
      tag: "CASH",
      up: l.changePct >= 0,
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
  const nifty = snap?.indices.find((q) => q.symbol === "NIFTY 50");
  const sensex = snap?.indices.find((q) => q.symbol === "SENSEX");
  const liveIpos = IPOS.filter((i) => i.status === "LIVE");

  const ordinal = (n: number) => {
    const rem10 = n % 10;
    const rem100 = n % 100;
    if (rem10 === 1 && rem100 !== 11) return `${n}st`;
    if (rem10 === 2 && rem100 !== 12) return `${n}nd`;
    if (rem10 === 3 && rem100 !== 13) return `${n}rd`;
    return `${n}th`;
  };

  return (
    <section id="wrap" className="relative py-24 sm:py-28">
      {/* ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-amber-500/[0.05] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          index="02"
          kicker="The Daily Wrap"
          title={
            <>
              One bento. The entire <span className="text-gradient-gold">trading day.</span>
            </>
          }
          sub="Live board metrics stream from the exchange feed; session context is our verified wrap of the last close. Cash, banks, flows, macro and the IPO street — one intelligence board."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6">
          {/* ── FEATURE: Market Wrap ───────────────────────────── */}
          <TiltCard className="conic-border md:col-span-2 lg:col-span-4 lg:row-span-2">
            <div className="flex h-full flex-col p-6 sm:p-8">
              <CardHeader
                icon={Newspaper}
                tint="#f59e0b"
                label="Market Wrap"
                meta={nifty ? `LIVE BOARD · ${snap?.status.istTime} IST` : "SYNCING FEED"}
              />
              <h3 className="font-heading mt-6 text-2xl font-bold leading-snug text-white sm:text-3xl">
                {nifty && sensex ? (
                  <>
                    Nifty {formatINR(nifty.price, 2)}{" "}
                    <span className={nifty.changePct >= 0 ? "text-emerald-400" : "text-rose-400"}>
                      ({nifty.changePct >= 0 ? "+" : ""}
                      {nifty.changePct.toFixed(2)}%)
                    </span>{" "}
                    · Sensex{" "}
                    <span className={sensex.changePct >= 0 ? "text-emerald-400" : "text-rose-400"}>
                      {sensex.changePct >= 0 ? "+" : "−"}
                      {formatINR(Math.abs(sensex.change), 0)} pts
                    </span>
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
                Read the full wrap
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </TiltCard>

          {/* ── IPO mini tracker ───────────────────────────── */}
          <TiltCard className="lg:col-span-2" delay={0.08}>
            <div className="flex h-full flex-col p-6">
              <CardHeader icon={Rocket} tint="#10b981" label="IPO Street" meta={`${liveIpos.length} live`} />
              <div className="mt-5 space-y-4">
                {liveIpos.map((ipo) => (
                  <div key={ipo.name}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium text-foreground/90">{ipo.name}</span>
                      <span className="font-data shrink-0 text-sm font-bold text-emerald-400">
                        {ipo.subscription ?? "—"}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "62%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300"
                      />
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {ipo.window} · {ipo.kind} issue
                    </div>
                  </div>
                ))}
                {IPOS.filter((i) => i.status === "UPCOMING").slice(0, 1).map((ipo) => (
                  <div key={ipo.name} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium text-foreground/85">Next: {ipo.name}</span>
                      <span className="font-data shrink-0 text-[11px] text-amber-300/90">{ipo.window}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">Band {ipo.priceBand}</div>
                  </div>
                ))}
              </div>
              <a href="#ipo" className="group mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-emerald-400 transition-colors hover:text-emerald-300">
                Open IPO tracker
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </TiltCard>

          {/* ── FII/DII today (verified provisionals) ───────────────────────────── */}
          <TiltCard className="lg:col-span-2" delay={0.12}>
            <div className="flex h-full flex-col p-6">
              <CardHeader icon={BarChart3} tint="#8b5cf6" label="Provisional Flows" meta={FLOW_SESSIONS.asOf.toUpperCase()} />
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.06] p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-rose-300/80">FII · Cash</div>
                  <div className={`font-data mt-1.5 text-xl font-bold ${FLOW_SESSIONS.fii >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                    {formatCr(FLOW_SESSIONS.fii)}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">net sell · {FLOW_SESSIONS.asOf}</div>
                </div>
                <div className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.06] p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-violet-300/80">DII · Cash</div>
                  <div className={`font-data mt-1.5 text-xl font-bold ${FLOW_SESSIONS.dii >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                    {formatCr(FLOW_SESSIONS.dii)}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {ordinal(FLOW_SESSIONS.diiStreak)} straight buy day
                  </div>
                </div>
              </div>
              {/* mini flow bars — verified monthly FPI series */}
              <div className="mt-6 flex h-16 items-end gap-1.5" aria-hidden>
                {FLOWS_MONTHLY.map((f, i) => {
                  const pos = f.fii >= 0;
                  return (
                    <motion.div
                      key={f.month}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${Math.max(6, (Math.abs(f.fii) / 120000) * 100)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: 0.15 + i * 0.06, ease: "easeOut" }}
                      className={`w-full self-end rounded-t-md ${pos ? "bg-emerald-400/60" : "bg-rose-400/60"}`}
                      title={`${f.month} ${f.year}: ${formatCr(f.fii)}`}
                      style={{ alignSelf: "flex-end" }}
                    />
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                FPI net equity flows · Mar – Aug 2026 · ₹ crore
              </p>
              <a href="#flows" className="group mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-violet-300 transition-colors hover:text-violet-200">
                Full flow history
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </TiltCard>

          {/* ── Macro dashboard (verified prints) ───────────────────────────── */}
          <TiltCard className="lg:col-span-2" delay={0.16}>
            <div className="flex h-full flex-col p-6">
              <CardHeader icon={Landmark} tint="#fbbf24" label="Macro Radar" meta="RBI · GSTN" />
              <div className="mt-5 divide-y divide-white/[0.06]">
                {MACRO.map((m) => (
                  <div key={m.label} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <div className="text-sm font-medium text-foreground/90">{m.label}</div>
                      <div className="text-[11px] text-muted-foreground">{m.sub}</div>
                    </div>
                    <div className={`font-data text-base font-bold ${m.trend === "up" ? "text-emerald-300" : "text-rose-300"}`}>
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-auto pt-4 text-[11px] leading-relaxed text-muted-foreground">
                Verified official prints — RBI policy statements, GSTN releases &amp; RBI weekly
                statistical supplement. As-of dates on every row.
              </p>
            </div>
          </TiltCard>

          {/* ── Quarterly results (verified) ───────────────────────────── */}
          <TiltCard className="lg:col-span-2" delay={0.2}>
            <div className="flex h-full flex-col p-6">
              <CardHeader icon={FileText} tint="#f43f5e" label="Results Season" meta="Q1 FY27" />
              <div className="mt-5 space-y-3.5">
                {[
                  { n: "TCS · Revenue", v: "+14% YoY", k: "₹72,275 Cr · Q1 FY27" },
                  { n: "TCS · Net profit", v: "+5% YoY", k: "₹13,349 Cr · Q1 FY27" },
                  { n: "TCS · Deal wins", v: "$9.5B", k: "TCV · AI run-rate $2.6B" },
                ].map((r) => (
                  <div key={r.n} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3 transition-colors hover:border-rose-400/20">
                    <span className="w-28 shrink-0 text-[13px] font-semibold text-white">{r.n}</span>
                    <span className="font-data text-sm font-semibold text-emerald-300">{r.v}</span>
                    <span className="ml-auto truncate text-[11px] text-muted-foreground">{r.k}</span>
                  </div>
                ))}
              </div>
              <p className="mt-auto pt-5 text-[11px] leading-relaxed text-muted-foreground">
                Reported 15 Jul 2026, from exchange filings — standardised result-cards as the
                Q2 FY27 season approaches.
              </p>
            </div>
          </TiltCard>

          {/* ── Explainers ───────────────────────────── */}
          <TiltCard className="lg:col-span-2" delay={0.24}>
            <div className="flex h-full flex-col p-6">
              <CardHeader icon={GraduationCap} tint="#14b8a6" label="Learn as you read" meta="Evergreen" />
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                Every wrap links its jargon to an evergreen explainer — GMP, anchor
                lock-ins, FII flows, repo corridors. Build your market base while
                staying daily-current.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["GMP", "Anchor lock-in", "Repo corridor", "FII/DII", "Breadth", "VIX"].map((t) => (
                  <span key={t} className="rounded-full border border-teal-400/20 bg-teal-400/[0.07] px-3 py-1.5 text-[11px] font-medium text-teal-200">
                    {t}
                  </span>
                ))}
              </div>
              <a href="#topics" className="group mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-teal-300 transition-colors hover:text-teal-200">
                Browse explainers
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
