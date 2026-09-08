"use client";

import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import type { CandleBar } from "@/lib/types";
import { useMarketTheme } from "./ThemeContext";

/**
 * Compact animated candlestick chart rendering REAL OHLC bars from the
 * exchange feed — candles rise in sequence when the card scrolls into view,
 * then the last candle "breathes" with a soft glow.
 */
export default function MiniCandles({
  candles,
  up,
  className,
}: {
  candles: CandleBar[] | null; // null = feed still loading
  up: boolean;
  className?: string;
}) {
  const { theme } = useMarketTheme();
  const themeRef = useRef(theme);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrapRef, { once: true, margin: "-40px" });
  const inViewRef = useRef(false);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    inViewRef.current = inView;
  }, [inView]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    if (!candles || candles.length < 4) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // downsample to at most ~34 bars so 1-minute sessions stay readable
    const MAXB = 34;
    let ohlc = candles;
    if (candles.length > MAXB) {
      const step = Math.ceil(candles.length / MAXB);
      const agg: CandleBar[] = [];
      for (let i = 0; i < candles.length; i += step) {
        const grp = candles.slice(i, i + step);
        agg.push({
          t: grp[0].t,
          o: grp[0].o,
          h: Math.max(...grp.map((g) => g.h)),
          l: Math.min(...grp.map((g) => g.l)),
          c: grp[grp.length - 1].c,
          v: grp.reduce((a, g) => a + g.v, 0),
        });
      }
      ohlc = agg;
    }

    const n = ohlc.length;
    const UP =
      themeRef.current === "cyberpunk" || themeRef.current === "matrix"
        ? "#00ff66"
        : "#10b981";
    const DOWN =
      themeRef.current === "cyberpunk"
        ? "#ff0055"
        : themeRef.current === "matrix"
        ? "#ff3366"
        : "#f43f5e";
    const col = up ? UP : DOWN;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = wrap.offsetWidth;
      h = wrap.offsetHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf = 0;
    const t0 = performance.now();
    const STAGGER = 70;
    const GROW = 460;

    const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!inViewRef.current || w < 4 || h < 4) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      let min = Infinity;
      let max = -Infinity;
      for (const c of ohlc) {
        if (c.l < min) min = c.l;
        if (c.h > max) max = c.h;
      }
      const pad = (max - min) * 0.18 || 1;
      min -= pad;
      max += pad;
      const range = max - min || 1;

      const spacing = w / n;
      const bodyW = Math.max(2.5, spacing * 0.5);
      const top = h * 0.1;
      const bottom = h * 0.94;
      const yOf = (v: number) => top + ((max - v) / range) * (bottom - top);

      // baseline gridline
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.round(bottom) + 0.5);
      ctx.lineTo(w, Math.round(bottom) + 0.5);
      ctx.stroke();

      const liveT = (t - t0) / 1000;

      for (let i = 0; i < n; i++) {
        const c = ohlc[i];
        const x = i * spacing + spacing / 2;
        const p = reduced
          ? 1
          : Math.min(1, Math.max(0, (t - t0 - i * STAGGER) / GROW));
        if (p <= 0) continue;
        const e = easeOut(p);
        const isLast = i === n - 1;

        // breathing on last candle after entrance
        let cLive = c.c;
        if (isLast && p >= 1 && !reduced) {
          cLive = c.c + Math.sin(liveT * 2.2 + i) * range * 0.016;
        }

        const yO = yOf(c.o);
        const yC = yOf(cLive);
        const yH = yOf(c.o + (c.h - c.o) * e);
        const yL = yOf(c.o + (c.l - c.o) * e);

        ctx.globalAlpha = 0.35 + 0.65 * e;

        // wick
        ctx.strokeStyle = up ? "rgba(16,185,129,0.65)" : "rgba(244,63,94,0.65)";
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, yH);
        ctx.lineTo(Math.round(x) + 0.5, yL);
        ctx.stroke();

        // body (grows from open toward close)
        const bTop = Math.min(yO, yC);
        const bH = Math.max(1.8, Math.abs(yO - yC));
        if (isLast) {
          ctx.shadowColor = col;
          ctx.shadowBlur = 10 + (p >= 1 && !reduced ? Math.sin(liveT * 2.2) * 3 : 0);
        }
        ctx.fillStyle = col;
        ctx.fillRect(x - bodyW / 2, bTop, bodyW, bH);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // pulsing dot on last close
      if (!reduced) {
        const lastC = ohlc[n - 1];
        const pulse = (Math.sin(liveT * 2.6) + 1) / 2;
        const x = (n - 1) * spacing + spacing / 2;
        const y = yOf(lastC.c);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = up
          ? `rgba(16,185,129,${0.5 * (1 - pulse)})`
          : `rgba(244,63,94,${0.5 * (1 - pulse)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x, y, 3 + pulse * 7, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [candles, up]);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
      {(!candles || candles.length < 4) && (
        <div className="h-full w-full animate-pulse rounded-lg bg-white/[0.05]" />
      )}
    </div>
  );
}
