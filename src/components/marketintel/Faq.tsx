"use client";

import { HelpCircle, ShieldAlert, Zap, Radio, Globe, BarChart2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMarketTheme } from "./ThemeContext";

export const FAQ_DATA = [
  {
    id: "what-is-nfx3",
    q: "What is NFX3 (NFX³) and who is it designed for?",
    a: "NFX3 (also styled as NFX³ or NFX 3) is an institutional-grade, real-time market intelligence platform built for global foreign exchange (Forex) and gold bullion (XAU/USD) traders, analysts, and institutional macro researchers. NFX3 aggregates verified tier-1 macroeconomic data—including central bank policies (Federal Reserve, ECB, BoE, BoJ), ForexFactory high-impact calendar releases, CFTC Commitments of Traders (COT) institutional positioning, and live interbank quotes—delivered in a streamlined, zero-noise terminal experience.",
    icon: Globe,
  },
  {
    id: "xauusd-telemetry",
    q: "How does NFX3 provide live XAU/USD gold bullion telemetry?",
    a: "NFX3 connects directly to institutional interbank feeds via OANDA to provide sub-second spot gold (XAU/USD) price quotes. The hero terminal features a live 1-minute ambient candlestick chart, volume histogram, session percentage movements, and mathematically locked BID/ASK quotes with a tight $0.60 USD interbank spread, updating seamlessly during all global trading sessions 24 hours a day, 5 days a week.",
    icon: Zap,
  },
  {
    id: "forexfactory-integration",
    q: "How does NFX3 integrate the ForexFactory economic calendar?",
    a: "NFX3 continuously ingests economic calendar events directly from ForexFactory. Releases are dynamically categorized into High Impact (Red Folder), Medium Impact, and Low Impact tiers, complete with previous values, market consensus forecasts, actual reported numbers, and real-time countdown clocks synced to UTC/GMT session hours.",
    icon: Radio,
  },
  {
    id: "cftc-cot-positioning",
    q: "What are CFTC COT positioning flows on NFX3?",
    a: "NFX3 decodes the weekly Commitments of Traders (COT) reports published by the US Commodity Futures Trading Commission (CFTC). We track speculative non-commercial net positioning versus commercial hedgers across Gold (XAU) and all G10 currency futures (EUR, GBP, JPY, CAD, CHF, AUD, NZD) alongside IMF COFER global central bank reserve distributions to highlight institutional smart money biases.",
    icon: BarChart2,
  },
  {
    id: "trading-advice-signals",
    q: "Does NFX3 provide trading signals, buy/sell calls, or financial advice?",
    a: "Strictly NO. NFX3 is 100% educational and informational. We generate 0 buy/sell calls, zero signal alerts, and zero financial advice. Our platform is dedicated to transparency, institutional macroeconomic research, and objective market data analysis, empowering traders to make their own informed decisions.",
    icon: ShieldAlert,
  },
  {
    id: "free-and-session-hours",
    q: "Is NFX3 free to use and what are the market hours?",
    a: "Yes, NFX3 is open and free to access for all global market participants. The platform operates 24/5, aligning with international financial centers: Sydney, Tokyo, London, and New York sessions, with automatic market status indicators showing open, pre-open, overlap, or weekend periods.",
    icon: HelpCircle,
  },
];

export default function Faq() {
  const { theme } = useMarketTheme();

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full"
    >
      {/* Decorative ambient background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[300px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-4">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>NFX3 PLATFORM KNOWLEDGE BASE</span>
        </div>
        <h2
          id="faq-heading"
          className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground"
        >
          Frequently Asked Questions About{" "}
          <span className="text-gradient-gold">NFX3</span>
        </h2>
        <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Everything you need to know about NFX3 (NFX³), real-time XAU/USD gold bullion
          telemetry, the ForexFactory economic calendar, and our macro intelligence architecture.
        </p>
      </div>

      <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
        <Accordion type="single" collapsible className="w-full space-y-3">
          {FAQ_DATA.map((item) => {
            const Icon = item.icon;
            return (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="rounded-2xl border border-border/60 bg-background/50 px-5 py-1 transition-colors hover:border-primary/40 data-[state=open]:border-primary/50 data-[state=open]:bg-background/80"
              >
                <AccordionTrigger className="text-left font-heading text-base sm:text-lg font-semibold text-foreground hover:no-underline py-4">
                  <div className="flex items-center gap-3 pr-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{item.q}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-11 pr-4 pt-1 pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </section>
  );
}
