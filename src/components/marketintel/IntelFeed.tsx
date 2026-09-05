"use client";

import { motion } from "framer-motion";
import { Clock, ShieldCheck, ArrowUpRight, BadgeCheck } from "lucide-react";
import { INTEL_FEED, type IntelArticle } from "@/lib/market-data";
import { Reveal, SectionHeading } from "./Primitives";

const ACCENTS: Record<IntelArticle["accent"], { bg: string; text: string; ring: string }> = {
  gold: { bg: "bg-amber-400/10", text: "text-amber-300", ring: "group-hover:border-amber-400/35" },
  emerald: { bg: "bg-emerald-400/10", text: "text-emerald-300", ring: "group-hover:border-emerald-400/35" },
  violet: { bg: "bg-violet-400/10", text: "text-violet-300", ring: "group-hover:border-violet-400/35" },
  rose: { bg: "bg-rose-400/10", text: "text-rose-300", ring: "group-hover:border-rose-400/35" },
};

function ArticleCard({ a, i }: { a: IntelArticle; i: number }) {
  const accent = ACCENTS[a.accent];
  const featured = i === 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={`group glass glass-hover relative flex cursor-pointer flex-col overflow-hidden rounded-3xl ${
        featured ? "md:col-span-2 lg:col-span-2 lg:row-span-2" : ""
      }`}
    >
      {/* glow blob */}
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-[70px] opacity-20 transition-opacity duration-500 group-hover:opacity-40 ${
          a.accent === "gold" && "bg-amber-400"
        } ${a.accent === "emerald" && "bg-emerald-400"} ${a.accent === "violet" && "bg-violet-400"} ${
          a.accent === "rose" && "bg-rose-400"
        }`}
      />

      <div className={`relative flex h-full flex-col p-6 ${featured ? "sm:p-8" : ""}`}>
        <div className="flex items-center justify-between gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${accent.bg} ${accent.text}`}>
            {a.category}
          </span>
          {a.sourceTier === "T1" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/[0.07] px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-300">
              <BadgeCheck className="h-3 w-3" />
              T1 OFFICIAL
            </span>
          )}
        </div>

        <h3
          className={`font-heading mt-5 font-bold leading-snug text-white transition-colors duration-300 group-hover:text-amber-200 ${
            featured ? "text-2xl sm:text-[1.9rem] sm:leading-[1.25]" : "text-lg"
          }`}
        >
          {a.title}
        </h3>

        <p className={`mt-3 text-sm leading-relaxed text-muted-foreground ${featured ? "sm:text-[15px]" : "line-clamp-3"}`}>
          {a.summary}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium text-foreground/75">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              {a.source}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {a.publishedAt}
            </span>
            <span>{a.readMins} min read</span>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-all duration-300 group-hover:border-amber-400/50 group-hover:bg-amber-400/10 group-hover:text-amber-300">
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>

        {/* attribution line — PDF rule: attribute clearly */}
        {featured && (
          <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
            Source attribution: {a.source} · Original analysis by MarketIntel desk. No
            republication of third-party articles — enforced through ingestion rules.
          </div>
        )}
      </div>
    </motion.article>
  );
}

export default function IntelFeed() {
  return (
    <section id="intel" className="relative py-24 sm:py-28">
      <div className="pointer-events-none absolute right-0 top-40 h-[380px] w-[380px] rounded-full bg-violet-500/[0.06] blur-[110px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            kicker="Intelligence Feed"
            title={
              <>
                Latest <span className="text-gradient-gold">signal</span>, zero noise
              </>
            }
            sub="Every item carries its source and tier — T1 official (NSE, BSE, SEBI, RBI, PIB) or T2 trade press flagged for discovery only. Original analysis, clear attribution, no republication."
          />
          <Reveal delay={0.15}>
            <div className="glass flex items-center gap-3 rounded-2xl px-5 py-3.5">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <div className="text-xs leading-snug text-muted-foreground">
                <span className="block font-semibold text-foreground/85">Ingestion-rule enforced</span>
                attribution on every record
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {INTEL_FEED.map((a, i) => (
            <ArticleCard key={a.slug} a={a} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
