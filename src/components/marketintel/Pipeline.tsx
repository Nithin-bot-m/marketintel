"use client";

import { motion } from "framer-motion";
import {
  Database,
  Filter,
  Wand2,
  PenLine,
  Send,
  ArrowRight,
} from "lucide-react";
import { SectionHeading } from "./Primitives";

const STEPS = [
  {
    icon: Database,
    tint: "#f59e0b",
    title: "Collect",
    desc: "ForexFactory economic calendar feeds, interbank spot FX rates, central bank communiqués (Fed, ECB, BoE, BoJ), and CFTC filings.",
  },
  {
    icon: Filter,
    tint: "#10b981",
    title: "Tier",
    desc: "Every record is tiered: T1 official central banks & consensus calendar data, T2 institutional desk analysis. Source is never obscured.",
  },
  {
    icon: Wand2,
    tint: "#8b5cf6",
    title: "Normalize",
    desc: "Unified schema — instrument, session, impact, forecast, previous, actual, attribution, and millisecond timestamp.",
  },
  {
    icon: PenLine,
    tint: "#f43f5e",
    title: "Analyze",
    desc: "Original MarketIntel institutional analysis added on top. High-frequency volatility correlation and order flow modeling.",
  },
  {
    icon: Send,
    tint: "#14b8a6",
    title: "Publish",
    desc: "Continuous 24/5 streaming tape, instant economic calendar alerts, and daily wraps at New York session close.",
  },
];

export default function Pipeline() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[860px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.05] blur-[130px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          index="07"
          align="center"
          kicker="How It's Made"
          title={
            <>
              From interbank feed to your terminal —{" "}
              <span className="text-gradient-gold">in five auditable steps</span>
            </>
          }
          sub="High-throughput ingestion pipelines power MarketIntel FX real-time market data. Transparency isn't a policy page here — it's the architecture."
        />

        <div className="relative mt-16">
          {/* connector line (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block" />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 44 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.75, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className="group glass glass-hover relative h-full rounded-3xl p-6">
                  <div className="relative z-10 flex items-center justify-between">
                    <span
                      className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-border bg-card shadow-inner"
                      style={{ color: s.tint }}
                    >
                      <s.icon className="h-7 w-7" />
                    </span>
                    <span className="font-data text-4xl font-bold text-foreground/[0.07] transition-colors duration-500 group-hover:text-foreground/[0.14]">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="font-heading mt-5 text-lg font-bold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
                  {i < STEPS.length - 1 && (
                    <ArrowRight className="absolute -right-4 top-[64px] z-20 hidden h-5 w-5 text-muted-foreground/40 lg:block" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
