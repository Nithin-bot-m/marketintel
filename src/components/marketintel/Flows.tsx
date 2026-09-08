"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { FLOWS_MONTHLY, FLOW_SESSIONS, FLOW_FACTS, formatCr } from "@/lib/market-data";
import { Reveal, SectionHeading } from "./Primitives";

function FlowTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-2xl px-4 py-3 text-xs shadow-2xl">
      <div className="mb-2 font-bold text-white">{label} 2026</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6 py-0.5">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className={`font-data font-bold ${p.value >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {formatCr(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Flows() {
  const latest = FLOWS_MONTHLY[FLOWS_MONTHLY.length - 1]; // Aug 2026

  return (
    <section id="flows" className="relative overflow-hidden py-24 sm:py-28">
      <div className="pointer-events-none absolute -left-32 top-1/3 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.05] blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-5">
          {/* copy */}
          <div className="lg:col-span-2">
            <SectionHeading
              index="05"
              kicker="FII / DII Flows"
              title={
                <>
                  Follow the <span className="text-gradient-gold">smart money</span> — both sides of it
                </>
              }
              sub="Foreign flows swung from a record March exodus to the year's strongest inflow in August. Every bar below is a depository-verified monthly figure — no estimates, no fills."
            />

            <Reveal delay={0.15} className="mt-8 grid grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">FII · Aug 2026</div>
                <div className="font-data mt-2 text-2xl font-bold text-emerald-300">
                  {formatCr(latest.fii)}
                </div>
                <div className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  Strongest FPI month of CY26
                </div>
              </div>
              <div className="glass rounded-2xl p-5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-violet-300/80">DII · Last session</div>
                <div className="font-data mt-2 text-2xl font-bold text-emerald-300">
                  {formatCr(FLOW_SESSIONS.dii)}
                </div>
                <div className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  {FLOW_SESSIONS.diiStreak} straight buy sessions (Sep 2–4)
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.22} className="mt-6">
              <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {FLOW_FACTS.sourceLine}
                </p>
              </div>
              <a href="#newsletter" className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-400 transition-colors hover:text-amber-300">
                Get flows in your inbox daily
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Reveal>
          </div>

          {/* chart */}
          <Reveal delay={0.1} y={50} className="lg:col-span-3">
            <motion.div
              whileHover={{ scale: 1.008 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="glass relative overflow-hidden rounded-3xl p-4 sm:p-8"
            >
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">
                    FPI net equity flows — CY 2026
                  </h3>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Monthly, ₹ crore · depository data (NSDL / CDSL) via press-reported figures
                  </p>
                </div>
                <span className="glass rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider text-emerald-300">
                  VERIFIED · OFFICIAL PROVISIONALS
                </span>
              </div>

              <div className="h-[340px] w-full min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={FLOWS_MONTHLY} margin={{ top: 6, right: 6, left: -6, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#8b94a7", fontSize: 11, fontFamily: "var(--font-data)" }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#8b94a7", fontSize: 10, fontFamily: "var(--font-data)" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => (v === 0 ? "0" : `${Math.round(v / 1000)}k`)}
                      domain={[-130000, 40000]}
                    />
                    <Tooltip content={<FlowTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.22)" />
                    <Bar dataKey="fii" name="FPI net" maxBarSize={44} radius={[5, 5, 0, 0]}>
                      {FLOWS_MONTHLY.map((f) => (
                        <Cell key={f.month} fill={f.fii >= 0 ? "#10b981" : "#f43f5e"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                Reading the arc: a record ₹1.18L Cr pulled out in March, moderating through the
                summer before August&apos;s ₹29,631 Cr inflow — the pivot domestic desks had been
                pricing. Session-level provisionals (FII −₹3,112 Cr / DII +₹8,930 Cr on{" "}
                {FLOW_SESSIONS.asOf}) stream on the board above.
              </p>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
