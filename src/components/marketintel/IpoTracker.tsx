"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, CalendarClock, Globe, AlertTriangle, ShieldCheck, ArrowUpRight } from "lucide-react";
import { IPOS, VERIFIED_AS_OF } from "@/lib/market-data";
import type { EconomicEvent } from "@/lib/types";
import { Reveal, SectionHeading } from "./Primitives";

const TABS = [
  { key: "HIGH", label: "High Impact (Red Folder)", icon: Flame },
  { key: "MEDIUM", label: "Medium Impact", icon: AlertTriangle },
  { key: "ALL", label: "All Releases", icon: CalendarClock },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const CURRENCY_COLORS: Record<string, string> = {
  USD: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  EUR: "bg-blue-400/15 text-blue-300 border-blue-400/30",
  GBP: "bg-purple-400/15 text-purple-300 border-purple-400/30",
  JPY: "bg-rose-400/15 text-rose-300 border-rose-400/30",
  CAD: "bg-red-400/15 text-red-300 border-red-400/30",
  AUD: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  NZD: "bg-teal-400/15 text-teal-300 border-teal-400/30",
  CHF: "bg-orange-400/15 text-orange-300 border-orange-400/30",
};

function formatEventTime(isoDate: string) {
  try {
    const d = new Date(isoDate);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/New_York",
      hour12: false,
    }).format(d) + " EST";
  } catch {
    return isoDate;
  }
}

function CalendarRow({ event, i }: { event: EconomicEvent; i: number }) {
  const curClass = CURRENCY_COLORS[event.currency] || "bg-white/10 text-white/90 border-white/20";
  const isHigh = event.impact === "High";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={`group grid grid-cols-2 gap-4 rounded-2xl border p-5 transition-all duration-300 sm:grid-cols-4 lg:grid-cols-12 lg:items-center ${
        isHigh
          ? "border-rose-500/20 bg-rose-500/[0.02] hover:border-rose-500/40 hover:bg-rose-500/[0.05]"
          : "border-white/[0.07] bg-white/[0.03] hover:border-amber-400/25 hover:bg-white/[0.05]"
      }`}
    >
      <div className="col-span-2 lg:col-span-5">
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-[11px] font-bold ${curClass}`}>
            {event.currency}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{event.title}</span>
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                  isHigh
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : event.impact === "Medium"
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                    : "bg-white/10 text-muted-foreground border border-white/10"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isHigh ? "bg-rose-400 animate-pulse-dot" : event.impact === "Medium" ? "bg-amber-400" : "bg-white/40"
                  }`}
                />
                {event.impact.toUpperCase()}
              </span>
            </div>
            <div className="font-data mt-0.5 text-[11px] text-muted-foreground">
              {formatEventTime(event.date)} · {event.country}
            </div>
          </div>
        </div>
        {event.note && (
          <div className="mt-2 text-[11px] leading-snug text-muted-foreground/80 pl-12">
            {event.note}
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Forecast</div>
        <div className="font-data mt-1 text-sm font-semibold text-foreground/90">{event.forecast || "—"}</div>
      </div>

      <div className="lg:col-span-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Previous</div>
        <div className="font-data mt-1 text-sm font-semibold text-foreground/70">{event.previous || "—"}</div>
      </div>

      <div className="col-span-2 sm:col-span-1 lg:col-span-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Status / Consensus</div>
        <div className="font-data mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-amber-300">
          {event.actual || "Pending print"}
        </div>
      </div>
    </motion.div>
  );
}

export default function IpoTracker() {
  const [tab, setTab] = useState<TabKey>("HIGH");
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const fetchCalendar = async () => {
      try {
        const res = await fetch("/api/calendar", { cache: "no-store" });
        if (!res.ok) throw new Error("bad calendar status");
        const data = await res.json();
        if (alive && Array.isArray(data.events) && data.events.length > 0) {
          setEvents(data.events);
          setLoading(false);
          return;
        }
      } catch {
        /* fallback to verified items */
      }

      if (alive) {
        // Fallback from static items
        const staticList: EconomicEvent[] = IPOS.map((i) => ({
          title: i.name,
          country: i.kind,
          currency: i.kind,
          date: new Date().toISOString(),
          impact: i.gmp === "HIGH" ? "High" : "Medium",
          forecast: i.priceBand.replace("Forecast: ", "").replace("Target: ", ""),
          previous: i.lot.replace("Prev: ", "").replace("Current: ", ""),
          actual: i.subscription !== "—" ? i.subscription : undefined,
          note: i.note,
        }));
        setEvents(staticList);
        setLoading(false);
      }
    };

    void fetchCalendar();
  }, []);

  const filtered = events.filter((e) => {
    if (tab === "HIGH") return e.impact === "High";
    if (tab === "MEDIUM") return e.impact === "Medium";
    return true;
  });

  return (
    <section id="calendar" className="relative py-24 sm:py-28">
      {/* Anchor for backward compatibility */}
      <span id="ipo" className="sr-only" />

      <div className="pointer-events-none absolute -right-32 top-1/4 h-[380px] w-[380px] rounded-full bg-emerald-500/[0.05] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          index="03"
          kicker="ForexFactory Economic Calendar"
          title={
            <>
              High-impact <span className="text-gradient-gold">economic releases</span>
            </>
          }
          sub="Live data from the weekly ForexFactory economic schedule. High-impact Red Folder releases, consensus forecasts, and previous prints driving interbank currency volatility."
        />

        {/* tab strip */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex gap-2">
            {TABS.map((t) => {
              const active = tab === t.key;
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`group relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 transition-colors ${
                      active
                        ? t.key === "HIGH"
                          ? "text-rose-400"
                          : "text-amber-400"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  <span>{t.label}</span>
                  {active && (
                    <motion.span
                      layoutId="calTabActive"
                      className="absolute inset-0 -z-10 rounded-full border border-white/15 bg-white/[0.08]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div className="font-data text-[11px] text-muted-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-dot" />
            Live weekly feed · Verified as of {VERIFIED_AS_OF}
          </div>
        </div>

        {/* calendar list */}
        <div className="mt-6 space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/[0.03]" />
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.slice(0, 10).map((event, i) => (
                <CalendarRow key={`${event.title}-${i}`} event={event} i={i} />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* ForexFactory source footnote */}
        <Reveal delay={0.2} className="mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                Data provided via ForexFactory weekly calendar telemetry. Impact classifications and scheduled releases are strictly for educational market observation.
              </span>
            </div>
            <a
              href="https://www.forexfactory.com/calendar"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 shrink-0"
            >
              ForexFactory Official
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
