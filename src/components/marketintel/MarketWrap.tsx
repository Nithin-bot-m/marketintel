"use client";

import { useState } from "react";
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
import { FLOWS, MACRO } from "@/lib/market-data";
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

const WRAP_ITEMS = [
  { t: "Benchmarks extend win streak to day 4; breadth strong at 3:2 advancers", tag: "CASH", up: true },
  { t: "Bank pack slips as PSU profit-booking offsets private bank strength", tag: "BANKS", up: false },
  { t: "IT leads sector gainers on soft-dollar tailwind; midcap IT outperforms", tag: "IT", up: true },
  { t: "India VIX cools 2.8% — derivative positioning stays constructive into expiry", tag: "F&O", up: false },
];

export default function MarketWrap() {
  return (
    <section id="wrap" className="relative py-24 sm:py-28">
      {/* ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-amber-500/[0.05] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="The Daily Wrap"
          title={
            <>
              One bento. The entire <span className="text-gradient-gold">trading day.</span>
            </>
          }
          sub="Every evening at 4:30 PM we compress six hours of market action into a single intelligence board — cash, banks, flows, macro and the IPO street."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6">
          {/* ── FEATURE: Market Wrap ───────────────────────────── */}
          <TiltCard className="conic-border md:col-span-2 lg:col-span-4 lg:row-span-2">
            <div className="flex h-full flex-col p-6 sm:p-8">
              <CardHeader icon={Newspaper} tint="#f59e0b" label="Market Wrap · Today" meta="4:30 PM IST" />
              <h3 className="font-heading mt-6 text-2xl font-bold leading-snug text-white sm:text-3xl">
                Sensex, Nifty extend rally for a 4th session as IT and metals shine;
                banks take a breather
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                Benchmark indices closed firmly higher for a fourth consecutive session,
                with the Nifty holding above the psychological 24,800 mark. Gains were
                broad-based — 1,842 advancers against 1,214 decliners on the NSE — while
                India VIX cooled to 13.42, signalling constructive positioning into the
                weekly expiry. FII provisionals turned positive after three weeks of
                outflows.
              </p>

              {/* wrap rows */}
              <div className="mt-8 grid flex-1 content-start gap-3">
                {WRAP_ITEMS.map((w, i) => (
                  <Reveal key={w.tag} delay={0.08 * i} y={18}>
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
                ))}
              </div>

              <a
                href="#intel"
                className="group mt-8 inline-flex w-fit items-center gap-2 text-sm font-semibold text-amber-400 transition-colors hover:text-amber-300"
              >
                Read the full wrap
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </TiltCard>

          {/* ── IPO mini tracker ───────────────────────────── */}
          <TiltCard className="lg:col-span-2" delay={0.08}>
            <div className="flex h-full flex-col p-6">
              <CardHeader icon={Rocket} tint="#10b981" label="IPO Street" meta="2 live" />
              <div className="mt-5 space-y-4">
                {[
                  { n: "Premier E-Solutions", s: 8.42, d: "Day 2 of 3" },
                  { n: "Bharat Cold Logistics", s: 3.17, d: "Day 1 of 2" },
                ].map((ipo) => (
                  <div key={ipo.n}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium text-foreground/90">{ipo.n}</span>
                      <span className="font-data shrink-0 text-sm font-bold text-emerald-400">
                        {ipo.s.toFixed(2)}×
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.min(100, ipo.s * 10)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300"
                      />
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{ipo.d} · overall subscription</div>
                  </div>
                ))}
              </div>
              <a href="#ipo" className="group mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-emerald-400 transition-colors hover:text-emerald-300">
                Open IPO tracker
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </TiltCard>

          {/* ── FII/DII today ───────────────────────────── */}
          <TiltCard className="lg:col-span-2" delay={0.12}>
            <div className="flex h-full flex-col p-6">
              <CardHeader icon={BarChart3} tint="#8b5cf6" label="Provisional Flows" meta="EOD" />
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">FII</div>
                  <div className="font-data mt-1.5 text-xl font-bold text-emerald-300">+₹4,812 Cr</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">net buy · first in 3 wks</div>
                </div>
                <div className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.06] p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-violet-300/80">DII</div>
                  <div className="font-data mt-1.5 text-xl font-bold text-violet-300">+₹5,264 Cr</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">14th straight session</div>
                </div>
              </div>
              {/* mini flow bars */}
              <div className="mt-6 flex h-16 items-end gap-1.5" aria-hidden>
                {FLOWS.slice(-7).map((f, i) => (
                  <motion.div
                    key={f.month}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${Math.min(100, (Math.abs(f.fii) / 13000) * 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.15 + i * 0.06, ease: "easeOut" }}
                    className={`flex-1 rounded-t-md ${f.fii >= 0 ? "bg-emerald-400/60" : "bg-rose-400/60"}`}
                    title={`${f.month}: ${f.fii}`}
                  />
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">FII net flow · last 7 sessions</p>
              <a href="#flows" className="group mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-violet-300 transition-colors hover:text-violet-200">
                Full flow history
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </TiltCard>

          {/* ── Macro dashboard ───────────────────────────── */}
          <TiltCard className="lg:col-span-2" delay={0.16}>
            <div className="flex h-full flex-col p-6">
              <CardHeader icon={Landmark} tint="#fbbf24" label="Macro Radar" meta="RBI · PIB" />
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
                Sourced from RBI statements, PIB economy releases & MOSPI prints —
                attributed, never aggregated silently.
              </p>
            </div>
          </TiltCard>

          {/* ── Quarterly results ───────────────────────────── */}
          <TiltCard className="lg:col-span-2" delay={0.2}>
            <div className="flex h-full flex-col p-6">
              <CardHeader icon={FileText} tint="#f43f5e" label="Results Season" meta="Q2 FY26" />
              <div className="mt-5 space-y-3.5">
                {[
                  { n: "TCS", v: "+4.2%", k: "EBITDA margin beat" },
                  { n: "INFY", v: "+2.8%", k: "CC growth in-line" },
                  { n: "HDFC Bank", v: "+9.1%", k: "NII growth YoY" },
                ].map((r) => (
                  <div key={r.n} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3 transition-colors hover:border-rose-400/20">
                    <span className="font-data w-20 shrink-0 text-sm font-bold text-white">{r.n}</span>
                    <span className="font-data text-sm font-semibold text-emerald-300">{r.v}</span>
                    <span className="ml-auto truncate text-[11px] text-muted-foreground">{r.k}</span>
                  </div>
                ))}
              </div>
              <p className="mt-auto pt-5 text-[11px] text-muted-foreground">
                Standardised result-cards built from exchange filings — compare quarters at a glance.
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
