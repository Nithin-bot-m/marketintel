"use client";

import { motion } from "framer-motion";
import {
  Database,
  Filter,
  Wand2,
  PenLine,
  Send,
  ArrowRight,
  Layers,
} from "lucide-react";
import { Reveal, SectionHeading } from "./Primitives";

const STEPS = [
  {
    icon: Database,
    tint: "#f59e0b",
    title: "Collect",
    desc: "NSE & BSE filings, SEBI circulars, RBI releases, PIB briefs — ingested the moment they publish.",
  },
  {
    icon: Filter,
    tint: "#10b981",
    title: "Tier",
    desc: "Every record is tiered: T1 official, T2 trade press, T3 discovery-only. Source is never hidden.",
  },
  {
    icon: Wand2,
    tint: "#8b5cf6",
    title: "Normalize",
    desc: "Shared schema — source, url, published_at, category, tags, summary, attribution, status.",
  },
  {
    icon: PenLine,
    tint: "#f43f5e",
    title: "Analyze",
    desc: "Original MarketIntel analysis added on top. Third-party articles are never republished.",
  },
  {
    icon: Send,
    tint: "#14b8a6",
    title: "Publish",
    desc: "Wraps at 4:30 PM, explainers evergreen, NewsArticle schema for search engines and RSS per category.",
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
              From official filing to your feed —{" "}
              <span className="text-gradient-gold">in five auditable steps</span>
            </>
          }
          sub="The same ingestion pipeline powers all four ISD Intelligence Network channels. Transparency isn't a policy page here — it's the architecture."
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
                      className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0a0e18] shadow-inner"
                      style={{ color: s.tint }}
                    >
                      <s.icon className="h-7 w-7" />
                    </span>
                    <span className="font-data text-4xl font-bold text-white/[0.07] transition-colors duration-500 group-hover:text-white/[0.14]">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="font-heading mt-5 text-lg font-bold text-white">{s.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
                  {i < STEPS.length - 1 && (
                    <ArrowRight className="absolute -right-4 top-[64px] z-20 hidden h-5 w-5 text-white/25 lg:block" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* schema strip */}
        <Reveal delay={0.3} className="mt-12">
          <div className="glass flex flex-wrap items-center justify-center gap-x-2 gap-y-2 rounded-2xl px-6 py-4 text-center">
            <Layers className="mr-1 h-4 w-4 shrink-0 text-amber-400" />
            <span className="text-xs font-semibold text-foreground/80">Shared record schema:</span>
            {["source", "source_tier", "url", "title", "published_at", "category", "tags", "summary", "attribution", "status"].map(
              (f) => (
                <span key={f} className="font-data rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-muted-foreground">
                  {f}
                </span>
              )
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
