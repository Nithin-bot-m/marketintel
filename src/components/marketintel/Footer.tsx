"use client";

import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-border bg-card/40 backdrop-blur-md">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* brand */}
          <div className="lg:col-span-2">
            <a
              href="#top"
              className="inline-block group mb-5"
              aria-label="NFX³ — Decode The Market"
            >
              <div className="relative inline-flex items-center rounded-2xl bg-[#060812] px-3.5 py-2.5 border border-cyan-500/25 shadow-[0_0_24px_rgba(0,180,255,0.2)] transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/nfx-brand.png?v=12"
                  alt="NFX³ — Decode The Market"
                  className="h-14 sm:h-16 w-auto object-contain"
                />
              </div>
            </a>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              NFX³ Global Markets Intelligence built on verified tier-1 macro sources —
              Federal Reserve, ECB, BoE, Bank of Japan, CFTC COT positioning, and ForexFactory
              economic indicators — decoded into institutional wraps, real-time calendars, and
              currency trackers 24 hours a day, 5 days a week.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Strictly informational · Institutional macro research
            </div>
          </div>

          {/* sections */}
          {[
            {
              h: "Coverage",
              links: [
                { name: "Daily FX Wrap", href: "#wrap" },
                { name: "ForexFactory Calendar", href: "#calendar" },
                { name: "CFTC COT Positioning", href: "#flows" },
                { name: "Central Bank Radar", href: "#intel" },
                { name: "Gold & Bullion Track", href: "#top" },
              ],
            },
            {
              h: "Company",
              links: [
                { name: "About NFX³", href: "#top" },
                { name: "Data Architecture", href: "#pipeline" },
                { name: "Macro Editorial Policy", href: "#topics" },
                { name: "Daily FX Wrap", href: "#wrap" },
                { name: "API Access", href: "#top" },
              ],
            },
            {
              h: "Legal & Standards",
              links: [
                { name: "Forex Risk Warning", href: "#top" },
                { name: "CFTC / NFA Disclosures", href: "#top" },
                { name: "Privacy Policy", href: "#top" },
                { name: "Terms of Use", href: "#top" },
                { name: "Attribution Policy", href: "#top" },
              ],
            },
          ].map((col) => (
            <div key={col.h}>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.24em] text-foreground/70">{col.h}</h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.name}>
                    <a href={l.href} className="text-sm text-muted-foreground transition-colors duration-300 hover:text-amber-500">
                      {l.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* compliance disclaimer */}
        <div className="mt-14 rounded-2xl border border-border bg-card/60 p-5">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground/80">Risk Warning & Educational Notice:</span> NFX³
            is an institutional research and financial education platform. All content on this
            platform is strictly informational; it does not constitute financial, investment, or trading advice, nor is
            it a solicitation to trade foreign exchange, spot metals, or leveraged derivatives. Foreign exchange (Forex)
            and bullion trading carry a high level of risk to capital and may not be suitable for all market participants.
            Live quotes (XAU/USD, EUR/USD, GBP/USD, USD/JPY, DXY) derive from interbank reference feeds, COMEX futures,
            and global market data APIs and may experience latency during market transitions. Economic calendar prints,
            consensus forecasts, and CFTC Commitments of Traders (COT) disclosures are compiled from official statistical
            bureaus, central banks, and regulatory reporting repositories. Consult an accredited financial advisor
            registered with your jurisdiction (e.g., CFTC/NFA, FCA, ESMA, ASIC) before executing financial operations.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NFX³ —{" "}
            <span className="text-foreground/80">Global Forex & Bullion Intelligence.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
