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
import { ArrowUpRight, ShieldCheck, PieChart } from "lucide-react";
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
      <div className="mb-2 font-bold text-foreground">{label} 2026</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6 py-0.5">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-data font-bold text-amber-300">
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
      <div className="pointer-events-none absolute -left-32 top-1/3 h-[420px] w-[420px] rounded-full bg-amber-500/[0.05] blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-5">
          {/* copy */}
          <div className="lg:col-span-2">
            <SectionHeading
              index="04"
              kicker="Institutional Positioning"
              title={
                <>
                  Follow the <span className="text-gradient-gold">smart money</span> — CFTC COT positioning
                </>
              }
              sub="The Commodity Futures Trading Commission (CFTC) Commitment of Traders report tracks institutional hedge funds and asset managers across Gold and FX futures. Verified contract open interest — no estimates."
            />

            <Reveal delay={0.15} className="mt-8 grid grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">Gold COT · Speculative</div>
                <div className="font-data mt-2 text-2xl font-bold text-amber-300">
                  {formatCr(latest.fii)}
                </div>
                <div className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  Highest institutional length in 4 years
                </div>
              </div>
              <div className="glass rounded-2xl p-5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-violet-300/80">EUR COT · Speculative</div>
                <div className="font-data mt-2 text-2xl font-bold text-violet-300">
                  {formatCr(FLOW_SESSIONS.dii)}
                </div>
                <div className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  6-month steady accumulation
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.22} className="mt-6">
              <div className="flex items-start gap-2.5 rounded-2xl border border-amber-400/15 bg-amber-400/[0.05] px-4 py-3.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {FLOW_FACTS.sourceLine}
                </p>
              </div>
              <a href="#intel" className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-400 transition-colors hover:text-amber-300">
                Explore Institutional Macro Briefs
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
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Gold (XAU/USD) Speculative Net Length — CY 2026
                  </h3>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Monthly Non-Commercial Net Futures Contracts · Source: CFTC Weekly Reports
                  </p>
                </div>
                <span className="glass rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider text-amber-500 dark:text-amber-300">
                  CFTC · VERIFIED OPEN INTEREST
                </span>
              </div>

              <div className="h-[340px] w-full min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={FLOWS_MONTHLY} margin={{ top: 6, right: 6, left: -6, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="rgba(150,150,150,0.15)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#8b94a7", fontSize: 11, fontFamily: "var(--font-data)" }}
                      axisLine={{ stroke: "rgba(150,150,150,0.2)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#8b94a7", fontSize: 10, fontFamily: "var(--font-data)" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                      domain={[150000, 310000]}
                    />
                    <Tooltip content={<FlowTooltip />} cursor={{ fill: "rgba(150,150,150,0.06)" }} />
                    <ReferenceLine y={0} stroke="rgba(150,150,150,0.25)" />
                    <Bar dataKey="fii" name="Gold Net Longs" maxBarSize={44} radius={[5, 5, 0, 0]}>
                      {FLOWS_MONTHLY.map((f) => (
                        <Cell key={f.month} fill="#f59e0b" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* IMF Global Foreign Exchange Reserves breakdown */}
              <div className="mt-5 rounded-2xl border border-border bg-card/60 p-4">
                <div className="flex items-center gap-2 mb-2 font-data text-xs font-bold text-foreground">
                  <PieChart className="h-4 w-4 text-emerald-400" />
                  IMF COFER Global Reserve Allocations
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center pt-1">
                  {[
                    { cur: "USD", share: "58.4%" },
                    { cur: "EUR", share: "20.0%" },
                    { cur: "JPY", share: "5.5%" },
                    { cur: "GBP", share: "4.9%" },
                    { cur: "CAD", share: "2.5%" },
                    { cur: "AUD", share: "2.1%" },
                  ].map((r) => (
                    <div key={r.cur} className="rounded-lg bg-white/[0.04] py-1.5 px-2">
                      <div className="font-data text-[10px] text-muted-foreground font-bold">{r.cur}</div>
                      <div className="font-data text-xs font-bold text-emerald-300">{r.share}</div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                Institutional narrative: Smart money net long exposure in Gold rose from 182,400 contracts
                in March to 284,500 contracts in August as central banks accelerated sovereign bullion reserves.
                Speculative long positioning confirms structural tailwinds supporting spot XAU/USD above $4,400/oz.
              </p>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
