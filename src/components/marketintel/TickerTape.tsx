"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { TICKER_BASE, type Ticker } from "@/lib/market-data";

function cls(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TickerTape() {
  const [tickers, setTickers] = useState<Ticker[]>(TICKER_BASE);
  const prev = useRef<Record<string, number>>({});

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const res = await fetch("/api/market", { cache: "no-store" });
        if (!res.ok) return;
        const data: { tickers: Ticker[] } = await res.json();
        if (!alive || !Array.isArray(data.tickers)) return;
        const flashes: Record<string, number> = {};
        data.tickers.forEach((t) => {
          flashes[t.symbol] = prev.current[t.symbol] ?? t.price;
        });
        prev.current = Object.fromEntries(data.tickers.map((t) => [t.symbol, t.price]));
        setTickers(data.tickers);
      } catch {
        /* silent — ticker keeps last state */
      }
    };
    const id = setInterval(poll, 3200);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // duplicate list for seamless -50% loop
  const doubled = [...tickers, ...tickers];

  return (
    <div className="marquee-paused relative w-full overflow-hidden border-y border-white/[0.08] bg-black/40 backdrop-blur-md">
      <div className="animate-marquee flex w-max items-center gap-0 py-2.5">
        {doubled.map((t, i) => {
          const up = t.trend === "up";
          return (
            <div
              key={`${t.symbol}-${i}`}
              className="flex items-center gap-2 border-r border-white/[0.07] px-5"
            >
              <span className="text-[11px] font-bold tracking-wide text-foreground/85">
                {t.symbol}
              </span>
              <span className="font-data text-[11px] text-foreground/60">
                {t.price > 1000 ? Math.round(t.price).toLocaleString("en-IN") : cls(t.price)}
              </span>
              <span
                className={`font-data flex items-center gap-1 text-[11px] font-medium ${
                  up ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {up ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {up ? "+" : ""}
                {t.changePct.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#05070d] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#05070d] to-transparent" />
    </div>
  );
}
