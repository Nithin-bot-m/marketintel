"use client";

import { TrendingUp, Network, ShieldCheck, ArrowUpRight } from "lucide-react";
import { NETWORK } from "@/lib/market-data";
import { Reveal } from "./Primitives";

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/[0.07] bg-black/30">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* network strip */}
        <Reveal>
          <div className="glass mb-14 rounded-3xl p-7 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/15 text-violet-300">
                <Network className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-heading text-lg font-bold text-white">ISD Intelligence Network</h3>
                <p className="text-xs text-muted-foreground">One connected intelligence network — four verticals, one standard of rigour.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {NETWORK.map((n) => (
                <div
                  key={n.name}
                  className={`group rounded-2xl border p-4 transition-all duration-300 ${
                    n.live
                      ? "cursor-pointer border-amber-400/30 bg-amber-400/[0.06] hover:border-amber-400/50"
                      : "border-white/[0.07] bg-white/[0.02] opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-heading text-sm font-bold ${n.live ? "text-amber-300" : "text-foreground/80"}`}>
                      {n.name}
                    </span>
                    {n.live ? (
                      <ArrowUpRight className="h-4 w-4 text-amber-300 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    ) : (
                      <span className="rounded-full bg-white/[0.07] px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-muted-foreground">
                        PHASE 2
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{n.vertical} · {n.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* brand */}
          <div className="lg:col-span-2">
            <a href="#top" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden border border-white/15 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <img src="/icon.png" alt="MarketIntel" className="h-full w-full object-cover rounded-xl" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-heading text-lg font-bold tracking-tight text-white">
                  Market<span className="text-gradient-gold">Intel</span>
                </span>
                <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  ISD Intelligence Network
                </span>
              </span>
            </a>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Indian market intelligence built on T1 official sources — NSE, BSE, SEBI
              circulars, RBI releases and PIB economy briefs — distilled into wraps,
              trackers and explainers that respect your time and your compliance radar.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2 text-xs font-medium text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Strictly informational · never investment advice
            </div>
          </div>

          {/* sections */}
          {[
            {
              h: "Coverage",
              links: ["Market Wrap", "IPO Tracker", "Quarterly Results", "FII / DII", "Macro Decoded"],
            },
            {
              h: "Company",
              links: ["About ISD Info Solutions", "Our Data Standards", "Editorial Policy", "Contact Desk", "Careers"],
            },
            {
              h: "Legal",
              links: ["Disclaimer", "Privacy Policy", "Terms of Use", "Attribution Policy", "Grievance Officer"],
            },
          ].map((col) => (
            <div key={col.h}>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.24em] text-foreground/70">{col.h}</h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#top" className="text-sm text-muted-foreground transition-colors duration-300 hover:text-amber-300">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* compliance disclaimer */}
        <div className="mt-14 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="text-[11px] leading-relaxed text-muted-foreground/80">
            <span className="font-semibold text-foreground/70">Disclaimer:</span> MarketIntel is a
            news-and-education property of ISD Info Solutions. All content on this page is strictly
            informational and educational; it does not constitute investment advice, research
            recommendations, or solicitation to trade in securities as regulated by SEBI. Market
            values shown are real exchange quotes (NSE / BSE and global reference instruments)
            served via our market-data provider and may be delayed up to 15 minutes. Institutional
            flows, IPO records and macro prints are compiled from official exchange, depository
            and regulator disclosures, with sources and as-of dates shown inline.
            Consult a SEBI-registered investment adviser before making financial decisions.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.07] pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ISD Info Solutions. MarketIntel —{" "}
            <span className="text-foreground/70">A property of ISD Info Solutions.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
