"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FLOWS, formatCr } from "@/lib/market-data";
import { Reveal, SectionHeading } from "./Primitives";

function FlowTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-2xl px-4 py-3 text-xs shadow-2xl">
      <div className="mb-2 font-bold text-white">{label} 2025</div>
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
  const totalFii = FLOWS.reduce((a, f) => a + f.fii, 0);
  const totalDii = FLOWS.reduce((a, f) => a + f.dii, 0);

  return (
    <section id="flows" className="relative overflow-hidden py-24 sm:py-28">
      <div className="pointer-events-none absolute -left-32 top-1/3 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.05] blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-5">
          {/* copy */}
          <div className="lg:col-span-2">
            <SectionHeading
              kicker="FII / DII Flows"
              title={
                <>
                  Follow the <span className="text-gradient-gold">smart money</span> — both sides of it
                </>
              }
              sub="Daily provisional institutional flows, month-archived. When foreign money exits, domestic systematic inflows have repeatedly cushioned Indian equities — see the divergence for yourself."
            />

            <Reveal delay={0.15} className="mt-8 grid grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">FII · YTD net</div>
                <div className={`font-data mt-2 text-2xl font-bold ${totalFii >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  {formatCr(totalFii)}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">Mar – Sep 2025</div>
              </div>
              <div className="glass rounded-2xl p-5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-violet-300/80">DII · YTD net</div>
                <div className={`font-data mt-2 text-2xl font-bold ${totalDii >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  {formatCr(totalDii)}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">Mar – Sep 2025</div>
              </div>
            </Reveal>

            <Reveal delay={0.22} className="mt-6">
              <a href="#newsletter" className="group inline-flex items-center gap-2 text-sm font-semibold text-amber-400 transition-colors hover:text-amber-300">
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
              className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">Monthly net flows — cash segment</h3>
                  <p className="mt-1 text-[11px] text-muted-foreground">Provisional, compiled from NSE & BSE EOD data · ₹ crore</p>
                </div>
                <span className="glass rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider text-emerald-300">
                  LIVE-ISH DEMO
                </span>
              </div>

              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={FLOWS} margin={{ top: 6, right: 6, left: -14, bottom: 0 }} barGap={3}>
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
                      tickFormatter={(v: number) => (v === 0 ? "0" : `${v / 1000}k`)}
                    />
                    <Tooltip content={<FlowTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                    <Legend
                      wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-body)", paddingTop: 10 }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.22)" />
                    <Bar dataKey="fii" name="FII" fill="#10b981" radius={[5, 5, 0, 0]} maxBarSize={26} />
                    <Bar dataKey="dii" name="DII" fill="#8b5cf6" radius={[5, 5, 0, 0]} maxBarSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
