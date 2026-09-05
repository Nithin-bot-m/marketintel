"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Siren } from "lucide-react";
import { CATEGORIES } from "@/lib/market-data";
import { Reveal, SectionHeading } from "./Primitives";

const TOPICS = [
  {
    path: "/ipo-guide",
    title: "The IPO Guide",
    desc: "From DRHP to listing bell — bands, lot sizing, QIB/HNI/retail quotas, anchor books and what subscription numbers really mean.",
    read: "18 min",
    tag: "evergreen",
  },
  {
    path: "/fii-dii-explained",
    title: "FII vs DII, Explained",
    desc: "Who moves Indian markets? Foreign institutions, domestic institutions, and how their tug-of-war sets the market's medium-term tone.",
    read: "12 min",
    tag: "evergreen",
  },
  {
    path: "/repo-corridor",
    title: "RBI & the Repo Corridor",
    desc: "MPC votes, stance language, SDF/MSF walls — decode every policy statement line-by-line with our annotated framework.",
    read: "15 min",
    tag: "evergreen",
  },
];

export default function Topics() {
  return (
    <section id="topics" className="relative py-24 sm:py-28">
      <div className="pointer-events-none absolute right-1/4 top-10 h-[300px] w-[500px] rounded-full bg-amber-500/[0.04] blur-[110px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          kicker="Evergreen Cluster Pages"
          title={
            <>
              Concepts that <span className="text-gradient-gold">compound</span>
            </>
          }
          sub="Topic clusters live at permanent URLs — /ipo-guide, /fii-dii-explained, /repo-corridor — interlinked with every daily article that touches them."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {TOPICS.map((t, i) => (
            <motion.div
              key={t.path}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group glass glass-hover relative flex flex-col overflow-hidden rounded-3xl p-7"
            >
              <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-teal-400/10 blur-[50px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
                  <BookOpen className="h-5 w-5" />
                </span>
                <span className="font-data rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t.tag}
                </span>
              </div>
              <h3 className="font-heading mt-5 text-xl font-bold text-white transition-colors group-hover:text-teal-200">
                {t.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="font-data text-[11px] text-muted-foreground">{t.read} read</span>
                <Link
                  href={t.path}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300 transition-colors hover:text-teal-200"
                >
                  Read guide
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="font-data mt-4 border-t border-white/[0.07] pt-4 text-[11px] text-muted-foreground/70">
                marketintel.isdinfosolutions.com{t.path}
              </div>
            </motion.div>
          ))}
        </div>

        {/* compliance band — PDF: strictly informational */}
        <Reveal delay={0.2} className="mt-12">
          <div className="relative overflow-hidden rounded-3xl border border-amber-400/20 bg-gradient-to-r from-amber-400/[0.07] via-transparent to-rose-400/[0.06] p-7 sm:p-8">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
                <Siren className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h3 className="font-heading text-lg font-bold text-white">Our compliance promise</h3>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  MarketIntel publishes <span className="font-semibold text-amber-200">no buy/sell tips or
                  recommendations</span> — SEBI regulates investment advice, and we stay firmly on the
                  informational side. Content is strictly educational with disclaimers, built on T1
                  official sources with original analysis and clear attribution.
                </p>
              </div>
              <div className="glass shrink-0 rounded-2xl px-5 py-3 text-center">
                <div className="font-heading text-2xl font-bold text-gradient-gold">SEBI-aware</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">by design</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
