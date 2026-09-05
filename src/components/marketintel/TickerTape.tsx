"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { MarketSnapshot, Ticker } from "@/lib/types";

function cls(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TickerTape() {
  const [tickers, setTickers] = useState<Ticker[] | null>(null);
  const [statusLabel, setStatusLabel] = useState<string>("NSE · BSE");
  const [open, setOpen] = useState<boolean | null>(null);
  const prev = useRef<Record<string, number>>({});

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const res = await fetch("/api/market", { cache: "no-store" });
        if (!res.ok) return;
        const data: MarketSnapshot = await res.json();
        if (!alive || !Array.isArray(data.tickers)) return;
        setTickers(data.tickers);
        setOpen(data.status.state === "open" || data.status.state === "preopen");
        setStatusLabel(
          data.status.state === "open"
            ? `LIVE · ${data.status.istTime} IST`
            : data.status.state === "preopen"
              ? "PRE-OPEN"
              : `CLOSED · ${data.status.detail.toUpperCase()}`,
        );
      } catch {
        /* silent — ticker keeps last state */
      }
    };
    void poll();
    const id = setInterval(poll, 15_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // skeleton while the first real payload arrives — never fake numbers
  if (!tickers) {
    return (
      <div className="relative w-full overflow-hidden border-y border-white/[0.08] bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3 py-3">
          <span className="font-data ml-5 shrink-0 text-[10px] font-bold tracking-[0.18em] text-amber-300/80">
            LOADING EXCHANGE FEED
          </span>
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className="h-3 w-28 animate-pulse rounded-full bg-white/[0.07]"
              style={{ animationDelay: `${i * 90}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // duplicate list for seamless -50% loop
  const doubled = [...tickers, ...tickers];

  return (
    <div className="marquee-paused relative w-full overflow-hidden border-y border-white/[0.08] bg-black/40 backdrop-blur-md">
      <div className="animate-marquee flex w-max items-center gap-0 py-2.5">
        {/* status cell leads each loop half for a seamless -50% marquee */}
        {doubled.map((t, i) => {
          const lead = i % (tickers.length + 1) === 0;
          if (lead) {
            return (
              <div
                key={`status-${i}`}
                className="flex items-center gap-2 border-r border-white/[0.07] px-5"
              >
                <span className="relative flex h-1.5 w-1.5">
                  {open && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  )}
                  <span
                    className={`relative inline-flex h-1.5 w-1.5 rounded-full ${open ? "bg-emerald-400" : "bg-amber-400"}`}
                  />
                </span>
                <span className="font-data text-[10px] font-bold tracking-[0.18em] text-amber-300/90">
                  {statusLabel}
                </span>
              </div>
            );
          }
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
