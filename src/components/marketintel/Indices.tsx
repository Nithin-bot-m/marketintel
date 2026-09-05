"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { INDICES, formatINR, type IndexQuote } from "@/lib/market-data";
import { Reveal, SectionHeading } from "./Primitives";
import MiniCandles from "./MiniCandles";

/* animated count-up */
function useCountUp(target: number, active: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return val;
}


function IndexCard({ idx, i }: { idx: IndexQuote; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const up = idx.trend === "up";
  const animated = useCountUp(idx.value, inView);

  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -py * 7, ry: px * 9 });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 800 }}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
    >
      <motion.div
        animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
        className="glass glass-hover group relative h-full overflow-hidden rounded-2xl p-5"
      >
        {/* top accent line */}
        <div
          className={`absolute inset-x-0 top-0 h-[2px] ${
            up
              ? "bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent"
              : "bg-gradient-to-r from-transparent via-rose-400/70 to-transparent"
          } opacity-60 transition-opacity duration-500 group-hover:opacity-100`}
        />
        <div className="flex items-start justify-between">
          <div>
            <div className="font-data text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">
              {idx.symbol}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/70">{idx.name}</div>
          </div>
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-1 font-data text-[11px] font-bold ${
              up ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400"
            }`}
          >
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {up ? "+" : ""}
            {idx.changePct.toFixed(2)}%
          </span>
        </div>

        <div
          className={`font-data mt-4 text-[26px] font-bold tracking-tight ${
            up ? "text-emerald-300" : "text-rose-300"
          }`}
        >
          {formatINR(animated)}
        </div>
        <div className={`mt-0.5 font-data text-xs ${up ? "text-emerald-400/80" : "text-rose-400/80"}`}>
          {up ? "+" : "−"}
          {formatINR(Math.abs(idx.change))} pts today
        </div>

        <div className="mt-4">
          <MiniCandles data={idx.spark} up={up} className="h-16 w-full" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Indices() {
  return (
    <section className="relative py-24 sm:py-28" id="pulse">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            index="01"
            kicker="Market Pulse"
            title={
              <>
                Today&apos;s benchmark <span className="text-gradient-gold">temperature</span>
              </>
            }
            sub="Provisional closing snapshot across headline indices — live candles retrace the session's intraday arc. Data refreshed from exchange feeds; strictly informational."
          />
          <Reveal delay={0.15}>
            <div className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emerald-400" />
              Simulated session · demo feed
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {INDICES.map((idx, i) => (
            <IndexCard key={idx.symbol} idx={idx} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
