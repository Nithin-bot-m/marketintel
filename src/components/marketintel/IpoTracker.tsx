"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, CalendarClock, PartyPopper, TrendingUp, TrendingDown, Info } from "lucide-react";
import { IPOS, VERIFIED_AS_OF, type IPOItem } from "@/lib/market-data";
import { Reveal, SectionHeading } from "./Primitives";

const TABS = [
  { key: "LIVE", label: "Live", icon: Flame },
  { key: "UPCOMING", label: "Upcoming", icon: CalendarClock },
  { key: "LISTED", label: "Listed", icon: PartyPopper },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function subMultiple(s?: string): number {
  if (!s) return 0;
  const v = parseFloat(s.replace("×", "").replace(",", ""));
  return isFinite(v) ? v : 0;
}

function IpoRow({ ipo, i }: { ipo: IPOItem; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group grid grid-cols-2 gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition-all duration-300 hover:border-amber-400/25 hover:bg-white/[0.05] sm:grid-cols-4 lg:grid-cols-12 lg:items-center"
    >
      <div className="col-span-2 lg:col-span-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-violet-400/20 text-[11px] font-bold text-amber-300">
            {ipo.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-white">{ipo.name}</span>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-muted-foreground">
                {ipo.kind.toUpperCase()}
              </span>
            </div>
            <div className="font-data text-[11px] text-muted-foreground">
              {ipo.status === "LIVE" && `Open · ${ipo.window}`}
              {ipo.status === "UPCOMING" && ipo.window}
              {ipo.status === "LISTED" && `Listed ${ipo.listedAt}`}
            </div>
          </div>
        </div>
        {ipo.note && (
          <div className="mt-1.5 pl-[46px] text-[11px] leading-snug text-muted-foreground/80">
            {ipo.note}
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Price band</div>
        <div className="font-data mt-1 text-sm font-semibold text-foreground/90">{ipo.priceBand}</div>
      </div>

      <div className="lg:col-span-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Lot</div>
        <div className="font-data mt-1 text-sm font-semibold text-foreground/90">{ipo.lot}</div>
      </div>

      {ipo.status === "LISTED" ? (
        <div className="lg:col-span-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Listing vs issue</div>
          <div
            className={`font-data mt-1 inline-flex items-center gap-1.5 text-sm font-bold ${
              (ipo.listingGain ?? 0) >= 0 ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {(ipo.listingGain ?? 0) >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {(ipo.listingGain ?? 0) >= 0 ? "+" : ""}
            {(ipo.listingGain ?? 0).toFixed(1)}% · debut {ipo.note?.includes("₹230") ? "₹230 NSE" : "—"}
          </div>
        </div>
      ) : (
        <div className="lg:col-span-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
            {ipo.status === "LIVE" ? "Subscribed" : "GMP"}
          </div>
          <div className="font-data mt-1 text-sm font-bold text-emerald-300">
            {ipo.status === "LIVE" ? ipo.subscription ?? "—" : ipo.gmp}
          </div>
        </div>
      )}

      {ipo.status !== "LISTED" && (
        <div className="col-span-2 lg:col-span-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, subMultiple(ipo.subscription) * 8)}%` }}
              transition={{ duration: 1.1, delay: 0.2 + i * 0.07, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400"
            />
          </div>
          <div className="mt-1.5 text-[10px] text-muted-foreground">
            {ipo.status === "LIVE" ? "day-wise momentum" : "awaiting opening bell"}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function IpoTracker() {
  const [tab, setTab] = useState<TabKey>("LIVE");
  const list = IPOS.filter((x) => x.status === tab);

  return (
    <section id="ipo" className="relative py-24 sm:py-28">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            index="04"
            kicker="IPO Intelligence"
            title={
              <>
                The IPO street, <span className="text-gradient-gold">tracked end-to-end</span>
              </>
            }
            sub="Price bands, lots, subscription velocity and listing outcomes — compiled from price-band filings, exchange issue pages and verified market press. Educational data only; not a subscription recommendation."
          />
          {/* tabs */}
          <Reveal delay={0.15}>
            <div className="glass inline-flex rounded-full p-1" role="tablist" aria-label="IPO status filter">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                    tab === t.key ? "text-black" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  {tab === t.key && (
                    <motion.span
                      layoutId="ipo-tab"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    />
                  )}
                  <t.icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{t.label}</span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-12 min-h-[220px] space-y-4">
          <AnimatePresence mode="wait">
            {list.length > 0 ? (
              list.map((ipo, i) => <IpoRow key={ipo.name} ipo={ipo} i={i} />)
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground"
              >
                No verified {tab.toLowerCase()} issues to show right now — the desk refreshes this
                board each morning from the exchange issue pages.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Reveal delay={0.1} className="mt-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 font-data text-[10px] uppercase tracking-wider text-muted-foreground">
              <span className="h-px w-8 bg-gradient-to-r from-amber-400 to-transparent" />
              Compiled from RHP / price-band filings &amp; exchange notices · verified {VERIFIED_AS_OF}
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-violet-400/15 bg-violet-400/[0.05] px-5 py-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground/85">Compliance note:</span> grey-market
                premium (GMP) is an unofficial, unregulated over-the-counter quote. MarketIntel only
                publishes GMP where independently verified — SEBI does not regulate GMP and it should
                never be treated as an expected listing outcome.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
